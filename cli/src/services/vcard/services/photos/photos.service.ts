import { readFile } from "fs/promises";
import { join } from "path";
import Vcfer from "vcfer";

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

export const getPhotoAsDataURL = async (
  mdDirectory: string,
  photo: string
): Promise<string> => {
  if (photo.slice(0, 5) === "data:") {
    return photo;
  }

  const mediaType = getMediaTypeFromFilename(photo);

  if (typeof mediaType === "undefined") {
    // eslint-disable-next-line unicorn/prefer-type-error
    throw new Error("Invalid photo (not jpg, jpeg, png, gif). #UDfMFq");
  }

  const photoPath = join(mdDirectory, photo);
  const photoBase64 = await readFile(photoPath, "base64");

  return `data:${mediaType},${photoBase64}`;
};

export const getPhotoExtension = (mediatype = "image/jpeg"): string => {
  const pieces = mediatype.split("/");
  if (pieces.length !== 2) {
    return `.jpeg`;
  }

  const [, extension] = pieces;
  return `.${extension}`;
};

export type Photo = {
  extension: string;
  data: string;
};

export const getPhotoFromVcfer = (vcard: Vcfer): Photo | undefined => {
  const photos = vcard.get("photo");
  if (photos.length === 0) {
    return;
  }

  const photo = photos[0];
  const data = photo.getValue();

  // const photoBuffer = Buffer.from(photo.getValue(), "base64");

  // There should not be more than 1 mediatype parameter, so cast to string
  const mediatype = photo.params.mediatype as string;
  const extension = getPhotoExtension(mediatype);

  return {
    extension,
    data,
  };
};
