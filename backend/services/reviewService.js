"use strict";

const crypto = require("crypto");
const {
  getTempleReviewRepository,
} = require("../repositories/templeReviewRepository");
const MIN_APPROVALS = 2;
const UNKNOWN_HOUSE = "தெரியாது";

function readTemples() {
  return getTempleReviewRepository().readTemples();
}

function writeTemples(data) {
  return getTempleReviewRepository().writeTemples(data);
}

function readReviews() {
  return getTempleReviewRepository().readReviews();
}

function writeReviews(data) {
  return getTempleReviewRepository().writeReviews(data);
}

function toTitleCase(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .map((word) =>
      word
        ? word.charAt(0).toLocaleUpperCase() + word.slice(1).toLocaleLowerCase()
        : word,
    )
    .join(" ");
}

function normalizeTemplePayload(payload) {
  const { temple, location, state, url, house, planets } = payload || {};
  const houseText = typeof house === "string" ? house.trim() : "";
  const urlText = typeof url === "string" ? url.trim() : "";
  const normalizedPlanets = [
    ...new Set(
      (Array.isArray(planets) ? planets : [])
        .map((p) => String(p).trim())
        .filter(Boolean),
    ),
  ].sort();

  if (
    typeof temple !== "string" ||
    !temple.trim() ||
    typeof location !== "string" ||
    !location.trim() ||
    typeof state !== "string" ||
    !state.trim() ||
    typeof house !== "string" ||
    !Array.isArray(planets) ||
    normalizedPlanets.length === 0
  ) {
    return null;
  }

  return {
    temple: toTitleCase(temple),
    location: toTitleCase(location),
    state: toTitleCase(state),
    url: urlText,
    house: houseText || UNKNOWN_HOUSE,
    planets: normalizedPlanets,
  };
}

function findTempleContextById(groups, templeId) {
  for (const group of groups) {
    const temple = group.data.find((item) => item.id === templeId);
    if (temple) {
      return { group, temple };
    }
  }
  return null;
}

function sameGroup(group, house, planets) {
  return (
    group.house === house &&
    JSON.stringify([...group.planets].sort()) ===
      JSON.stringify([...planets].sort())
  );
}

async function queueReview(action, payload, user, templeId) {
  const reviews = await readReviews();
  const reviewItem = {
    id: crypto.randomUUID(),
    action,
    templeId: templeId || null,
    payload,
    status: "pending",
    approvals: [],
    createdBy: {
      userId: user.id,
      mobile: user.mobile,
      initials: user.initials,
      role: user.role,
    },
    createdAt: new Date().toISOString(),
  };

  // For edit actions, also track who initiated the modification
  if (action === "edit") {
    reviewItem.modifiedBy = {
      userId: user.id,
      mobile: user.mobile,
      initials: user.initials,
      role: user.role,
    };
    reviewItem.modifiedAt = new Date().toISOString();
  }

  reviews.push(reviewItem);
  await writeReviews(reviews);
  return reviewItem;
}

async function queueTempleAddition(payload, user) {
  return queueReview("add", payload, user);
}

async function queueTempleEdit(templeId, payload, user) {
  const groups = await readTemples();
  const context = findTempleContextById(groups, templeId);
  if (!context) {
    return null;
  }

  const existingTempleName = toTitleCase(context.temple.temple);
  const existingLocation = toTitleCase(context.temple.location);
  const existingState = toTitleCase(context.temple.state);
  const existingUrl = String(context.temple.url || "").trim();
  const existingHouse =
    String(context.group.house || "").trim() || UNKNOWN_HOUSE;
  const existingPlanets = [...(context.group.planets || [])].sort();
  const nextPlanets = [...payload.planets].sort();
  const hasChanges =
    payload.temple !== existingTempleName ||
    payload.location !== existingLocation ||
    payload.state !== existingState ||
    payload.url !== existingUrl ||
    payload.house !== existingHouse ||
    JSON.stringify(nextPlanets) !== JSON.stringify(existingPlanets);

  if (!hasChanges) {
    return { noChanges: true };
  }

  return queueReview("edit", payload, user, templeId);
}

