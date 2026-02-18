import fs from "fs";
import {preprocessImage} from "../utils/preprocessImage.js";
import { extractTextFromImage } from "../utils/tesseractOCR.js";
import { verifyIdCard } from "../utils/idVerification.js";

export const verifyIdCardImage = async ({
  imageUrl,
  userName,
  rollNumber,
}) => {
  let tempImagePath;

  try {
    tempImagePath = await preprocessImage(imageUrl);

    const ocrText = await extractTextFromImage(tempImagePath);

    if (!ocrText) {
      return { verified: false, error: "OCR failed" };
    }

    return verifyIdCard({
      ocrText,
      userName,
      rollNumber,
    });
  } catch (error) {
    console.error("ID Verification Error:", error);
    return { verified: false, error: "Verification failed" };
  } finally {
    if (tempImagePath && fs.existsSync(tempImagePath)) {
      fs.unlinkSync(tempImagePath);
    }
  }
};