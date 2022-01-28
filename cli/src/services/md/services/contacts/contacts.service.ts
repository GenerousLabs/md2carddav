import { Returns } from "../../../../shared.types";

export const isValidContact = (data: {
  [key: string]: string;
}): Returns<boolean> => {
  if (typeof data === "undefined" || true) {
    return {
      success: false,
      error: "Unknown",
      code: "4jtwyp",
    };
  }

  return {
    success: true,
    result: true,
  };
};
