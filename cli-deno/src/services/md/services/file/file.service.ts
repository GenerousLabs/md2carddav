import { Returns } from "../../../../shared/types.ts";

export const getFileContents = async (
  path: string
): Promise<Returns<string>> => {
  try {
    const contents = await Deno.readTextFile(path);
    if (contents.length === 0) {
      return { success: false, error: "File is empty #y3y4uK", code: "file.empty" };
    }
    return { success: true, result: contents };
  } catch {
    return { success: false, error: `Failed to read file: ${path}`, code: "file.read" };
  }
};
