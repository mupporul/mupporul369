"use strict";

const jsonRepository = require("./jsonTempleReviewRepository");

const DATA_PROVIDER_JSON = "json";
const DATA_PROVIDER_SUPABASE = "supabase";

function getConfiguredDataProvider() {
  return String(process.env.DATA_PROVIDER || DATA_PROVIDER_JSON)
    .trim()
    .toLowerCase();
}

function getTempleReviewRepository() {
  const configuredProvider = getConfiguredDataProvider();

  if (
    process.env.NODE_ENV !== "test" &&
    configuredProvider === DATA_PROVIDER_SUPABASE
  ) {
    // Lazy-load Supabase repository so JSON mode remains dependency-free.
    const supabaseRepository = require("./supabaseTempleReviewRepository");
    return supabaseRepository;
  }

  return jsonRepository;
}

module.exports = {
  DATA_PROVIDER_JSON,
  DATA_PROVIDER_SUPABASE,
  getConfiguredDataProvider,
  getTempleReviewRepository,
};
