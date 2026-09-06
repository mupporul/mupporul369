"use strict";

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { requestSupabase } = require("../repositories/supabaseClient");

const USERS_PATH = path.join(__dirname, "../data/users.json");

async function migrateUsers() {
  const users = JSON.parse(fs.readFileSync(USERS_PATH, "utf8"));
  const rows = users.map((user) => ({
    id: user.id,
    mobile: user.mobile,
    initials: user.initials,
    name: user.name || user.initials,
    role: user.role,
    password_hash: user.passwordHash,
  }));

  await requestSupabase("users?on_conflict=id", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(rows),
  });

  process.stdout.write(`Migrated ${rows.length} users to Supabase.\n`);
}

migrateUsers().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});