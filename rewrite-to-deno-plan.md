# Plan: Port `cli/` from Node.js to Deno

## Context

The existing `cli/` directory contains a Node.js CLI (`md2carddav`) built on oclif and distributed via `yarn link`. The goal is to rebuild it in Deno so it can be compiled into a standalone binary with `deno compile` — no Node.js required on the target system.

The new version lives in `cli-deno/` (parallel to `cli/`). Same config file format, same command names and flags, same behavior.

---

## Library Strategy

| Node package | Deno replacement |
|---|---|
| `@oclif/core` | `jsr:@cliffy/command@^1.1.0` |
| `cosmiconfig` | Custom walker (see config loading below) |
| `fs-jetpack` + `readdirp` | `jsr:@std/fs` (`walk`) + `Deno.*` |
| `nanoid` | `crypto.randomUUID()` (built-in) |
| `zod` | `jsr:@zod/zod@^4.4.3` |
| `@covve/easy-vcard` | **Vendored ESM rewrite** in `vendor/easy-vcard/` |
| `obj-clean` | Inline ~15-line recursive utility |
| `tsdav` | `npm:tsdav` (Deno npm compat — resolves cleanly, uses built-in `fetch`) |
| `vcfer` | `npm:vcfer` |
| `gray-matter` | `npm:gray-matter` |
| `slugify` | `npm:slugify` |
| `fast-deep-equal` | `npm:fast-deep-equal` |
| `mocha` + `chai` | `Deno.test` + `jsr:@std/assert` |

**Why vendor `@covve/easy-vcard`:** `patch-package` can't be used in a Deno binary. The library is two CJS files (~300 lines total) that use `lodash.isempty` and `lodash.clonedeep`. We rewrite them as ESM TypeScript with the patch already applied, `isEmpty` inlined as a 3-line helper, and `cloneDeep` replaced by `structuredClone` (Deno built-in).

**The patch** (from `cli/patches/@covve+easy-vcard+1.1.0.patch`) changes two lines in `formatter.js:e()`:
```
- split(',').join('\,')    →    split(',').join('\\\,')
- split(';').join('\;')    →    split(';').join('\\\;')
```

---

## Directory Structure

```
cli-deno/
├── deno.json                   # import map, tasks, compiler options
├── src/
│   ├── main.ts                 # root Command + wires up all subcommands
│   ├── shared/
│   │   ├── constants.ts        # CONTACT_EXTENSION
│   │   ├── schemas.ts          # ContactSchema (Zod)
│   │   ├── config.ts           # ConfigSchema (Zod)
│   │   ├── types.ts            # CommandContext (decoupled from oclif)
│   │   ├── obj-clean.ts        # inline recursive empty-property stripper
│   │   └── utils.ts            # config file walker + getContext()
│   ├── commands/
│   │   ├── sync.ts
│   │   ├── md/import.ts
│   │   ├── md/push.ts
│   │   ├── carddav/fetch.ts
│   │   ├── carddav/list.ts
│   │   └── carddav/wipe.ts
│   └── services/               # mostly direct ports; replace Node FS with Deno
│       ├── carddav/carddav.service.ts
│       ├── md/md.service.ts
│       ├── md/services/contacts/contacts.service.ts
│       ├── md/services/file/file.service.ts
│       ├── md/services/files/files.service.ts
│       ├── md/services/markdown/markdown.service.ts
│       ├── vcard/vcard.service.ts
│       └── vcard/services/photos/photos.service.ts
├── vendor/
│   └── easy-vcard/
│       ├── formatter.ts        # ESM rewrite of formatter.js, patch applied
│       ├── vcard.ts            # ESM rewrite of vcard.js
│       └── mod.ts              # re-exports VCard, Formatter
└── test/
    └── services/vcard/vcard.service.test.ts   # port existing tests
```

---

## `deno.json` Key Config

```json
{
  "tasks": {
    "build": "deno compile --allow-net --allow-read --allow-write --allow-env -o md2carddav src/main.ts",
    "test": "deno test --allow-net --allow-read --allow-write --allow-env test/",
    "check": "deno check src/main.ts"
  },
  "imports": {
    "@cliffy/command": "jsr:@cliffy/command@^1.1.0",
    "@std/fs": "jsr:@std/fs@^1.0.16",
    "@std/path": "jsr:@std/path@^1.1.1",
    "@std/yaml": "jsr:@std/yaml@^1.0.5",
    "@std/assert": "jsr:@std/assert@^1.0.19",
    "@std/encoding": "jsr:@std/encoding@^1.0.10",
    "zod": "jsr:@zod/zod@^4.4.3"
  }
}
```

npm packages imported inline with `npm:` prefix.

---

## Key Architecture Decisions

### CLI Framework (cliffy)
Each command is a standalone `Command` instance exported from its file:
```typescript
// commands/carddav/list.ts
export const carddavListCommand = new Command()
  .description("List address books on the CardDAV server")
  .action(async () => { ... });
```

