import { extractTextFromImage } from "./tesseractOCR.js";

const test = async () => {
  const text = await extractTextFromImage(
    "https://res.cloudinary.com/dww5caj7u/image/upload/v1771344355/id-cards/ozkzsmve2sfe7h2wjpzw.jpg"
  );

  console.log("Extracted Text:");
  console.log(text);
};

test();