import { describe, expect, it } from "vitest";
import { buildAssistantReply, createMessageId, starterPrompts } from "../lib/nexus";
import { MAX_ATTACHMENT_BYTES, MAX_ATTACHMENTS, validateAttachment, validateAttachmentCount } from "../shared/chat";
import { MAX_AUDIO_BYTES, validateAudioInput } from "../shared/voice";

describe("Pomocnicze funkcje Nexus AI", () => {
  it("udostępnia trzy polskie prompty startowe", () => {
    expect(starterPrompts).toHaveLength(3);
    expect(starterPrompts[0]).toContain("produktywnego");
  });

  it("tworzy stabilne identyfikatory wiadomości z rolą", () => {
    expect(createMessageId(123, "user")).toBe("123-user");
    expect(createMessageId(123, "assistant")).not.toBe(createMessageId(123, "user"));
  });

  it("zwraca polską odpowiedź awaryjną", () => {
    expect(buildAssistantReply()).toMatch(/gotowy|pomóc/i);
  });
});

describe("Walidacja załączników", () => {
  it("akceptuje obraz PNG w limicie", () => {
    expect(validateAttachment({ name: "obraz.png", mimeType: "image/png", size: 1024 })).toBeNull();
  });

  it("odrzuca nieobsługiwany typ i zbyt duży plik", () => {
    expect(validateAttachment({ name: "skrypt.exe", mimeType: "application/x-msdownload", size: 1024 })).toMatch(/obsługiwany/);
    expect(validateAttachment({ name: "duzy.pdf", mimeType: "application/pdf", size: MAX_ATTACHMENT_BYTES + 1 })).toMatch(/25 MB/);
  });

  it("egzekwuje limit liczby plików", () => {
    expect(validateAttachmentCount(MAX_ATTACHMENTS)).toBeNull();
    expect(validateAttachmentCount(MAX_ATTACHMENTS + 1)).toMatch(/maksymalnie/);
  });
});

describe("Walidacja nagrań głosowych", () => {
  it("akceptuje nagranie M4A w limicie", () => {
    expect(validateAudioInput({ mimeType: "audio/m4a", size: 4096 })).toBeNull();
  });

  it("odrzuca nieobsługiwany format i nagranie ponad 16 MB", () => {
    expect(validateAudioInput({ mimeType: "video/mp4", size: 4096 })).toMatch(/format/);
    expect(validateAudioInput({ mimeType: "audio/m4a", size: MAX_AUDIO_BYTES + 1 })).toMatch(/16 MB/);
  });
});
