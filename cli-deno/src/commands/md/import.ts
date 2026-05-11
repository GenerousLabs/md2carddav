import { Command } from "@cliffy/command";
import { ensureDir } from "@std/fs";
import { join, resolve } from "@std/path";
import { decodeBase64 } from "@std/encoding";
import matter from "npm:gray-matter";
import { generateContactFromVcard } from "../../services/vcard/vcard.service.ts";
import { getFilesFromPath } from "../../services/md/services/files/files.service.ts";
import { CONTACT_EXTENSION } from "../../shared/constants.ts";
import { Contact } from "../../shared/types.ts";
import { makeContext } from "../context.ts";

async function fileExists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);
    return true;
  } catch {
    return false;
  }
}

export const mdImportCommand = new Command()
  .description("Import a directory of .vcf files into markdown")
  .option("-d, --directory <path:string>", "directory of .vcf files", { required: true })
  .option("-m, --add-meta", "add id, created, updated metadata fields to all contacts")
  .option("-v, --verbose", "output more detail as the program runs")
  .action(async ({ directory, addMeta, verbose }) => {
    const ctx = await makeContext(verbose);
    const {
      config: {
        md: { directory: mdDirectory, photosDirectory: photosDirectoryConfig },
      },
    } = ctx;

    const photosDirectory = photosDirectoryConfig || "";
    const directoryPath = resolve(directory);
    const files = await getFilesFromPath(directoryPath, ["*.vcf"]);

    const errors: { path: string; error: unknown }[] = [];

    for (const file of files) {
      try {
        if (verbose) ctx.log("Starting file #pwhTgo", file.fullPath);

        const vcfString = await Deno.readTextFile(file.fullPath);

        const contactResult = generateContactFromVcard(ctx, vcfString);
        if (!contactResult.success) {
          ctx.warn(`Failed to create contact #7RBCq2 ${file.fullPath}`);
          continue;
        }

        const { result: { data, notes, photo: photoData, filenames } } = contactResult;

        let filename = undefined;
        for (const candidate of filenames) {
          const path = join(mdDirectory, `${candidate}${CONTACT_EXTENSION}`);
          if (!(await fileExists(path))) {
            filename = candidate;
            break;
          }
        }

        if (typeof filename === "undefined") {
          ctx.warn(`Duplicate filename for contact. #gRaJ4T ${file.fullPath}`);
        }

        if (typeof photoData !== "undefined") {
          const photo = join(photosDirectory, `${filename}${photoData.extension}`);
          const photoPath = join(mdDirectory, photo);
          await ensureDir(join(mdDirectory, photosDirectory));
          await Deno.writeFile(photoPath, decodeBase64(photoData.data));
          (data as Contact).photo = photo;
        }

        const id = crypto.randomUUID();
        const now = Date.now();
        const dataWithMeta = addMeta ? { ...data, id, created: now, updated: now } : data;

        const md = matter.stringify(notes || "", dataWithMeta, {
          skipInvalid: true,
        } as Parameters<typeof matter.stringify>[2]);

        const mdPath = join(mdDirectory, `${filename}${CONTACT_EXTENSION}`);
        await Deno.writeTextFile(mdPath, md);
      } catch (error) {
        errors.push({ path: file.fullPath, error });
        ctx.warn(`Error creating contact. #mw1ryp ${file.fullPath} ${error}`);
      }
    }

    ctx.log(`Imported ${files.length} files #CrbByr`);
    ctx.log(`Encountered ${errors.length} errors. #FnNy2f`);
  });