function addTempleToGroups(groups, normalized) {
  const targetGroup = groups.find((group) =>
    sameGroup(group, normalized.house, normalized.planets),
  );
  const newTemple = {
    id: crypto.randomUUID(),
    temple: normalized.temple,
    location: normalized.location,
    state: normalized.state,
  };

  if (normalized.url) {
    newTemple.url = normalized.url;
  }

  if (targetGroup) {
    targetGroup.data.push(newTemple);
  } else {
    groups.push({
      house: normalized.house,
      planets: normalized.planets,
      data: [newTemple],
    });
  }
}

function applyTempleEdit(groups, templeId, normalized) {
  let sourceGroup = null;
  let sourceIndex = -1;

  for (const group of groups) {
    const idx = group.data.findIndex((item) => item.id === templeId);
    if (idx !== -1) {
      sourceGroup = group;
      sourceIndex = idx;
      break;
    }
  }

  if (!sourceGroup) {
    return false;
  }

  const [originalTemple] = sourceGroup.data.splice(sourceIndex, 1);
  if (sourceGroup.data.length === 0) {
    const emptyIdx = groups.indexOf(sourceGroup);
    groups.splice(emptyIdx, 1);
  }

  const updatedTemple = {
    id: originalTemple.id,
    temple: normalized.temple,
    location: normalized.location,
    state: normalized.state,
  };

  if (normalized.url) {
    updatedTemple.url = normalized.url;
  }

  const targetGroup = groups.find((group) =>
    sameGroup(group, normalized.house, normalized.planets),
  );
  if (targetGroup) {
    targetGroup.data.push(updatedTemple);
  } else {
    groups.push({
      house: normalized.house,
      planets: normalized.planets,
      data: [updatedTemple],
    });
  }

  return true;
}

async function applyReview(reviewItem) {
  const groups = await readTemples();
  if (reviewItem.action === "add") {
    addTempleToGroups(groups, reviewItem.payload);
    await writeTemples(groups);
    return true;
  }

  if (reviewItem.action === "edit") {
    const applied = applyTempleEdit(
      groups,
      reviewItem.templeId,
      reviewItem.payload,
    );
    if (applied) {
      await writeTemples(groups);
    }
    return applied;
  }

  return false;
}

async function approveReview(reviewId, user) {
  const reviews = await readReviews();
  const reviewItem = reviews.find((item) => item.id === reviewId);

  if (!reviewItem) {
    return { notFound: true };
  }

  const alreadyApproved = reviewItem.approvals.some(
    (item) => item.userId === user.id,
  );
  if (!alreadyApproved) {
    reviewItem.approvals.push({
      userId: user.id,
      initials: user.initials,
      mobile: user.mobile,
      approvedAt: new Date().toISOString(),
    });
  }

  let applied = false;
  if (reviewItem.approvals.length >= MIN_APPROVALS) {
    applied = await applyReview(reviewItem);
    const reviewIndex = reviews.findIndex((item) => item.id === reviewId);
    if (reviewIndex !== -1) {
      reviews.splice(reviewIndex, 1);
    }
  }

  await writeReviews(reviews);

  return {
    notFound: false,
    reviews,
    temples: await readTemples(),
    applied,
  };
}

async function deleteReview(reviewId) {
  const reviews = await readReviews();
  const reviewIndex = reviews.findIndex((item) => item.id === reviewId);

  if (reviewIndex === -1) {
    return { notFound: true };
  }

  reviews.splice(reviewIndex, 1);
  await writeReviews(reviews);

  return {
    notFound: false,
    reviews,
  };
}

module.exports = {
  normalizeTemplePayload,
  queueTempleAddition,
  queueTempleEdit,
  approveReview,
  deleteReview,
  readTemples,
  readReviews,
};
