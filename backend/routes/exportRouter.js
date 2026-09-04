"use strict";

const express = require("express");
const fs = require("fs");
const path = require("path");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

const DATA_DIR = path.join(__dirname, "../data");

const router = express.Router();

function getJsonFiles() {
  return fs
    .readdirSync(DATA_DIR)
    .filter((name) => name.toLowerCase().endsWith(".json"))
    .sort();
}

function resolveJsonPath(fileName) {
  const safeName = String(fileName || "").trim();
  if (!/^[a-zA-Z0-9._-]+\.json$/.test(safeName)) {
    return "";
  }

  const knownFiles = getJsonFiles();
  if (!knownFiles.includes(safeName)) {
    return "";
  }

  return path.join(DATA_DIR, safeName);
}

// All export endpoints require authentication and admin role
router.use(requireAuth);
router.use(requireRole(["admin"]));

// GET /api/export/files — list all import/export eligible JSON files
router.get("/files", (_req, res) => {
  try {
    return res.json(getJsonFiles());
  } catch {
    return res.status(500).json({ error: "Failed to list data files" });
  }
});

// GET /api/export/download/:fileName — download a specific JSON file
router.get("/download/:fileName", (req, res) => {
  const filePath = resolveJsonPath(req.params.fileName);
  if (!filePath) {
    return res.status(404).json({ error: "File not found" });
  }

  try {
    const data = fs.readFileSync(filePath, "utf8");
    const fileName = path.basename(filePath);

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    return res.send(data);
  } catch {
    return res.status(500).json({ error: "Failed to export file" });
  }
});

// POST /api/export/import/:fileName — import a specific JSON file
router.post("/import/:fileName", (req, res) => {
  const filePath = resolveJsonPath(req.params.fileName);
  if (!filePath) {
    return res.status(404).json({ error: "File not found" });
  }

  const { data } = req.body || {};
  if (data === undefined) {
    return res.status(400).json({ error: "Missing data payload" });
  }

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    return res.json({ success: true, fileName: path.basename(filePath) });
  } catch {
    return res.status(500).json({ error: "Failed to import file" });
  }
});

module.exports = router;
