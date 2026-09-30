import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { COOKIE_NAME } from "../shared/const.js";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { transcribeAudio } from "./_core/voiceTranscription";
import { TRPCError } from "@trpc/server";
import { ALLOWED_ATTACHMENT_TYPES, MAX_ATTACHMENT_BYTES, MAX_ATTACHMENTS } from "../shared/chat";

const attachmentSchema = z.object({
  name: z.string().trim().min(1).max(255),
  mimeType: z.enum(ALLOWED_ATTACHMENT_TYPES),
  size: z.number().int().positive().max(MAX_ATTACHMENT_BYTES),
  dataUrl: z.string().regex(/^data:[^;]+;base64,[A-Za-z0-9+/=]+$/).max(36_000_000),
});

const uploadedAttachmentSchema = z.object({
  name: z.string().trim().min(1).max(255),
  mimeType: z.enum(ALLOWED_ATTACHMENT_TYPES),
  size: z.number().int().positive().max(MAX_ATTACHMENT_BYTES),
  url: z.string().min(1).max(2048),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  attachments: router({
    upload: publicProcedure.input(attachmentSchema).mutation(async ({ input }) => {
      console.log(`[attachments] upload started: ${input.name} (${input.size} bytes)`);
      const comma = input.dataUrl.indexOf(",");
      const base64 = input.dataUrl.slice(comma + 1);
      const data = Buffer.from(base64, "base64");
      if (data.byteLength !== input.size) {
        throw new Error("Rozmiar załącznika nie zgadza się z deklarowanym rozmiarem.");
      }
      const result = await storagePut(`nexus-ai/attachments/${input.name}`, data, input.mimeType);
      console.log(`[attachments] upload completed: ${result.key}`);
      return { name: input.name, mimeType: input.mimeType, size: input.size, url: result.url, key: result.key };
    }),
  }),
  chat: router({
    send: publicProcedure.input(z.object({
      text: z.string().trim().max(8000),
      attachments: z.array(uploadedAttachmentSchema).max(MAX_ATTACHMENTS).default([]),
      history: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(8000),
      })).max(20).default([]),
    }).refine((value) => value.text.length > 0 || value.attachments.length > 0, { message: "Wiadomość lub załącznik jest wymagany." })).mutation(async ({ input, ctx }) => {
      const content: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string; detail: "auto" } } | { type: "file_url"; file_url: { url: string; mime_type: "application/pdf" | "audio/mpeg" | "audio/wav" | "audio/mp4" | "video/mp4" } }> = [];
      if (input.text) content.push({ type: "text", text: input.text });
      for (const attachment of input.attachments) {
        const publicUrl = new URL(attachment.url, `${ctx.req.protocol}://${ctx.req.get("host")}`).toString();
        if (attachment.mimeType.startsWith("image/")) content.push({ type: "image_url", image_url: { url: publicUrl, detail: "auto" } });
        else if (attachment.mimeType === "application/pdf") content.push({ type: "file_url", file_url: { url: publicUrl, mime_type: "application/pdf" } });
        else content.push({ type: "text", text: `Załączono plik: ${attachment.name} (${attachment.mimeType}).` });
      }
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Jesteś Nexus AI. Odpowiadaj naturalnym językiem polskim, konkretnie i pomocnie. Jeśli użytkownik dołączył pliki, uwzględnij je w analizie." },
          ...input.history,
          { role: "user", content: content.length === 1 && content[0].type === "text" ? content[0].text : content },
        ],
        model: process.env.OPENAI_MODEL ?? "gpt-5-nano",
        maxTokens: 1200,
      });
      const answer = response.choices[0]?.message?.content;
      const text = typeof answer === "string" ? answer : answer?.filter((part) => part.type === "text").map((part) => part.text).join("\n") ?? "Nie udało się odczytać odpowiedzi.";
      return { text };
    }),
  }),
  voice: router({
    transcribe: publicProcedure.input(z.object({
      audioUrl: z.string().min(1).max(2048),
      language: z.string().length(2).default("pl"),
    })).mutation(async ({ input, ctx }) => {
      const publicUrl = new URL(input.audioUrl, `${ctx.req.protocol}://${ctx.req.get("host")}`).toString();
      const result = await transcribeAudio({ audioUrl: publicUrl, language: input.language });
      if ("error" in result) throw new TRPCError({ code: "BAD_REQUEST", message: result.error, cause: result.details });
      return { text: result.text, language: result.language, duration: result.duration };
    }),
  }),
});

export type AppRouter = typeof appRouter;
