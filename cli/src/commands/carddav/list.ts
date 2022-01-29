import { Command } from "@oclif/core";
import { getClientAndAccount } from "../../services/carddav/carddav.service";
import { getContext } from "../../shared.utils";

export default class CarddavList extends Command {
  static description =
    "List all address books on the configured CardDAV server";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  public async run(): Promise<void> {
    const context = await getContext(this);

    const { client, account } = await getClientAndAccount(context);

    const addressBooks = await client.fetchAddressBooks({ account });

    for (const addressBook of addressBooks) {
      const { url, displayName } = addressBook;

      if (typeof displayName === "string") {
        this.log(displayName);
        continue;
      }

      this.warn(`This address book is missing a name. #j4s08u ${url}`);
      this.debug(addressBook);
      this.log(url);
    }
  }
}
