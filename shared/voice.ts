export const AUDIO_MIME_TYPES = ["audio/webm", "audio/mp4", "audio/m4a", "audio/wav", "audio/mpeg", "audio/ogg"] as const;
export const MAX_AUDIO_BYTES = 16 * 1024 * 1024;

export function validateAudioInput(input: { mimeType: string; size: number }) {
  if (!AUDIO_MIME_TYPES.includes(input.mimeType as (typeof AUDIO_MIME_TYPES)[number])) return "Nieobsługiwany format nagrania.";
  if (!Number.isInteger(input.size) || input.size <= 0 || input.size > MAX_AUDIO_BYTES) return "Nagranie jest puste lub przekracza limit 16 MB.";
  return null;
}
