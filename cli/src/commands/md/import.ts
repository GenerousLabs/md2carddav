import { Command, Flags } from "@oclif/core";
import { exists, readAsync, writeAsync } from "fs-jetpack";
import { writeFile } from "fs/promises";
import * as matter from "gray-matter";
import { join, resolve } from "path";
import * as readdirp from "readdirp";
import slugify from "slugify";
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
    verbose: Flags.boolean({ char: "v" }),
  };

  public async run(): Promise<void> {
    const {
      flags: { directory, verbose },
    } = await this.parse(MdImport);

    const context = await getContext(this);
    const {
      config: {
        md: { directory: mdDirectory, photoDirectory: photoDirectoryConfig },
      },
    } = context;

    const photoDirectory = photoDirectoryConfig || "";

    const directoryPath = resolve(directory);
    const files = await readdirp.promise(directoryPath, {
      fileFilter: "*.vcf",
    });

    for (const file of files) {
      try {
        this.log("Starting file #pwhTgo", file.fullPath);
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

        // Calculate a filenam here

        if (typeof photoData !== "undefined") {
          const photo = join(
            photoDirectory,
            `${filename}${photoData.extension}`
          );
          const photoPath = join(mdDirectory, photo);
          // eslint-disable-next-line no-await-in-loop
          await writeAsync(photoPath, Buffer.from(photoData.data, "base64"));
          (data as Contact).photo = photo;
        }

        const md = matter.stringify(notes || "", data, {
          skipInvalid: true,
        } as any);
        this.debug("Created contact #Ub8qXO", data, photoData, md);

        const mdPath = join(mdDirectory, `${filename}${CONTACT_EXTENSION}`);
        // eslint-disable-next-line no-await-in-loop
        await writeAsync(mdPath, md);
      } catch (error) {
        this.warn(`Error creating contact. #mw1ryp ${file.fullPath} ${error}`);
      }
    }

    this.log(`Imported ${files.length} files #CrbByr`);
  }
}
