import { Command } from "@cliffy/command";
import { getClientAndAccount } from "../../services/carddav/carddav.service.ts";
import { makeContext } from "../context.ts";

export const carddavWipeCommand = new Command()
  .description(
    "Delete every contact in an address book.\n" +
      "This command is extremely destructive. It is recommended to run fetch first and take a backup.\n" +
      "Use the list command to find address book names."
  )
  .option("-a, --address-book <name:string>", "address book to wipe", { required: true })
  .option("-f, --force", "required to actually run the wipe")
  .option("-v, --verbose", "output more information")
  .action(async ({ addressBook, force, verbose }) => {
    if (!force) {
      console.error("error: Refusing to run without the --force flag.");
      Deno.exit(1);
    }

    const ctx = await makeContext(verbose);
    const { client, account } = await getClientAndAccount(ctx);
    const addressBooks = await client.fetchAddressBooks({ account });

    const found = addressBooks.find(({ displayName }) => displayName === addressBook);

    if (typeof found === "undefined") {
      ctx.error("Invalid address book. Not found on the configured CardDAV server. #4UruD6");
    }

    // deno-lint-ignore no-non-null-assertion
    const vCards = await client.fetchVCards({ addressBook: found! });

    for (const vCard of vCards) {
      await client.deleteVCard({ vCard });
      if (verbose) ctx.log(`Deleted #L5cPlO ${vCard.url}`);
    }

    ctx.log(`Deleted ${vCards.length} contacts #xFTULL`);
  });
