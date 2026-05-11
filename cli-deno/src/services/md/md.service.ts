import { CommandContext, Contact } from "../../shared/types.ts";
import { extendDebugIfPossible } from "../../shared/utils.ts";
import { getContactFromYamlFrontmatterData } from "./services/contacts/contacts.service.ts";
import { getFileContents } from "./services/file/file.service.ts";
import { FileEntry, getFilesFromPath } from "./services/files/files.service.ts";
import { parseMarkdown } from "./services/markdown/markdown.service.ts";

type FileAndContactOrError =
  | { file: FileEntry; contact: Contact }
  | { file: FileEntry; error: string };

export const getMdContacts = async (
  context: CommandContext
): Promise<FileAndContactOrError[]> => {
  const {
    debug: parentDebug,
    warn,
    config: {
      md: { directory, fileFilter },
    },
  } = context;

  const debug = extendDebugIfPossible(parentDebug, "getMdContacts");

  const files = await getFilesFromPath(directory, fileFilter || ["*.md"]);
  debug("Got files #EA4tSH", files);

  const filesContents: FileAndContactOrError[] = [];
  for (const file of files) {
    try {
      const markdownResult = await getFileContents(file.fullPath);
      if (!markdownResult.success) {
        filesContents.push({ file, error: markdownResult.error });
        continue;
      }

      const matterResult = parseMarkdown(markdownResult.result);
      const contactResult = getContactFromYamlFrontmatterData(matterResult.data);

      if (!contactResult.success) {
        warn(`File is not a valid contact #rj8vqW ${file.fullPath}`);
        filesContents.push({ file, error: contactResult.error });
        continue;
      }

      filesContents.push({ file, contact: contactResult.result });
    } catch (error) {
      if (error instanceof Error) filesContents.push({ file, error: error.message });
      else filesContents.push({ file, error: "Unknown error. #oK4hLj" });
    }
  }

  return filesContents;
};
