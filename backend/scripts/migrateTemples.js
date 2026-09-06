"use strict";

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const {
  writeTemples,
} = require("../repositories/supabaseTempleReviewRepository");

const TEMPLES_PATH = path.join(__dirname, "../data/temples.json");

async function migrateTemples() {
  const temples = JSON.parse(fs.readFileSync(TEMPLES_PATH, "utf8"));
  await writeTemples(temples);

  const templeCount = temples.reduce(
    (total, group) => total + (Array.isArray(group.data) ? group.data.length : 0),
    0,
  );
  process.stdout.write(
    `Migrated ${temples.length} temple groups and ${templeCount} temples to Supabase.\n`,
  );
}

migrateTemples().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});