import { encodeBase64 } from "@std/encoding";
import { join } from "@std/path";
import VcferRaw from "npm:vcfer";
import type { VcferInst } from "../../vcfer-types.ts";

// vcfer exports a class as CJS default; cast to usable constructor
// deno-lint-ignore no-explicit-any
const Vcfer = VcferRaw as any as { new(input?: string): VcferInst };

const getMediaTypeFromFilename = (path: string): string | undefined => {
  if (path.endsWith(".jpeg") || path.endsWith(".jpg")) return "image/jpeg";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".gif")) return "image/gif";
  return undefined;
};

export const getPhotoAsDataURL = async (
  mdDirectory: string,
  photo: string
): Promise<string> => {
  if (photo.slice(0, 5) === "data:") return photo;

  const mediaType = getMediaTypeFromFilename(photo);
  if (typeof mediaType === "undefined") {
    throw new Error("Invalid photo (not jpg, jpeg, png, gif). #UDfMFq");
  }

  const photoPath = join(mdDirectory, photo);
  const photoBytes = await Deno.readFile(photoPath);
  const photoBase64 = encodeBase64(photoBytes);

  return `data:${mediaType},${photoBase64}`;
};

export const getPhotoExtension = (mediatype = "image/jpeg"): string => {
  const pieces = mediatype.split("/");
  if (pieces.length !== 2) return ".jpeg";
  const [, extension] = pieces;
  return `.${extension}`;
};

export type Photo = {
  extension: string;
  data: string;
};

export { Vcfer };

export const getPhotoFromVcfer = (vcard: VcferInst): Photo | undefined => {
  const photos = vcard.get("photo");
  if (photos.length === 0) return undefined;

  const photo = photos[0];
  const data = photo.getValue();
  const mediatype = photo.params.mediatype as string;
  const extension = getPhotoExtension(mediatype);

  return { extension, data };
};
