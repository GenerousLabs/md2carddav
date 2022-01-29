import { Command, Flags } from "@oclif/core";

export default class CarddavList extends Command {
  static description =
    "List all address books on the configured CardDAV server";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    // flag with a value (-n, --name=VALUE)
    name: Flags.string({ char: "n", description: "name to print" }),
    // flag with no value (-f, --force)
    force: Flags.boolean({ char: "f" }),
  };

  static args = [{ name: "file" }];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(CarddavList);
    this.log("list", args, flags);
  }
}
