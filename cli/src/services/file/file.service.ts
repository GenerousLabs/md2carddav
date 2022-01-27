import jetpack = require("fs-jetpack");
import { Returns } from "../../shared.types";

export const getFileContents = async (
  path: string
): Promise<Returns<string>> => {
  const contents = await jetpack.readAsync(path);

  if (typeof contents === "undefined") {
    return {
      success: false,
      error: "File is empty #y3y4uK",
      code: "kttFlt",
    };
  }

  return {
    success: true,
    result: contents,
  };
};
