import { Command } from "@cliffy/command";
import {
  getClientAndAccount,
  getVCards,
} from "../../services/carddav/carddav.service.ts";
import { getMdContacts } from "../../services/md/md.service.ts";
import {
  areVCardsEquivalent,
  generateVcardFromContact,
} from "../../services/vcard/vcard.service.ts";
import { makeContext } from "../context.ts";

export const mdPushCommand = new Command()
  .description(
    "Push contacts from markdown to CardDAV.\n\n" +
      "Loads all contacts from markdown, loads all contacts from CardDAV,\n" +
      "then creates or updates any contacts that need syncing."
  )
  .option("-q, --quiet", "only output critical errors (overrides --verbose)")
  .option("-v, --verbose", "output more information about each step")
  .action(async ({ quiet, verbose }) => {
    const ctx = await makeContext(verbose);

    const {
      config: {
        carddav: { syncAddressBookDisplayName },
        md: { directory: mdDirectory },
      },
    } = ctx;

    if (typeof syncAddressBookDisplayName === "undefined") {
      ctx.error("#NwUjk3 syncAddressBookDisplayName must be set to use this command.");
    }

    if (!quiet && verbose) ctx.log("#p5UwNl Connecting to CardDAV server. Can take several minutes.");

    const clientAndAccount = await getClientAndAccount(ctx);
    const addressBooks = await getVCards(ctx, clientAndAccount);

    const addressBook = addressBooks.find(
      ({ displayName }) => displayName === syncAddressBookDisplayName
    );

    if (typeof addressBook === "undefined") {
      ctx.error("#ewDxnI Cannot find address book that matches syncAddressBookDisplayName.");
    }

    // deno-lint-ignore no-non-null-assertion
    const { vcards } = addressBook!;

    if (!quiet && verbose) ctx.log(`Found ${vcards.length} VCards. #vGWp2R`);

    const contacts = await getMdContacts(ctx);

    if (!quiet && verbose) ctx.log(`#aofT8L Found ${contacts.length} markdown contacts.`);

    const { client } = clientAndAccount;

    const errors: string[] = [];
    let successes = 0;
    let contactsCreated = 0;
    let contactsUpdated = 0;
    let contactsSkipped = 0;

    const logError = (msg: string) => {
      errors.push(msg);
      if (verbose && !quiet) ctx.log(msg);
    };

    for (const contact of contacts) {
      if ("error" in contact) {
        logError(
          `#9O7zQK Failed to parse contact from markdown. ${contact.file.fullPath}  Error was: ${contact.error}`
        );
        continue;
      }

      const {
        contact: { uid },
        file: { basename, fullPath: _fullPath },
      } = contact;

      const vcard = await generateVcardFromContact(mdDirectory, contact.contact);
      const existingVcard = vcards.find((v: { uid?: string }) => v.uid === uid);

      if (typeof existingVcard === "undefined") {
        const result = await client.createVCard({
          // deno-lint-ignore no-non-null-assertion
          addressBook: addressBook!,
          filename: `${uid}.vcf`,
          vCardString: vcard,
        });

        if (!result.ok) {
          logError(`#bifKkH Failed to create new VCard ${basename}, Result: ${JSON.stringify(result)}`);
          continue;
        }

        if (!quiet && verbose) ctx.log(`#r5gYBn Successfully created new VCard ${basename}`);
        successes++;
        contactsCreated++;
        continue;
      }

      if (
        areVCardsEquivalent(ctx, {
          first: vcard,
          second: existingVcard.vcard.data,
        })
      ) {
        if (!quiet && verbose) ctx.log(`#ivh1lh Skipping VCard which does not require update ${basename}`);
        successes++;
        contactsSkipped++;
        continue;
      }

      const result = await client.updateVCard({
        vCard: {
          url: existingVcard.vcard.url,
          etag: existingVcard.vcard.etag,
          data: vcard,
        },
      });

      if (!result.ok) {
        logError(`#4Xb28G Failed to update VCard ${basename}, Result: ${JSON.stringify(result)}`);
        continue;
      }

      if (!quiet && verbose) ctx.log(`#tp11h Successfully synced changes to VCard ${basename}`);
      successes++;
      contactsUpdated++;
    }

    if (!quiet) {
      ctx.log(
        `#ptqg2v Successfully pushed ${successes} contacts. Created ${contactsCreated}, updated ${contactsUpdated}, and skipped ${contactsSkipped}.`
      );
    }

    if (errors.length > 0 && !quiet) {
      ctx.log(`#U1nWXy The following ${errors.length} errors were encountered.`);
      for (const err of errors) ctx.log(err);
    }
  });
