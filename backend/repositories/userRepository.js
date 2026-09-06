"use strict";

const fs = require("fs");
const path = require("path");

const USERS_PATH = path.join(__dirname, "../data/users.json");
const jsonRepository = {
  findAll: async () => JSON.parse(fs.readFileSync(USERS_PATH, "utf8")),
  findByMobile: async (mobile) =>
    JSON.parse(fs.readFileSync(USERS_PATH, "utf8")).find(
      (user) => user.mobile === mobile,
    ) || null,
  findById: async (id) =>
    JSON.parse(fs.readFileSync(USERS_PATH, "utf8")).find(
      (user) => user.id === id,
    ) || null,
  insert: async (user) => {
    const users = JSON.parse(fs.readFileSync(USERS_PATH, "utf8"));
    users.push(user);
    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2), "utf8");
    return user;
  },
  remove: async (id) => {
    const users = JSON.parse(fs.readFileSync(USERS_PATH, "utf8"));
    const remaining = users.filter((user) => user.id !== id);
    if (remaining.length === users.length) return false;
    fs.writeFileSync(USERS_PATH, JSON.stringify(remaining, null, 2), "utf8");
    return true;
  },
};

function getUserRepository() {
  if (
    process.env.NODE_ENV !== "test" &&
    String(process.env.DATA_PROVIDER || "json").trim().toLowerCase() ===
      "supabase"
  ) {
    return require("./supabaseUserRepository");
  }
  return jsonRepository;
}

module.exports = { getUserRepository };