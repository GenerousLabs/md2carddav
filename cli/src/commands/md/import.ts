import * as readdirp from "readdirp";
import { resolve } from "path";
import { Command, Flags } from "@oclif/core";
import Vcfer from "vcfer";
import { readAsync, writeAsync } from "fs-jetpack";
import { getContext } from "../../shared.utils";
import { strictEqual } from "assert";
import { getPhotoBasename } from "../../services/vcard/services/photos/photos.service";

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
        md: { directory: mdDirectory },
      },
    } = context;

    const directoryPath = resolve(directory);
    const files = await readdirp.promise(directoryPath, {
      fileFilter: "*.vcf",
    });

    for (const file of files) {
      // eslint-disable-next-line no-await-in-loop
      const vcfString = await readAsync(file.fullPath);
      const vcard = new Vcfer(vcfString);

      const uids = vcard.get("uid");
      if (uids.length !== 1) {
        this.warn(`Found VCF missing exactly 1 UID. #iUQ31O ${file.fullPath}`);
        continue;
      }

      const uid = uids[0].getValue();

      const photos = vcard.get("photo");

      this.debug("Parsed vcard #FrDghO", vcard, photos);

      if (photos.length > 0) {
        const photo = photos[0];
        const photoBuffer = Buffer.from(photo.getValue(), "base64");
        // There should not be more than 1 mediatype parameter, so cast to string
        const mediatype = photo.params.mediatype as string;
        const basename = getPhotoBasename(uid, mediatype);
        const photoPath = resolve(mdDirectory, "assets", basename);
        if (verbose) {
          this.log(
            `Saving photo for VCF #FNdBFE ${file.basename} ${photoPath}`
          );
        }

        // eslint-disable-next-line no-await-in-loop
        await writeAsync(photoPath, photoBuffer);
      }
    }

    this.log(`Import ${files.length} files #CrbByr`);
  }
}
