export const normalizeText = (text) => {
  return text
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/[^A-Z0-9 ]/g, "")
    .trim();
};