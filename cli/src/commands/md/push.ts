import { Command, Flags } from "@oclif/core";
import { getVcards } from "../../services/carddav/carddav.service";
import { getContext } from "../../shared.utils";

export default class MdPush extends Command {
  static description = "describe the command here";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    // flag with a value (-n, --name=VALUE)
    name: Flags.string({ char: "n", description: "name to print" }),
    // flag with no value (-f, --force)
    force: Flags.boolean({ char: "f" }),
  };

  static args = [{ name: "file" }];

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MdPush);

    const context = await getContext(this);

    this.debug("got context #5mjOU9");
    this.debug(context);
    return;

    const vcards = await getVcards(context);

    // const contacts = await getcont;
  }
}
