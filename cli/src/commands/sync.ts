import { Command, Flags } from "@oclif/core";
import { isValidContact } from "../services/contacts/contacts.service";
import { getFileContents } from "../services/file/file.service";
import { getFilesFromPath } from "../services/files/files.service";
import { parseMarkdown } from "../services/markdown/markdown.service";

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

    const files = await getFilesFromPath(flags.directory);

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
      this.log("Got data #J4XJIy");

      if (!isValidContact(data.data)) {
        this.log("FAILURE #7WPXhs");
        this.warn("Found invalid contact. #JcLLUI");
        this.debug({ file });
        continue;
      }

      // Now we have a valid contact we can sync
    }

    this.log(`Works #3JvfHi`);
    this.log(`Found ${files.length} files.`);
  }
}
