"use strict";

const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");
const {
  approveReview,
  deleteReview,
  readReviews,
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
