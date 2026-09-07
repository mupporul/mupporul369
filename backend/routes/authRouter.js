"use strict";

const express = require("express");
const {
  changePassword,
  loginUser,
  logoutUser,
} = require("../services/authService");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

function extractToken(authHeader) {
  const raw = String(authHeader || "").trim();
  if (!raw) return "";
  return raw.replace(/^Bearer\s+/i, "").trim();
}

router.post("/login", async (req, res) => {
  const { mobile, password } = req.body || {};
  if (typeof mobile !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Mobile and password are required" });
  }

  const loggedIn = await loginUser(mobile, password);
  if (!loggedIn) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  return res.json(loggedIn);
});

router.post("/change-password", async (req, res) => {
  const { mobile, oldPassword, newPassword } = req.body || {};
  if (
    typeof mobile !== "string" ||
    typeof oldPassword !== "string" ||
    typeof newPassword !== "string"
  ) {
    return res
      .status(400)
      .json({ error: "Mobile, old password, and new password are required" });
  }

  const changed = await changePassword(mobile, oldPassword, newPassword);
  if (!changed) {
    return res.status(401).json({ error: "Invalid mobile or old password" });
  }

  return res.json({ message: "Password updated successfully" });
});

router.post("/logout", requireAuth, async (req, res) => {
  const token = extractToken(req.headers.authorization);
  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  const loggedOut = await logoutUser(token);
  if (!loggedOut) {
    return res.status(200).json({ message: "Logged out successfully" });
  }

  return res.json({ message: "Logged out successfully" });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
