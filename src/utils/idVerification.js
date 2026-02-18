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
      text.includes("CHITKARA") ||
      text.includes("UNIVERSITY"),

    name: fuzzyMatch(text, userName.toUpperCase()),

    roll: text.includes(rollNumber),

    structure:
      (
        text.includes("SESSION") ||
        text.includes("BLOOD")
      ) &&
      (
        text.includes("ID") || text.includes("CARD") || text.includes("IDENTITY")||text.includes("FATHER")||text.includes("MOTHER")
      ),
  };

  const allPassed = Object.values(checks).every(Boolean);

  return {
    verified: allPassed,
    checks,
  };
};