import * as fs from "fs-jetpack";
import * as readdirp from "readdirp";
/**
 * - Given a directory, get a list of files
 * - Maybe later add a filter
 */

export const getFilesFromPath = async (
  path: string
): Promise<readdirp.EntryInfo[]> => {
  const stats = await fs.inspectAsync(path);

  if (typeof stats === "undefined" || stats.type !== "dir") {
    throw new Error("Invalid path. #2YADVn");
  }

  const files = await readdirp.promise(path, { fileFilter: "*.contact.md" });

  return files;
};
