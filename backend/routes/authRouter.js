"use strict";

const express = require("express");
const { loginUser } = require("../services/authService");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

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

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
