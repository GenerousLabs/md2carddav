import { Returns } from "../../shared.types";

export const getUidFromVcard = (input: string): Returns<string> => {
  if (typeof input !== "string") {
    return {
      success: false,
      error: "Invalid vcard #C4tXK8",
      code: "vcard.invalid",
    };
  }

  const lines = input.split("\n");
  const uidLine = lines.find((line) => line.startsWith("UID:"));

  if (typeof uidLine === "undefined") {
    return {
      success: false,
      error: "Failed to find UID #VR5mde",
      code: "vcard.nouid",
    };
  }

  const uid = uidLine.slice(4).trim();

  return {
    success: true,
    result: uid,
  };
};
