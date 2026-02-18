import sharp from "sharp";
import axios from "axios";
import fs from "fs";
import path from "path";

export const preprocessImage = async (imageUrl) => {
  const response = await axios.get(imageUrl, {
    responseType: "arraybuffer",
  });

  const buffer = Buffer.from(response.data);

  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  const tempImagePath = path.join(
    tempDir,
    `bw-${Date.now()}.png`
  );

  const image = sharp(buffer);
  const metadata = await image.metadata();


  const minWidth = Math.max(metadata.width, 600);
  const minHeight = Math.max(metadata.height, 400);

  await image
    .resize(minWidth, minHeight, {
      fit: "inside",
      withoutEnlargement: false, // 🔥 important
    })
    .grayscale()
    // .normalize()
    .sharpen()
    .toFile(tempImagePath);

  return tempImagePath;
};