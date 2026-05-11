import { Command } from "@cliffy/command";
import { getClientAndAccount } from "../../services/carddav/carddav.service.ts";
import { makeContext } from "../context.ts";

export const carddavListCommand = new Command()
  .description("List all address books on the configured CardDAV server")
  .action(async () => {
    const ctx = await makeContext();
    const { client, account } = await getClientAndAccount(ctx);
    const addressBooks = await client.fetchAddressBooks({ account });

    for (const addressBook of addressBooks) {
      const { url, displayName } = addressBook;
      if (typeof displayName === "string") {
        ctx.log(displayName);
        continue;
      }
      ctx.warn(`This address book is missing a name. #j4s08u ${url}`);
      ctx.log(url ?? "");
    }
  });
