import { Command } from "@cliffy/command";
import { syncCommand } from "./commands/sync.ts";
import { mdImportCommand } from "./commands/md/import.ts";
import { mdPushCommand } from "./commands/md/push.ts";
import { carddavFetchCommand } from "./commands/carddav/fetch.ts";
import { carddavListCommand } from "./commands/carddav/list.ts";
import { carddavWipeCommand } from "./commands/carddav/wipe.ts";

await new Command()
  .name("md2carddav")
  .version("0.1.1")
  .description("Sync between markdown/yaml contacts and CardDAV")
  .command("sync", syncCommand)
  .command(
    "md",
    new Command()
      .description("Commands related to local markdown contacts")
      .command("import", mdImportCommand)
      .command("push", mdPushCommand)
  )
  .command(
    "carddav",
    new Command()
      .description("Commands related to CardDAV server contacts")
      .command("fetch", carddavFetchCommand)
      .command("list", carddavListCommand)
      .command("wipe", carddavWipeCommand)
  )
  .parse(Deno.args);
