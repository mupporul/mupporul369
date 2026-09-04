"use strict";

const TABLE_TEMPLE_GROUPS = "temple_groups";
const TABLE_REVIEWS = "reviews_queue";

function getSupabaseConfig() {
  const url = String(process.env.SUPABASE_URL || "")
    .trim()
    .replace(/\/$/, "");
  const serviceRoleKey = String(
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  ).trim();

  if (!url) {
    throw new Error("SUPABASE_URL is required when DATA_PROVIDER=supabase");
  }

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required when DATA_PROVIDER=supabase",
    );
  }

  return { url, serviceRoleKey };
}

function getHeaders(serviceRoleKey, extraHeaders = {}) {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    ...extraHeaders,
  };
}

async function requestSupabase(relativePath, options = {}) {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const response = await globalThis.fetch(`${url}/rest/v1/${relativePath}`, {
    ...options,
    headers: getHeaders(serviceRoleKey, options.headers),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Supabase request failed (${response.status}): ${errorText || "unknown error"}`,
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function normalizeTempleGroupRow(row) {
  return {
    house: row.house,
    planets: Array.isArray(row.planets) ? row.planets : [],
    data: Array.isArray(row.data) ? row.data : [],
  };
}

function normalizeReviewRow(row) {
  return {
    id: row.id,
    action: row.action,
    templeId: row.temple_id,
    payload: row.payload || {},
    status: row.status || "pending",
    approvals: Array.isArray(row.approvals) ? row.approvals : [],
    createdBy: row.created_by || null,
    createdAt: row.created_at || null,
    modifiedBy: row.modified_by || undefined,
    modifiedAt: row.modified_at || undefined,
  };
}

async function replaceTable(tableName, rows) {
  await requestSupabase(`${tableName}`, {
    method: "DELETE",
    headers: {
      Prefer: "return=minimal",
    },
  });

  if (!rows.length) {
    return;
  }

  await requestSupabase(`${tableName}`, {
    method: "POST",
    headers: {
      Prefer: "return=minimal",
    },
    body: JSON.stringify(rows),
  });
}

async function readTemples() {
  const rows = await requestSupabase(
    `${TABLE_TEMPLE_GROUPS}?select=house,planets,data&order=sort_order.asc.nullslast,house.asc`,
  );

  return rows.map(normalizeTempleGroupRow);
}

async function writeTemples(data) {
  const rows = (Array.isArray(data) ? data : []).map((group, index) => ({
    house: group.house,
    planets: Array.isArray(group.planets) ? group.planets : [],
    data: Array.isArray(group.data) ? group.data : [],
    sort_order: index,
  }));

  await replaceTable(TABLE_TEMPLE_GROUPS, rows);
}

async function readReviews() {
  const rows = await requestSupabase(
    `${TABLE_REVIEWS}?select=id,action,temple_id,payload,status,approvals,created_by,created_at,modified_by,modified_at&order=created_at.asc`,
  );

  return rows.map(normalizeReviewRow);
}

async function writeReviews(data) {
  const rows = (Array.isArray(data) ? data : []).map((review) => ({
    id: review.id,
    action: review.action,
    temple_id: review.templeId,
    payload: review.payload || {},
    status: review.status || "pending",
    approvals: Array.isArray(review.approvals) ? review.approvals : [],
    created_by: review.createdBy || null,
    created_at: review.createdAt || new Date().toISOString(),
    modified_by: review.modifiedBy || null,
    modified_at: review.modifiedAt || null,
  }));

  await replaceTable(TABLE_REVIEWS, rows);
}

module.exports = {
  readTemples,
  writeTemples,
  readReviews,
  writeReviews,
};
