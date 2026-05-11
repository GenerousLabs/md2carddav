import { parse as parseYaml } from "@std/yaml";
import { dirname, join } from "@std/path";
import { ConfigSchema } from "./config.ts";
import { CommandContext } from "./types.ts";

async function findConfig(): Promise<unknown> {
  const searchNames = [
    ".md2carddavrc.json",
    ".md2carddavrc.yaml",
    ".md2carddavrc.yml",
    ".md2carddavrc",
    "package.json",
  ];

  let dir = Deno.cwd();

  while (true) {
    for (const name of searchNames) {
      const filepath = join(dir, name);
      try {
        const text = await Deno.readTextFile(filepath);
        if (name === "package.json") {
          const pkg = JSON.parse(text);
          if (pkg["md2carddav"]) return pkg["md2carddav"];
          continue;
        }
        if (name.endsWith(".yaml") || name.endsWith(".yml")) {
          return parseYaml(text);
        }
        return JSON.parse(text);
      } catch {
        // file not found or parse error — try next
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  throw new Error("Failed to find config. #1GBTBQ");
}

const getConfig = async (
  error: CommandContext["error"]
): Promise<CommandContext["config"]> => {
  let raw: unknown;
  try {
    raw = await findConfig();
  } catch (e) {
    return error(e instanceof Error ? e.message : "Failed to find config. #1GBTBQ");
  }

  const result = ConfigSchema.safeParse(raw);
  if (!result.success) {
    return error(`Config is invalid. #P46JQn ${result.error.toString()}`);
  }

  return result.data;
};

export const getContext = async (
  log: CommandContext["log"],
  warn: CommandContext["warn"],
  error: CommandContext["error"],
  debug: CommandContext["debug"]
): Promise<CommandContext> => {
  const config = await getConfig(error);
  return { log, warn, error, debug, config };
};

export const extendDebugIfPossible = <T>(debug: T, _name: string): T => debug;
