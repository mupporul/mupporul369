const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "")
  .trim()
  .replace(/\/$/, "");

/**
 * Builds an absolute API URL when VITE_API_BASE_URL is set.
 * Falls back to the same relative URL for local proxy-based development.
 *
 * @param {string} path
 * @returns {string}
 */
export function buildApiUrl(path) {
  if (!path || typeof path !== "string") {
    return path;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}
