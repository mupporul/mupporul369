/**
 * Convert a string to Title Case.
 *
 * @param {string} value - The string to convert
 * @returns {string} The title-cased string
 */
export function toTitleCase(value) {
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
