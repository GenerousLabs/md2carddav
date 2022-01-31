import { EntryInfo } from "readdirp";
import { CommandContext, Contact } from "../../shared.types";
import { extendDebugIfPossible } from "../../shared.utils";
import { getContactFromYamlFrontmatterData } from "./services/contacts/contacts.service";
import { getFileContents } from "./services/file/file.service";
import { getFilesFromPath } from "./services/files/files.service";
import { parseMarkdown } from "./services/markdown/markdown.service";

type FileAndContactOrError =
  | {
      file: EntryInfo;
      contact: Contact;
    }
  | {
      file: EntryInfo;
      error: string;
    };

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

  const filesContents = await Promise.all(
    files.map(async (file): Promise<FileAndContactOrError> => {
      try {
        const markdownResult = await getFileContents(file.fullPath);
        if (!markdownResult.success) {
          return { file, error: markdownResult.error };
        }

        const matter = parseMarkdown(markdownResult.result);
        const contactResult = getContactFromYamlFrontmatterData(matter.data);

        if (!contactResult.success) {
          warn(`File is not a valid contact #rj8vqW ${file.fullPath}`);
          return { file, error: contactResult.error };
        }

        return { file, contact: contactResult.result };
      } catch (error) {
        if (error instanceof Error) {
          return { file, error: error.message };
        }

        return { file, error: "Unknown error. #oK4hLj" };
      }
    })
  );

  return filesContents;
};
