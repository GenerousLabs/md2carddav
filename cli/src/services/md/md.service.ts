import { CommandContext } from "../../shared.types";
import { isValidContact } from "./services/contacts/contacts.service";
import { getFileContents } from "./services/file/file.service";
import { getFilesFromPath } from "./services/files/files.service";
import { parseMarkdown } from "./services/markdown/markdown.service";

export const getMdContacts = async (context: CommandContext) => {
  const {
    debug,
    config: {
      md: { directory, fileFilter },
    },
  } = context;

  const files = await getFilesFromPath(directory, fileFilter || ["*.md"]);

  debug("Got files #EA4tSH", files);

  const filesContents = await Promise.all(
    files.map(async (file) => {
      const markdownResult = await getFileContents(file.fullPath);
      if (!markdownResult.success) {
        return { file };
      }

      const matter = parseMarkdown(markdownResult.result);
      if (!isValidContact(matter.data)) {
        return { file };
      }

      return { file, matter };
    })
  );

  const validFiles = filesContents.filter(
    (file) => typeof file.matter !== "undefined"
  );

  return validFiles;
};
