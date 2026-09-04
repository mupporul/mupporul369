const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

const readEnv = (key) => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env[key];
  }

  return undefined;
};

const normalizeBaseUrl = (value) => {
  if (!value) {
    return "";
  }

  return value.replace(/\/+$/, "");
};

/**
 * Builds an API URL using the configured Vite environment variables.
 *
 * @param {string} path - Relative API path or absolute URL.
 * @returns {string} Normalized request URL.
 */
export function buildApiUrl(path) {
  if (ABSOLUTE_URL_PATTERN.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const apiBaseUrl = normalizeBaseUrl(readEnv("VITE_API_BASE_URL"));

  if (!apiBaseUrl) {
    return normalizedPath;
  }

  return `${apiBaseUrl}${normalizedPath}`;
}
