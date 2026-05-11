import { Command } from "@cliffy/command";
import { getContactFromYamlFrontmatterData } from "../services/md/services/contacts/contacts.service.ts";
import { getFileContents } from "../services/md/services/file/file.service.ts";
import { getFilesFromPath } from "../services/md/services/files/files.service.ts";
import { parseMarkdown } from "../services/md/services/markdown/markdown.service.ts";

export const syncCommand = new Command()
  .description("Sync from markdown to CardDAV")
  .option("-d, --directory <path:string>", "path to markdown files", { required: true })
  .option("-f, --force", "force sync")
  .action(async ({ directory, force: _force }) => {
    const files = await getFilesFromPath(directory, ["*.contact.md"]);

    for (const file of files) {
      const result = await getFileContents(file.fullPath);

      if (!result.success) {
        console.warn(`Failed to read one file. #DiqlJV`);
        continue;
      }

      const data = parseMarkdown(result.result);
      const contactResult = getContactFromYamlFrontmatterData(data.data);

      if (!contactResult.success) {
        console.warn("Found invalid contact. #JcLLUI");
        continue;
      }

      // contact is valid — sync not yet implemented
    }

    console.log(`Found ${files.length} files.`);
  });
