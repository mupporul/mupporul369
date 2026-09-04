"use strict";

const fs = require("fs");
const path = require("path");

const TEMPLES_PATH = path.join(__dirname, "../data/temples.json");
const REVIEW_PATH = path.join(__dirname, "../data/review.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function readTemples() {
  return readJson(TEMPLES_PATH);
}

function writeTemples(data) {
  writeJson(TEMPLES_PATH, data);
}

function readReviews() {
  return readJson(REVIEW_PATH);
}

function writeReviews(data) {
  writeJson(REVIEW_PATH, data);
}

module.exports = {
  readTemples,
  writeTemples,
  readReviews,
  writeReviews,
};
