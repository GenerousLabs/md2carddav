import { Command, Flags } from "@oclif/core";
import { readAsync, writeAsync } from "fs-jetpack";
import { writeFile } from "fs/promises";
import * as matter from "gray-matter";
import { join, resolve } from "path";
import * as readdirp from "readdirp";
import { generateContactFromVcard } from "../../services/vcard/vcard.service";
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
      // eslint-disable-next-line no-await-in-loop
      const vcfString = await readAsync(file.fullPath);

      const contactResult = generateContactFromVcard(vcfString as string);
      if (!contactResult.success) {
        this.warn(`Failed to create contact #7RBCq2 ${file.fullPath}`);
        this.debug(contactResult);
        continue;
      }

      const {
        result: { data, notes, photo: photoData },
      } = contactResult;

      const filename = data.uid;

      if (typeof photoData !== "undefined") {
        const photo = join(photoDirectory, `${photoData.basename}`);
        const photoPath = join(mdDirectory, photo);
        // eslint-disable-next-line no-await-in-loop
        await writeAsync(photoPath, Buffer.from(photoData.data, "base64"));
        (data as Contact).photo = photo;
      }

      const md = matter.stringify(notes || "", data, {
        skipInvalid: true,
      } as any);
      this.debug("Created contact #Ub8qXO", data, photoData, md);

      const mdPath = join(mdDirectory, `${filename}.md`);
      // eslint-disable-next-line no-await-in-loop
      await writeAsync(mdPath, md);
    }

    this.log(`Imported ${files.length} files #CrbByr`);
  }
}
