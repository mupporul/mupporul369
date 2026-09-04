"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const USERS_PATH = path.join(__dirname, "../data/users.json");
const SESSIONS_PATH = path.join(__dirname, "../data/sessions.json");
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12;

function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_PATH, "utf8"));
}

function readSessions() {
  try {
    const data = fs.readFileSync(SESSIONS_PATH, "utf8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function writeSessions(sessions) {
  fs.writeFileSync(SESSIONS_PATH, JSON.stringify(sessions, null, 2), "utf8");
}

function parseHash(hashValue) {
  const parts = String(hashValue || "").split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return null;
  return { salt: parts[1], hash: parts[2] };
}

function verifyPassword(password, hashValue) {
  const parsed = parseHash(hashValue);
  if (!parsed) return false;
  const expected = Buffer.from(parsed.hash, "hex");
  const actual = crypto.scryptSync(password, parsed.salt, expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

function sanitizeUser(user) {
  return {
    id: user.id,
    mobile: user.mobile,
    name: user.name || user.initials,
    initials: user.initials,
    role: user.role,
  };
}

function createSession(user) {
  const token = crypto.randomUUID();
  const sessions = readSessions();
  sessions[token] = {
    userId: user.id,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  };
  writeSessions(sessions);
  return token;
}

function getUserFromToken(token) {
  const sessions = readSessions();
  const session = sessions[token];

  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    delete sessions[token];
    writeSessions(sessions);
    return null;
  }

  const user = readUsers().find((item) => item.id === session.userId);
  return user ? sanitizeUser(user) : null;
}

function loginUser(mobile, password) {
  const normalizedMobile = String(mobile || "").trim();
  if (!/^\d{12}$/.test(normalizedMobile) || !password) {
    return null;
  }

  const user = readUsers().find((item) => item.mobile === normalizedMobile);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return null;
  }

  const safeUser = sanitizeUser(user);
  const token = createSession(safeUser);
  return { token, user: safeUser };
}

module.exports = {
  getUserFromToken,
  loginUser,
};
