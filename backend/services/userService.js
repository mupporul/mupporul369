"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const USERS_PATH = path.join(__dirname, "../data/users.json");

function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_PATH, "utf8"));
}

function writeUsers(users) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), "utf8");
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

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

function getAllUsers() {
  const users = readUsers();
  return users.map(sanitizeUser);
}

function createUser(mobile, password, name, initials, role) {
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

  const users = readUsers();

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

  users.push(newUser);
  writeUsers(users);

  return sanitizeUser(newUser);
}

function deleteUser(userId) {
  const users = readUsers();
  const index = users.findIndex((u) => u.id === userId);

  if (index === -1) {
    return false;
  }

  users.splice(index, 1);
  writeUsers(users);
  return true;
}

module.exports = {
  getAllUsers,
  createUser,
  deleteUser,
};
