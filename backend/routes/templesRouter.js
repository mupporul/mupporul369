"use strict";

const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");
const {
  normalizeTemplePayload,
  queueTempleAddition,
  queueTempleEdit,
  readTemples,
} = require("../services/reviewService");

const router = express.Router();

// GET /api/temples — return full array
router.get("/", async (_req, res, next) => {
  try {
    res.json(await readTemples());
  } catch (error) {
    next(error);
  }
});

// POST /api/temples — queue new temple record for review
router.post(
  "/",
  requireAuth,
  requireRole(["contributor", "admin"]),
  async (req, res, next) => {
    const normalized = normalizeTemplePayload(req.body);
    if (!normalized) {
      return res
        .status(400)
        .json({ error: "Missing or invalid required fields" });
    }

    try {
      const reviewItem = await queueTempleAddition(normalized, req.user);
      return res.status(202).json({ queuedReview: reviewItem });
    } catch (error) {
      return next(error);
    }
  },
);

// PATCH /api/temples/:id — queue update for a temple by uuid
router.patch(
  "/:id",
  requireAuth,
  requireRole(["contributor", "admin"]),
  async (req, res, next) => {
    const { id } = req.params;
    const normalized = normalizeTemplePayload(req.body);

    if (!normalized) {
      return res
        .status(400)
        .json({ error: "Missing or invalid required fields" });
    }

    let reviewItem;
    try {
      reviewItem = await queueTempleEdit(id, normalized, req.user);
    } catch (error) {
      return next(error);
    }

    if (!reviewItem) {
      return res.status(404).json({ error: "Temple not found" });
    }

    if (reviewItem.noChanges) {
      return res.status(200).json({
        noChanges: true,
        message: "No changes detected",
      });
    }

    return res.status(202).json({ queuedReview: reviewItem });
  },
);

module.exports = router;
