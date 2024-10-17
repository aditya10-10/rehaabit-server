/**
 * Creates a URL-friendly slug from a given string value.
 * @param {string} value - The string to convert into a slug.
 * @returns {string} The generated slug.
 */
const createSlug = (value) => {
    if (value && typeof value === "string") {
      return value
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z\d\s]+/g, "-")
        .replace(/\s/g, "-");
    }
    return "";
  };
  
module.exports = { createSlug };