export const starterPrompts = [
  "Ułóż mi szybki plan produktywnego dnia",
  "Wyjaśnij złożony temat prostymi słowami",
  "Pomóż mi coś dobrze napisać",
] as const;

export function buildAssistantReply(): string {
  return "Jestem gotowy, aby pomóc. To miejsce służy do skupionych rozmów, pomysłów i szybkich odpowiedzi.";
}

export function createMessageId(timestamp: number, role: "user" | "assistant"): string {
  return `${timestamp}-${role}`;
}
