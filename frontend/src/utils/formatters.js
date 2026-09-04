/**
 * Formats an ISO date string into a readable local timestamp.
 *
 * @param {string} value - ISO date string.
 * @returns {string} Localized date and time label.
 */
export function formatDateTime(value) {
  if (!value) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

/**
 * Builds the display title for a grouped temple response section.
 *
 * @param {string} house - House label.
 * @param {string[]} planets - Planet names.
 * @returns {string} Human readable title.
 */
export function formatTempleGroupTitle(house, planets) {
  const planetLabel = planets?.length ? planets.join(", ") : "No planets";
  return `${house} · ${planetLabel}`;
}

/**
 * Summarizes the number of temples in a group.
 *
 * @param {number} count - Number of temple rows.
 * @returns {string} Readable summary.
 */
export function summarizeTempleCount(count) {
  return `${count} temple${count === 1 ? "" : "s"}`;
}
