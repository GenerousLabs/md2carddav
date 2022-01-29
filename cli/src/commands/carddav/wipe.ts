import { Command, Flags } from "@oclif/core";

export default class CarddavWipe extends Command {
  static description = `delete every contact in an address book
  This command is extremely destructive, it will delete every contact in a given address book. It is highly recommended to run fetch first and take a backup.
  Why? This command can be useful if you want to delete all contacts and then push again from markdown. Otherwise contacts will never be deleted.`;

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    // flag with a value (-n, --name=VALUE)
    name: Flags.string({ char: "n", description: "name to print" }),
    // flag with no value (-f, --force)
    force: Flags.boolean({ char: "f" }),
  };

  static args = [{ name: "file" }];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(CarddavWipe);

    if (!flags.force) {
      this.log("Refusing to run without the --force flag.");
      return;
    }

    this.log("list #6NPfxJ", args, flags);
  }
}
