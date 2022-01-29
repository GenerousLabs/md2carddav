import { readFile } from "fs/promises";

const getMediaTypeFromFilename = (path: string) => {
  if (path.endsWith(".jpeg") || path.endsWith("jpg")) {
    return `image/jpeg`;
  }

  if (path.endsWith(".png")) {
    return `image/png`;
  }

  if (path.endsWith(".gif")) {
    return `image/gif`;
  }
};

export const getPhotoAsDataURL = async (photo: string): Promise<string> => {
  if (photo.slice(0, 5) === "data:") {
    return photo;
  }

  const mediaType = getMediaTypeFromFilename(photo);

  if (typeof mediaType === "undefined") {
    // eslint-disable-next-line unicorn/prefer-type-error
    throw new Error("Invalid photo (not jpg, jpeg, png, gif). #UDfMFq");
  }

  const photoBase64 = await readFile(photo, "base64");

  return `data:${mediaType},${photoBase64}`;
};
