"use strict";

const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");
const {
  approveReview,
  deleteReview,
  normalizeTemplePayload,
  readReviews,
  updateReview,
} = require("../services/reviewService");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (_req, res, next) => {
  try {
    res.json(await readReviews());
  } catch (error) {
    next(error);
  }
});

router.post("/:id/approve", async (req, res, next) => {
  const { id } = req.params;
  let result;

  try {
    result = await approveReview(id, req.user);
  } catch (error) {
    return next(error);
  }

  if (result.notFound) {
    return res.status(404).json({ error: "Review item not found" });
  }

  return res.json({
    reviews: result.reviews,
    temples: result.temples,
    applied: result.applied,
  });
});

router.patch(
  "/:id",
  requireRole(["contributor", "admin"]),
  async (req, res, next) => {
    const normalized = normalizeTemplePayload(req.body);
    if (!normalized) {
      return res
        .status(400)
        .json({ error: "Missing or invalid required fields" });
    }

    try {
      const result = await updateReview(req.params.id, normalized, req.user);
      if (result.notFound) {
        return res.status(404).json({ error: "Review item not found" });
      }

      return res.json({ review: result.review });
    } catch (error) {
      return next(error);
    }
  },
);

router.delete(
  "/:id",
  requireRole(["contributor", "admin"]),
  async (req, res, next) => {
    const { id } = req.params;
    let result;

    try {
      result = await deleteReview(id);
    } catch (error) {
      return next(error);
    }

    if (result.notFound) {
      return res.status(404).json({ error: "Review item not found" });
    }

    return res.json({
      reviews: result.reviews,
    });
  },
);

module.exports = router;
