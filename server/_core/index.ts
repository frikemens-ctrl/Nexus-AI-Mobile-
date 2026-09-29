import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { storagePut } from "../storage";
import { ALLOWED_ATTACHMENT_TYPES, MAX_ATTACHMENT_BYTES } from "../../shared/chat";
import { validateAudioInput } from "../../shared/voice";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Enable CORS for all routes - reflect the request origin to support credentials
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.header("Access-Control-Allow-Credentials", "true");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerStorageProxy(app);
  registerOAuthRoutes(app);

  app.post("/api/attachments/upload", async (req, res) => {
    try {
      const { name, mimeType, size, dataUrl } = req.body ?? {};
      if (typeof name !== "string" || !name.trim() || typeof mimeType !== "string" || !ALLOWED_ATTACHMENT_TYPES.includes(mimeType as (typeof ALLOWED_ATTACHMENT_TYPES)[number])) {
        res.status(400).json({ error: "Nieprawidłowa nazwa lub typ załącznika." });
        return;
      }
      if (!Number.isInteger(size) || size <= 0 || size > MAX_ATTACHMENT_BYTES) {
        res.status(400).json({ error: "Nieprawidłowy rozmiar załącznika." });
        return;
      }
      if (typeof dataUrl !== "string" || !dataUrl.startsWith(`data:${mimeType};base64,`)) {
        res.status(400).json({ error: "Nieprawidłowe dane załącznika." });
        return;
      }
      const data = Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
      if (data.byteLength !== size) {
        res.status(400).json({ error: "Rozmiar załącznika nie zgadza się z deklarowanym rozmiarem." });
        return;
      }
      const stored = await storagePut(`nexus-ai/attachments/${name}`, data, mimeType);
      res.json({ name, mimeType, size, url: stored.url, key: stored.key });
    } catch (error) {
      console.error("[attachments] upload failed", error);
      res.status(500).json({ error: "Nie udało się zapisać załącznika." });
    }
  });

  app.post("/api/audio/upload", async (req, res) => {
    try {
      const { mimeType, size, dataUrl } = req.body ?? {};
      const safeMimeType = typeof mimeType === "string" ? mimeType : "";
      const validationError = validateAudioInput({ mimeType: safeMimeType, size });
      if (validationError) {
        res.status(400).json({ error: validationError });
        return;
      }
      if (typeof dataUrl !== "string" || !dataUrl.startsWith(`data:${safeMimeType};base64,`)) {
        res.status(400).json({ error: "Nieprawidłowe dane nagrania." });
        return;
      }
      const data = Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64");
      if (data.byteLength !== size) {
        res.status(400).json({ error: "Rozmiar nagrania nie zgadza się z deklarowanym rozmiarem." });
        return;
      }
      const extension = safeMimeType.includes("webm") ? "webm" : safeMimeType.includes("wav") ? "wav" : safeMimeType.includes("ogg") ? "ogg" : "m4a";
      const stored = await storagePut(`nexus-ai/voice/${Date.now()}.${extension}`, data, safeMimeType);
      res.json({ url: stored.url, key: stored.key, mimeType: safeMimeType, size });
    } catch (error) {
      console.error("[voice] upload failed", error);
      res.status(500).json({ error: "Nie udało się zapisać nagrania." });
    }
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`[api] server listening on port ${port}`);
  });
}

startServer().catch(console.error);
