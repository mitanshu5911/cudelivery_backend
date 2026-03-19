import { normalizeText } from "./normalizeText.js";
import { fuzzyMatch } from "./fuzzyMatch.js";

export const verifyIdCard = ({
  ocrText,
  userName,
  rollNumber,
}) => {
  const text = normalizeText(ocrText);
  console.log("Normalized OCR Text:", text);
  const checks = {
  university:
    fuzzyMatch(text, "CHITKARA") ||
    fuzzyMatch(text, "UNIVERSITY"),

  name: fuzzyMatch(text, userName.toUpperCase()),

  roll: text.includes(rollNumber),
  structure:
    (
      fuzzyMatch(text, "SESSION") ||
      fuzzyMatch(text, "BLOOD")
    ) &&
    (
      fuzzyMatch(text, "ID") ||
      fuzzyMatch(text, "CARD") ||
      fuzzyMatch(text, "IDENTITY") ||
      fuzzyMatch(text, "FATHER") ||
      fuzzyMatch(text, "MOTHER")
    ),
};
  const allPassed = Object.values(checks).every(Boolean);
  console.log(checks);
  return {
    verified: allPassed,
    checks,
    
  };
};