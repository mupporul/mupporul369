"use strict";

const { requestSupabase } = require("./supabaseClient");

const USER_COLUMNS = "id,mobile,initials,name,role,password_hash";

function toUser(row) {
  return {
    id: row.id,
    mobile: row.mobile,
    initials: row.initials,
    name: row.name || undefined,
    role: row.role,
    passwordHash: row.password_hash,
  };
}

async function findByMobile(mobile) {
  const rows = await requestSupabase(
    `users?select=${USER_COLUMNS}&mobile=eq.${encodeURIComponent(mobile)}&limit=1`,
  );
  return rows[0] ? toUser(rows[0]) : null;
}

async function findById(id) {
  const rows = await requestSupabase(
    `users?select=${USER_COLUMNS}&id=eq.${encodeURIComponent(id)}&limit=1`,
  );
  return rows[0] ? toUser(rows[0]) : null;
}

async function findAll() {
  const rows = await requestSupabase(
    `users?select=${USER_COLUMNS}&order=created_at.asc`,
  );
  return rows.map(toUser);
}

async function insert(user) {
  const rows = await requestSupabase("users", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      id: user.id,
      mobile: user.mobile,
      initials: user.initials,
      name: user.name,
      role: user.role,
      password_hash: user.passwordHash,
    }),
  });
  return rows[0] ? toUser(rows[0]) : null;
}

async function remove(id) {
  const rows = await requestSupabase(`users?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=representation" },
  });
  return rows.length > 0;
}

module.exports = { findByMobile, findById, findAll, insert, remove };