import * as fs from "fs-jetpack";
import * as readdirp from "readdirp";
/**
 * - Given a directory, get a list of files
 * - Maybe later add a filter
 */

export const getFilesFromPath = async (
  path: string,
  fileFilter: string[]
): Promise<readdirp.EntryInfo[]> => {
  const stats = await fs.inspectAsync(path);

  if (typeof stats === "undefined") {
    // eslint-disable-next-line unicorn/prefer-type-error
    throw new Error(`Path does not exist. #Fb3Don ${path}`);
  }

  if (stats.type !== "dir") {
    throw new Error("Path is not a directory. #2YADVn");
  }

  const files = await readdirp.promise(path, { fileFilter });

  return files;
};
