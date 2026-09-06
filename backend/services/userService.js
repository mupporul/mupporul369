"use strict";

const crypto = require("crypto");
const { getUserRepository } = require("../repositories/userRepository");

function sanitizeUser(user) {
  return {
    id: user.id,
    mobile: user.mobile,
    name: user.name || user.initials,
    initials: user.initials,
    role: user.role,
  };
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

async function getAllUsers() {
  const users = await getUserRepository().findAll();
  return users.map(sanitizeUser);
}

async function createUser(mobile, password, name, initials, role) {
  const normalizedMobile = String(mobile || "").trim();
  const normalizedName = String(name || "").trim();
  const normalizedInitials = String(initials || "")
    .trim()
    .toUpperCase();

  // Validate inputs
  if (!/^\d{12}$/.test(normalizedMobile)) {
    return null;
  }
  if (!normalizedName || normalizedInitials.length !== 2 || !password) {
    return null;
  }
  if (!["user", "contributor", "admin"].includes(role)) {
    return null;
  }

  const repository = getUserRepository();
  const users = await repository.findAll();

  // Check if user already exists
  if (users.some((u) => u.mobile === normalizedMobile)) {
    return null;
  }

  const newUser = {
    id: `u-${Date.now()}-${crypto.randomUUID()}`,
    mobile: normalizedMobile,
    name: normalizedName,
    initials: normalizedInitials,
    role,
    passwordHash: hashPassword(password),
  };

  await repository.insert(newUser);

  return sanitizeUser(newUser);
}

async function deleteUser(userId) {
  return getUserRepository().remove(userId);
}

module.exports = {
  getAllUsers,
  createUser,
  deleteUser,
};