Root wires them together:
```typescript
await new Command()
  .name("md2carddav")
  .command("sync", syncCommand)
  .command("md", new Command()
    .command("import", mdImportCommand)
    .command("push", mdPushCommand))
  .command("carddav", new Command()
    .command("fetch", carddavFetchCommand)
    .command("list", carddavListCommand)
    .command("wipe", carddavWipeCommand))
  .parse(Deno.args);
```

### Config Loading (replaces cosmiconfig)
Walk up from `Deno.cwd()` trying: `.md2carddavrc.json`, `.md2carddavrc.yaml`, `.md2carddavrc.yml`, `.md2carddavrc` (as JSON), `package.json` (check `"md2carddav"` key). Parse YAML with `@std/yaml`. Validate with `ConfigSchema.safeParse`. Backward-compatible with all existing config file formats.

### `CommandContext` type
Remove the oclif `Command` dependency from types:
```typescript
export type CommandContext = {
  log(...args: unknown[]): void;
  warn(message: string): void;
  error(message: string): never;
  debug(...args: unknown[]): void;
  config: z.infer<typeof ConfigSchema>;
};
```
`getContext()` takes plain function args instead of `this: Command`.

### Node FS → Deno FS
- `fs-jetpack.readAsync` → `Deno.readTextFile`
- `fs-jetpack.writeAsync` → `Deno.writeTextFile` / `Deno.writeFile`  
- `readdirp` → `walk()` from `@std/fs` (returns same shape: `fullPath`, `basename`, `path`)
- `fs-jetpack.inspectAsync` → `Deno.stat`
- Directory creation → `ensureDir()` from `@std/fs`

### Photos
- `fs.readFile` → `Deno.readFile` (returns `Uint8Array`)
- `Buffer.from(data, "base64")` → `decodeBase64(data)` from `@std/encoding`
- `buf.toString("base64")` → `encodeBase64(bytes)` from `@std/encoding`

### Debug
Replace oclif's namespaced debug with: check `Deno.env.get("DEBUG")`, output to stderr when `--verbose` flag is set.

---

## Implementation Order

**Phase 1 — Scaffold**
1. `cli-deno/deno.json`
2. `vendor/easy-vcard/` — ESM rewrite of formatter + vcard with patch applied

**Phase 2 — Shared modules**
3. `shared/constants.ts` — trivial copy
4. `shared/schemas.ts` — ContactSchema, adapt zod import
5. `shared/config.ts` — ConfigSchema, adapt zod import
6. `shared/types.ts` — remove oclif dependency
7. `shared/obj-clean.ts` — inline utility
8. `shared/utils.ts` — config walker + getContext

**Phase 3 — Services (bottom-up)**
9. `md/services/contacts/contacts.service.ts` — direct copy
10. `md/services/file/file.service.ts` — replace fs-jetpack
11. `md/services/files/files.service.ts` — replace readdirp with `walk()`
12. `md/services/markdown/markdown.service.ts` — direct copy (gray-matter via npm:)
13. `vcard/services/photos/photos.service.ts` — replace Buffer with @std/encoding
14. `vcard/vcard.service.ts` — vendor import, inline obj-clean, npm: for vcfer/slugify/fast-deep-equal
15. `md/md.service.ts` — direct port
16. `carddav/carddav.service.ts` — `npm:tsdav`, direct port

**Phase 4 — Commands (simple → complex)**
17. `carddav/list.ts` — simplest, validates cliffy pattern
18. `carddav/wipe.ts`
19. `carddav/fetch.ts`
20. `md/push.ts`
21. `md/import.ts` — most complex (nanoid→randomUUID, Buffer→@std/encoding, gray-matter.stringify)
22. `sync.ts`
23. `main.ts`

**Phase 5 — Tests + Build**
24. Port vcard.service tests to Deno.test + @std/assert
25. `deno task build` → verify binary works
26. Smoke-test: `./md2carddav --help`, `./md2carddav carddav list`

---

## Critical Files

| File | Why it matters |
|---|---|
| `cli/src/shared.utils.ts` | cosmiconfig logic to replace |
| `cli/src/services/vcard/vcard.service.ts` | largest service; all special cases |
| `cli/src/commands/md/import.ts` | most complex command; most Node-specific APIs |
| `cli/src/services/md/services/files/files.service.ts` | readdirp replacement shapes all callers |
| `cli/node_modules/@covve/easy-vcard/dist/vcard/vcard.js` | source for ESM vendor rewrite |
| `cli/node_modules/@covve/easy-vcard/dist/formatter/formatter.js` | source for ESM vendor rewrite (patch already applied) |

---

## Verification

```bash
# Type check
cd cli-deno && pkgx deno task check

# Tests
pkgx deno task test

# Compile binary
pkgx deno task build

# Smoke tests
./md2carddav --help
./md2carddav md --help
./md2carddav carddav list          # requires config file
./md2carddav md import -d /path/to/vcfs
```

The binary must work without Node installed — verify on a system without Node or by temporarily uninstalling it.
