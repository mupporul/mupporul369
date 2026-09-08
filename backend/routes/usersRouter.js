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

// All user endpoints require authentication.
router.use(requireAuth);

// GET /api/users/contributors — list contributor users for dynamic review chips
router.get(
  "/contributors",
  requireRole(["contributor", "admin"]),
  async (_req, res) => {
    try {
      const users = await getAllUsers();
      return res.json(users.filter((user) => user.role === "contributor"));
    } catch {
      return res.status(500).json({ error: "Failed to fetch contributors" });
    }
  },
);

// Admin-only endpoints.
router.use(requireRole(["admin"]));

// GET /api/users — list all users
router.get("/", async (_req, res) => {
  try {
    const users = await getAllUsers();
    return res.json(users);
  } catch {
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

// POST /api/users — create new user
router.post("/", async (req, res) => {
  try {
    const { mobile, password, name, initials, role } = req.body;

    if (!mobile || !password || !name || !initials || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!/^\d{12}$/.test(String(mobile).trim())) {
      return res.status(400).json({ error: "Mobile must be 12 digits" });
    }

    const user = await createUser(mobile, password, name, initials, role);
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
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const success = await deleteUser(id);

    if (!success) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;
