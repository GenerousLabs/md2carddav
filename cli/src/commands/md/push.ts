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
        `#U1nWXy The following ${this.errors.length} errors were encountered.`
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
        "#NwUjk3 syncAddressBookDisplayName must be set to use this commmand."
      );
    }

    this.debug("Got context #5mjOU9", context);
    this.logVerbose(
      flags,
      "#p5UwNl Connecting to CardDAV server. Can take several minutes."
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
        "#ewDxnI Cannot find address book that matches syncAddressBookDisplayName."
      );
    }

    const { vcards } = addressBook;

    this.logVerbose(flags, `Found ${vcards.length} VCards. #vGWp2R`);

    const contacts = await getMdContacts(context);
    this.debug("Got contacts #iI2F1l", contacts.length, contacts);

    this.logVerbose(
      flags,
      `#aofT8L Found ${contacts.length} markdown contacts.`
    );

    const { client } = clientAndAccount;

    for (const contact of contacts) {
      if ("error" in contact) {
        this.logError(
          flags,
          `#9O7zQK Failed to parse contact from markdown. ${contact.file.fullPath}`
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
        this.debug("#HriKMD Did not find existing vcard to update", uid);

        const result = await client.createVCard({
          addressBook,
          filename: `${uid}.vcf`,
          vCardString: vcard,
        });

        if (!result.ok) {
          this.logError(
            flags,
            `#bifKkH Failed to create new VCard UID: ${uid}, Result: ${result}`
          );
          continue;
        }

        this.logVerbose(
          flags,
          `#r5gYBn Successfully created new VCard  UID: ${uid}`
        );
        this.successes++;
        continue;
      }

      this.debug("#svKzvh Found existing vcard to update", uid);

      if (vcard === existingVcard.vcard.data) {
        this.debug("#B07yJK No changes in vcard, skipping update", uid);
        this.logVerbose(
          flags,
          `#ivh1lh Skipping VCard which does not require update  UID: ${uid}`
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
          `#4Xb28G Failed to update VCard UID: ${uid}, Result: ${result}`
        );
        continue;
      }

      this.debug("#V6VG0x Successfully updated vcard", uid, vcard, result);
      this.logVerbose(
        flags,
        `#tp11h Successfully synced changes to VCard UID: ${uid}`
      );
      this.successes++;
    }

    if (!flags.quiet) {
      this.log(`#ptqg2v Successfully pushed ${this.successes} contacts.`);
    }

    this.logErrors(flags);
  }
}
