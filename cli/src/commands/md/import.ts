import { Command, Flags } from "@oclif/core";
import { exists, readAsync, writeAsync } from "fs-jetpack";
import * as matter from "gray-matter";
import { nanoid } from "nanoid/non-secure";
import { join, resolve } from "path";
import * as readdirp from "readdirp";
import { generateContactFromVcard } from "../../services/vcard/vcard.service";
import { CONTACT_EXTENSION } from "../../shared.constants";
import { Contact } from "../../shared.types";
import { getContext } from "../../shared.utils";

export default class MdImport extends Command {
  static description = "Import a directory of .vcf files into markdown";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    directory: Flags.string({
      char: "d",
      description: "directory of .vcf files",
      required: true,
    }),
    "add-meta": Flags.boolean({
      char: "m",
      description: "Add id, created, updated metadata fields to all contacts.",
    }),
    verbose: Flags.boolean({
      char: "v",
      description: "Output more detail as the program runs.",
    }),
  };

  public async run(): Promise<void> {
    const {
      flags: { directory, "add-meta": addMeta, verbose },
    } = await this.parse(MdImport);

    const context = await getContext(this);
    const {
      config: {
        md: { directory: mdDirectory, photosDirectory: photosDirectoryConfig },
      },
    } = context;

    const photosDirectory = photosDirectoryConfig || "";

    const directoryPath = resolve(directory);
    const files = await readdirp.promise(directoryPath, {
      fileFilter: "*.vcf",
    });

    const errors = [];

    for (const file of files) {
      try {
        if (verbose) {
          this.log("Starting file #pwhTgo", file.fullPath);
        }

        // eslint-disable-next-line no-await-in-loop
        const vcfString = await readAsync(file.fullPath);

        const contactResult = generateContactFromVcard(
          context,
          vcfString as string
        );
        if (!contactResult.success) {
          this.warn(`Failed to create contact #7RBCq2 ${file.fullPath}`);
          this.debug(contactResult);
          continue;
        }

        const {
          result: { data, notes, photo: photoData, filenames },
        } = contactResult;

        const filename = filenames.find((filename) => {
          const path = join(mdDirectory, `${filename}${CONTACT_EXTENSION}`);
          if (!exists(path)) {
            return true;
          }

          return false;
        });

        if (typeof filename === "undefined") {
          this.warn(`Duplicate filename for contact. #gRaJ4T ${file.fullPath}`);
        }

        if (typeof photoData !== "undefined") {
          const photo = join(
            photosDirectory,
            `${filename}${photoData.extension}`
          );
          const photoPath = join(mdDirectory, photo);
          // eslint-disable-next-line no-await-in-loop
          await writeAsync(photoPath, Buffer.from(photoData.data, "base64"));
          (data as Contact).photo = photo;
        }

        const id = nanoid();
        const now = Date.now();
        const dataWithMeta = addMeta
          ? { ...data, id, created: now, updated: now }
          : data;

        const md = matter.stringify(notes || "", dataWithMeta, {
          skipInvalid: true,
        } as any);
        this.debug("Created contact #Ub8qXO", dataWithMeta, photoData, md);

        const mdPath = join(mdDirectory, `${filename}${CONTACT_EXTENSION}`);
        // eslint-disable-next-line no-await-in-loop
        await writeAsync(mdPath, md);
      } catch (error) {
        errors.push({ path: file.fullPath, error });
        this.warn(`Error creating contact. #mw1ryp ${file.fullPath} ${error}`);
      }
    }

    this.log(`Imported ${files.length} files #CrbByr`);
    this.log(`Encountered ${errors.length} errors. #FnNy2f`, errors);
  }
}
