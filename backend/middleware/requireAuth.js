"use strict";

const { getUserFromToken } = require("../services/authService");

function extractToken(authHeader) {
  const raw = String(authHeader || "").trim();
  if (!raw) return "";
  const withoutBearer = raw.replace(/^Bearer\s+/i, "").trim();
  return withoutBearer;
}

async function requireAuth(req, res, next) {
  const token = extractToken(req.headers.authorization);
  const user = await getUserFromToken(token);

  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.user = user;
  return next();
}

module.exports = requireAuth;
