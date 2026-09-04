"use strict";

const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");
const {
  getAllUsers,
  createUser,
  deleteUser,
} = require("../services/userService");

const router = express.Router();

// All user endpoints require authentication and admin role
router.use(requireAuth);
router.use(requireRole(["admin"]));

// GET /api/users — list all users
router.get("/", (_req, res) => {
  try {
    const users = getAllUsers();
    return res.json(users);
  } catch {
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

// POST /api/users — create new user
router.post("/", (req, res) => {
  try {
    const { mobile, password, name, initials, role } = req.body;

    if (!mobile || !password || !name || !initials || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!/^\d{12}$/.test(String(mobile).trim())) {
      return res.status(400).json({ error: "Mobile must be 12 digits" });
    }

    const user = createUser(mobile, password, name, initials, role);
    if (!user) {
      return res
        .status(400)
        .json({ error: "User already exists or invalid input" });
    }

    return res.status(201).json(user);
  } catch {
    return res.status(500).json({ error: "Failed to create user" });
  }
});

// DELETE /api/users/:id — delete user
router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const success = deleteUser(id);

    if (!success) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;
