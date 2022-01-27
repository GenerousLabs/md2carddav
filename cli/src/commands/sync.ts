import { Command, Flags } from "@oclif/core";

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
    const { args, flags } = await this.parse(Sync);

    this.log("Works", { args, flags });
  }
}
