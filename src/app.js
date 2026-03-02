import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import { config } from "dotenv";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import { parse as yamlParse } from "yaml";
import swaggerUi from "swagger-ui-express";

import { errorHandler } from "./Middlewares/Error.middleware.js";
import { notFound } from "./Middlewares/Notfound.middleware.js";
import { globalRateLimit } from "./Middlewares/Ratelimit.middleware.js";
import registerRoutes from "./Routes/index.js";
import { initializeSocketIO } from "./Socket/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: "./.env" });

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGIN = process.env.FRONTEND_URL || "*";

app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  }),
);

// ── HTTP + Socket.IO server ───────────────────────────────────────────────────
const httpServer = createServer(app);

const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  },
});

app.set("io", io);
initializeSocketIO(io);

// ── Global Middlewares ────────────────────────────────────────────────────────
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(globalRateLimit);

// ── Swagger Docs ──────────────────────────────────────────────────────────────
try {
  const loadYaml = (filename) =>
    yamlParse(readFileSync(path.resolve(__dirname, filename), "utf8"));

  const coreSpec = loadYaml("./swagger-core.yaml");
  const posSpec = loadYaml("./swagger-pos.yaml");
  const hrmSpec = loadYaml("./swagger-hrm.yaml");

  // Serve specs as JSON for the explorer to fetch
  app.get("/api-docs/core.json", (req, res) => res.json(coreSpec));
  app.get("/api-docs/pos.json", (req, res) => res.json(posSpec));
  app.get("/api-docs/hrm.json", (req, res) => res.json(hrmSpec));

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(null, {
      explorer: true,
      swaggerOptions: {
        urls: [
          { url: "/api-docs/core.json", name: "Core API" },
          { url: "/api-docs/pos.json", name: "POS API" },
          { url: "/api-docs/hrm.json", name: "HRM API" },
        ],
      },
      customSiteTitle: "POS HRM API Docs",
    }),
  );
  console.log("✅ Swagger multi-spec configured successfully");
} catch (e) {
  console.warn("⚠️  Swagger multi-spec configuration failed:", e.message);
}

// ── API Routes ────────────────────────────────────────────────────────────────
registerRoutes(app);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use(notFound);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

export default httpServer;
