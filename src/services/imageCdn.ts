import { compressImage } from "../utils/imageCompression";

const env = (import.meta as any).env || {};

export const CLOUDINARY_CONFIG = {
  cloudName: env.VITE_CLOUDINARY_CLOUD_NAME || "u11clntg",
  uploadPreset: env.VITE_CLOUDINARY_UPLOAD_PRESET || "gsmile_preset",
  folder: env.VITE_CLOUDINARY_FOLDER || "g-smile-signature",
};

export const cloudinaryEnabled = true;

function dataUrlToBlob(dataUrl: string) {
  const [meta, base64] = dataUrl.split(",");
  const mime = meta.match(/:(.*?);/)?.[1] || "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export async function uploadImageToCloudinary(file: File, options?: { maxWidth?: number; quality?: number; folder?: string }) {
  const compressedDataUrl = await compressImage(file, options?.maxWidth ?? 1400, options?.quality ?? 0.72);

  if (!cloudinaryEnabled) return compressedDataUrl;

  const formData = new FormData();
  formData.append("file", dataUrlToBlob(compressedDataUrl), file.name.replace(/\.[^.]+$/, ".jpg"));
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
  formData.append("folder", options?.folder || CLOUDINARY_CONFIG.folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  if (!response.ok) {
    console.warn("Cloudinary upload failed, using compressed local data URL", result);
    return compressedDataUrl;
  }

  return result.secure_url as string;
}

export function optimizeImageUrl(src: string, options?: { width?: number; quality?: "auto" | number; format?: "auto" | "webp" | "jpg"; crop?: "fill" | "fit" | "limit" }) {
  if (!src) return src;
  if (!src.includes("res.cloudinary.com") || !src.includes("/image/upload/")) return src;

  const width = options?.width ? `w_${options.width}` : "w_auto";
  const quality = `q_${options?.quality ?? "auto"}`;
  const format = `f_${options?.format ?? "auto"}`;
  const crop = `c_${options?.crop ?? "limit"}`;
  const transforms = [format, quality, width, crop].join(",");

  return src.replace("/image/upload/", `/image/upload/${transforms}/`);
}

export function imageSrcSet(src: string, widths = [320, 480, 768, 1024, 1400]) {
  if (!src.includes("res.cloudinary.com")) return undefined;
  return widths.map((w) => `${optimizeImageUrl(src, { width: w })} ${w}w`).join(", ");
}