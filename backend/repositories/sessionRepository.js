"use strict";

const { requestSupabase } = require("./supabaseClient");

const SESSION_COLUMNS = "token,user_id,expires_at,created_at";
const inMemorySessions = new Map();

function toSession(row) {
  return {
    token: row.token,
    userId: row.user_id,
    expiresAt: new Date(row.expires_at).getTime(),
  };
}

const jsonRepository = {
  async createSession(token, userId, expiresAt) {
    inMemorySessions.set(token, { token, userId, expiresAt });
    return { token, userId, expiresAt };
  },

  async findByToken(token) {
    const session = inMemorySessions.get(token);
    if (!session) return null;
    return { ...session };
  },

  async deleteByToken(token) {
    if (!inMemorySessions.has(token)) return false;
    inMemorySessions.delete(token);
    return true;
  },
};

const supabaseRepository = {
  async createSession(token, userId, expiresAt) {
    const rows = await requestSupabase("sessions", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        token,
        user_id: userId,
        expires_at: new Date(expiresAt).toISOString(),
      }),
    });

    return rows && rows[0] ? toSession(rows[0]) : null;
  },

  async findByToken(token) {
    const rows = await requestSupabase(
      `sessions?select=${SESSION_COLUMNS}&token=eq.${encodeURIComponent(token)}&limit=1`,
    );

    return rows && rows[0] ? toSession(rows[0]) : null;
  },

  async deleteByToken(token) {
    const rows = await requestSupabase(
      `sessions?token=eq.${encodeURIComponent(token)}`,
      {
        method: "DELETE",
        headers: { Prefer: "return=representation" },
      },
    );

    return Array.isArray(rows) ? rows.length > 0 : false;
  },
};

function getSessionRepository() {
  if (
    process.env.NODE_ENV !== "test" &&
    String(process.env.DATA_PROVIDER || "json").trim().toLowerCase() ===
      "supabase"
  ) {
    return supabaseRepository;
  }

  return jsonRepository;
}

module.exports = { getSessionRepository };
