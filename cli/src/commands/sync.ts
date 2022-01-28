import { Command, Flags } from "@oclif/core";
import { getContactFromYamlFrontmatterData } from "../services/md/services/contacts/contacts.service";
import { getFileContents } from "../services/md/services/file/file.service";
import { getFilesFromPath } from "../services/md/services/files/files.service";
import { parseMarkdown } from "../services/md/services/markdown/markdown.service";

export default class Sync extends Command {
  static description = "Sync from markdown to CardDAV";

  static examples = ["<%= config.bin %> <%= command.id %>"];

  static flags = {
    directory: Flags.string({
      char: "d",
      description: "path to markdown files",
      required: true,
    }),
    // flag with no value (-f, --force)
    force: Flags.boolean({ char: "f" }),
  };

  static args = [];

  public async run(): Promise<void> {
    const { flags } = await this.parse(Sync);

    const files = await getFilesFromPath(flags.directory, ["*.contact.md"]);

    for (const file of files) {
      // eslint-disable-next-line no-await-in-loop
      const result = await getFileContents(file.fullPath);

      this.debug("Looping over #uX19cc", file);

      if (!result.success) {
        this.warn(`Failed to read one file. #DiqlJV`);
        this.debug({ file, result });
        continue;
      }

      const { result: markdown } = result;

      const data = parseMarkdown(markdown);
      this.debug("Got data #J4XJIy");

      const contactResult = getContactFromYamlFrontmatterData(data.data);

      if (!contactResult.success) {
        this.debug("FAILURE #7WPXhs");
        this.warn("Found invalid contact. #JcLLUI");
        this.debug({ file });
        continue;
      }

      // Now we have a valid contact we can sync
    }

    this.debug(`Works #3JvfHi`);
    this.debug(`Found ${files.length} files.`);
  }
}
