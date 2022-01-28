import { EntryInfo } from "readdirp";
import { CommandContext } from "../../shared.types";
import { extendDebugIfPossible } from "../../shared.utils";
import {
  Contact,
  getContactFromYamlFrontmatterData,
} from "./services/contacts/contacts.service";
import { getFileContents } from "./services/file/file.service";
import { getFilesFromPath } from "./services/files/files.service";
import { parseMarkdown } from "./services/markdown/markdown.service";

export const getMdContacts = async (
  context: CommandContext
): Promise<
  {
    file: EntryInfo;
    contact: Contact;
  }[]
> => {
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
    files.map(async (file) => {
      const markdownResult = await getFileContents(file.fullPath);
      if (!markdownResult.success) {
        return { file };
      }

      const matter = parseMarkdown(markdownResult.result);
      const contactResult = getContactFromYamlFrontmatterData(matter.data);

      if (!contactResult.success) {
        warn(`File is not a valid contact #rj8vqW ${file.fullPath}`);
        return { file };
      }

      return { file, contact: contactResult.result };
    })
  );

  const validFiles = filesContents.filter(
    (file) => typeof file.contact !== "undefined"
  ) as { file: EntryInfo; contact: Contact }[];

  return validFiles;
};
