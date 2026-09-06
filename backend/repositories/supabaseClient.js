"use strict";

function getSupabaseConfig() {
  const url = String(process.env.SUPABASE_URL || "")
    .trim()
    .replace(/\/$/, "");
  const serviceRoleKey = String(
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  ).trim();

  if (!url) {
    throw new Error("SUPABASE_URL is required when using Supabase");
  }

  if (!serviceRoleKey || serviceRoleKey === "your_service_role_key") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY must contain the Supabase service role key",
    );
  }

  return { url, serviceRoleKey };
}

async function requestSupabase(relativePath, options = {}) {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const response = await globalThis.fetch(`${url}/rest/v1/${relativePath}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Supabase request failed (${response.status}): ${errorText || "unknown error"}`,
    );
  }

  const responseText = await response.text();
  return responseText ? JSON.parse(responseText) : null;
}

module.exports = { requestSupabase };