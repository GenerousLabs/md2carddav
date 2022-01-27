import { Command, Flags } from "@oclif/core";
import { getFilesFromPath } from "../services/files/files.service";

export default class Sync extends Command {
  static description = "Sync from markdown to CardDAV";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    directory: Flags.string({
      char: "d",
      description: "path to markdown files",
      required: true,
    }),
    // flag with no value (-f, --force)
    force: Flags.boolean({ char: "f" }),
  };

  static args = [];

  public async run(): Promise<void> {
    const { flags } = await this.parse(Sync);

    const files = await getFilesFromPath(flags.directory);

    this.log(`Works #3JvfHi`);
    this.log(`Found ${files.length} files.`);
  }
}
