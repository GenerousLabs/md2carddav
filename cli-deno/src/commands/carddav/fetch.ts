import { Command } from "@cliffy/command";
import { ensureDir } from "@std/fs";
import { join } from "@std/path";
import slugify from "npm:slugify";
import {
  getClientAndAccount,
  getVCards,
} from "../../services/carddav/carddav.service.ts";
import { makeContext } from "../context.ts";

export const carddavFetchCommand = new Command()
  .description(
    "Fetch VCF files from CardDAV server into a local directory.\n\n" +
      "Connects to your configured CardDAV server, retrieves all address books,\n" +
      "fetches every VCard, and saves them to your target directory.\n" +
      "Files are saved as: {addressbook-slug}/{uid}.vcf"
  )
  .option("-d, --directory <path:string>", "path to save VCF files", { required: true })
  .option("-v, --verbose", "output more information about each step")
  .action(async ({ directory, verbose }) => {
    const ctx = await makeContext(verbose);
    const clientAndAccount = await getClientAndAccount(ctx);
    const addressBooks = await getVCards(ctx, clientAndAccount);

    if (verbose) ctx.log(`#1mV657 Got ${addressBooks.length} address books.`);

    for (const addressBook of addressBooks) {
      const { vcards, displayName } = addressBook;

      if (typeof displayName === "undefined" || typeof displayName !== "string") {
        ctx.warn("Found address book without display name. #1kyeDg");
        continue;
      }

      const slug = slugify(displayName as string);

      for (const card of vcards) {
        if (typeof card.vcard.data !== "string") {
          ctx.warn("Found vcard without data. #tTKwcI");
          continue;
        }

        if (typeof card.uid === "undefined") {
          ctx.warn("Found vcard without uid. #0W953Y");
          continue;
        }

        const dirPath = join(directory, slug);
        await ensureDir(dirPath);
        const writePath = join(dirPath, `${card.uid}.vcf`);
        await Deno.writeTextFile(writePath, card.vcard.data);
      }

      if (verbose) {
        ctx.log(
          `#58HoPP Fetched ${vcards.length} VCards for address book named "${displayName}"`
        );
      }
    }
  });
