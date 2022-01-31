/* eslint-disable no-await-in-loop */
import { Command, Flags } from "@oclif/core";
import {
  getClientAndAccount,
  getVCards,
} from "../../services/carddav/carddav.service";
import { getMdContacts } from "../../services/md/md.service";
import { generateVcardFromContact } from "../../services/vcard/vcard.service";
import { getContext } from "../../shared.utils";

export default class MdPush extends Command {
  static description =
    `Push contacts from markdown to CardDAV\n` +
    `Load all contacts from markdown, load all contacts from CardDAV. Find ` +
    `any contacts which need created or updated on the CardDAV server, and ` +
    `then create or update them.`;

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    quiet: Flags.boolean({
      char: "q",
      description: "Only output critical errors. Overrides --verbose.",
    }),
    verbose: Flags.boolean({
      char: "v",
      description: "Output more information about each step in the process.",
    }),
  };

  protected errors: string[] = [];

  protected logError(
    { verbose }: { quiet: boolean; verbose: boolean },
    error: string
  ): void {
    this.errors.push(error);
    if (verbose) {
      this.log(error);
    }
  }

  protected logErrors({
    quiet,
    verbose,
  }: {
    quiet: boolean;
    verbose: boolean;
  }): void {
    if (this.errors.length > 0 && !quiet) {
      this.log(
        `The following ${this.errors.length} errors were encountered. #U1nWXy`
      );
      for (const error of this.errors) {
        this.log(error);
      }
    }
  }

  protected logVerbose(
    { quiet, verbose }: { quiet: boolean; verbose: boolean },
    message: string
  ): void {
    if (!quiet && verbose) {
      this.log(message);
    }
  }

  protected successes = 0;

  public async run(): Promise<void> {
    const { flags } = await this.parse(MdPush);

    const context = await getContext(this);

    const {
      config: {
        carddav: { syncAddressBookDisplayName },
        md: { directory: mdDirectory },
      },
    } = context;
    if (typeof syncAddressBookDisplayName === "undefined") {
      this.error(
        "syncAddressBookDisplayName must be set to use this commmand. #NwUjk3"
      );
    }

    this.debug("Got context #5mjOU9", context);
    this.logVerbose(
      flags,
      "Connecting to CardDAV server. Can take several minutes. #p5UwNl"
    );

    const clientAndAccount = await getClientAndAccount(context);
    this.debug("Got client and account #0ShLHl");

    const addressBooks = await getVCards(context, clientAndAccount);
    for (const addressBook of addressBooks) {
      this.debug("Got vcards #Oh7EXz", addressBook, addressBook.vcards);
    }

    const addressBook = addressBooks.find(
      ({ displayName }) => displayName === syncAddressBookDisplayName
    );

    if (typeof addressBook === "undefined") {
      this.error(
        "Cannot find address book that matches syncAddressBookDisplayName. #ewDxnI"
      );
    }

    const { vcards } = addressBook;

    this.logVerbose(flags, `Found ${vcards.length} VCards. #vGWp2R`);

    const contacts = await getMdContacts(context);
    this.debug("Got contacts #iI2F1l", contacts.length, contacts);

    this.logVerbose(
      flags,
      `Found ${contacts.length} markdown contacts. #aofT8L`
    );

    const { client } = clientAndAccount;

    for (const contact of contacts) {
      if ("error" in contact) {
        this.logError(
          flags,
          `Failed to parse contact from markdown. #9O7zQK ${contact.file.fullPath}`
        );
        continue;
      }

      const {
        contact: { uid },
      } = contact;
      const vcard = await generateVcardFromContact(
        mdDirectory,
        contact.contact
      );

      const existingVcard = vcards.find((vcard) => vcard.uid === uid);

      if (typeof existingVcard === "undefined") {
        this.debug("Did not find existing vcard to update #HriKMD", uid);

        const result = await client.createVCard({
          addressBook,
          filename: `${uid}.vcf`,
          vCardString: vcard,
        });

        if (!result.ok) {
          this.logError(
            flags,
            `Failed to create new VCard #bifKkH UID: ${uid}, Result: ${result}`
          );
          continue;
        }

        this.logVerbose(
          flags,
          `Successfully created new VCard #r5gYBn UID: ${uid}`
        );
        this.successes++;
        continue;
      }

      this.debug("Found existing vcard to update #svKzvh", uid);

      if (vcard === existingVcard.vcard.data) {
        this.debug("No changes in vcard, skipping update #B07yJK", uid);
        this.logVerbose(
          flags,
          `Skipping VCard which does not require update #ivh1lh UID: ${uid}`
        );
        this.successes++;
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
        this.logError(
          flags,
          `Failed to update VCard #4Xb28G UID: ${uid}, Result: ${result}`
        );
        continue;
      }

      this.debug("Successfully updated vcard #V6VG0x", uid, vcard, result);
      this.logVerbose(
        flags,
        `Successfully synced changes to VCard #tp11hW UID: ${uid}`
      );
      this.successes++;
    }

    if (!flags.quiet) {
      this.log(`Successfully pushed ${this.successes} contacts. #ptqg2v`);
    }

    this.logErrors(flags);
  }
}
