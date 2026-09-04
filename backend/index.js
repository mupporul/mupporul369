"use strict";

require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const pinoHttp = require("pino-http");
const fs = require("fs");
const path = require("path");

const rateLimiter = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");
const templesRouter = require("./routes/templesRouter");
const authRouter = require("./routes/authRouter");
const reviewsRouter = require("./routes/reviewsRouter");
const usersRouter = require("./routes/usersRouter");
const exportRouter = require("./routes/exportRouter");

const APP_NAME = "MupporuL369";
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const WELCOME_MESSAGE = "Welcome to MupporuL369.";
const CLIENT_DIST_PATH = path.join(__dirname, "../client/dist");
const SHOULD_SERVE_CLIENT = process.env.SERVE_CLIENT === "true";

function parseCorsOrigin(value) {
  const origins = String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (origins.length <= 1) {
    return origins[0] || false;
  }

  return origins;
}

const app = express();

app.use(helmet());
app.use(cors({ origin: parseCorsOrigin(CORS_ORIGIN) }));
app.use(
  pinoHttp({
    redact: ["req.headers.authorization"],
  }),
);
app.use(express.json());
app.use(rateLimiter);

app.use("/api/auth", authRouter);
app.use("/api/temples", templesRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/users", usersRouter);
app.use("/api/export", exportRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", app: APP_NAME, timestamp: Date.now() });
});

app.get("/api/message", (_req, res) => {
  res.json({
    name: APP_NAME,
    message: WELCOME_MESSAGE,
    stack: {
      client: "React 18 + Vite",
      server: "Node.js + Express",
    },
  });
});

if (
  SHOULD_SERVE_CLIENT &&
  fs.existsSync(path.join(CLIENT_DIST_PATH, "index.html"))
) {
  app.use(express.static(CLIENT_DIST_PATH));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path === "/health") {
      return next();
    }

    return res.sendFile(path.join(CLIENT_DIST_PATH, "index.html"));
  });
}

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    process.stdout.write(
      `[server] MupporuL369 API listening on http://localhost:${PORT}\n`,
    );
  });
}

module.exports = app;
