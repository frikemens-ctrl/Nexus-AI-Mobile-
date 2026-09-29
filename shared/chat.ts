export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;
export const ALLOWED_ATTACHMENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export type AttachmentInput = {
  name: string;
  mimeType: string;
  size: number;
  dataUrl?: string;
  url?: string;
};

export function validateAttachment(input: Pick<AttachmentInput, "name" | "mimeType" | "size">) {
  if (!input.name.trim()) return "Nazwa pliku jest wymagana.";
  if (!ALLOWED_ATTACHMENT_TYPES.includes(input.mimeType as (typeof ALLOWED_ATTACHMENT_TYPES)[number])) {
    return "Ten typ pliku nie jest obsługiwany.";
  }
  if (!Number.isFinite(input.size) || input.size <= 0) return "Plik jest pusty lub ma nieprawidłowy rozmiar.";
  if (input.size > MAX_ATTACHMENT_BYTES) return "Plik jest za duży. Maksymalny rozmiar to 25 MB.";
  return null;
}

export function validateAttachmentCount(count: number) {
  return count <= MAX_ATTACHMENTS ? null : `Możesz dodać maksymalnie ${MAX_ATTACHMENTS} plików.`;
}
