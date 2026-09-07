"use strict";

const crypto = require("crypto");
const { getUserRepository } = require("../repositories/userRepository");
const { getSessionRepository } = require("../repositories/sessionRepository");

const TOKEN_TTL_MS = 1000 * 60 * 60 * 12;

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

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
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

async function createSession(user) {
  const token = crypto.randomUUID();
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const repository = getSessionRepository();
  await repository.createSession(token, user.id, expiresAt);
  return token;
}

async function getUserFromToken(token) {
  const repository = getSessionRepository();
  const session = await repository.findByToken(token);

  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    await repository.deleteByToken(token);
    return null;
  }

  const user = await getUserRepository().findById(session.userId);
  return user ? sanitizeUser(user) : null;
}

async function loginUser(mobile, password) {
  const normalizedMobile = String(mobile || "").trim();
  if (!/^\d{12}$/.test(normalizedMobile) || !password) {
    return null;
  }

  const user = await getUserRepository().findByMobile(normalizedMobile);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return null;
  }

  const safeUser = sanitizeUser(user);
  const token = await createSession(safeUser);
  return { token, user: safeUser };
}

async function changePassword(mobile, oldPassword, newPassword) {
  const normalizedMobile = String(mobile || "").trim();
  if (
    !/^\d{12}$/.test(normalizedMobile) ||
    !oldPassword ||
    !newPassword ||
    oldPassword === newPassword
  ) {
    return false;
  }

  const repository = getUserRepository();
  const user = await repository.findByMobile(normalizedMobile);
  if (!user || !verifyPassword(oldPassword, user.passwordHash)) {
    return false;
  }

  return repository.updatePasswordHash(user.id, hashPassword(newPassword));
}

async function logoutUser(token) {
  if (!token) return false;
  const repository = getSessionRepository();
  return repository.deleteByToken(token);
}

module.exports = {
  changePassword,
  getUserFromToken,
  loginUser,
  logoutUser,
};
