import { walk } from "@std/fs";
import { relative } from "@std/path";

export type FileEntry = {
  fullPath: string;
  basename: string;
  path: string;
};

export const getFilesFromPath = async (
  dirPath: string,
  fileFilter: string[]
): Promise<FileEntry[]> => {
  let stat: Deno.FileInfo;
  try {
    stat = await Deno.stat(dirPath);
  } catch {
    throw new Error(`Path does not exist. #Fb3Don ${dirPath}`);
  }

  if (!stat.isDirectory) {
    throw new Error("Path is not a directory. #2YADVn");
  }

  const patterns = fileFilter.map(
    (f) =>
      new RegExp(
        f.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$"
      )
  );

  const results: FileEntry[] = [];
  for await (const entry of walk(dirPath, { includeDirs: false })) {
    if (patterns.some((p) => p.test(entry.name))) {
      results.push({
        fullPath: entry.path,
        basename: entry.name,
        path: relative(dirPath, entry.path),
      });
    }
  }

  return results;
};
