import Tesseract from "tesseract.js";

export const extractTextFromImage = async (imageUrl) => {
  try {
    const result = await Tesseract.recognize(
      imageUrl,
      "eng",
      {
         tessedit_pageseg_mode: 6,
          user_defined_dpi: 300,
        preserve_interword_spaces: 1,
        // logger: (m) => console.log(m),
      }
    );

    return result.data.text;
  } catch (error) {
    console.error("Tesseract OCR Error:", error);
    return null;
  }
};