const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs");

// Register a custom font
registerFont("font/Digi Nozha2 Bold.ttf", { family: "nozha" });
registerFont("font/Digi Sarve Bold.otf", { family: "sarve" });

const setFont = (ctx, fontFamily, fontSize = "60") => {
  // Set the font properties
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = "black";
};

const saveImage = async (canvas, path) => {
  // Save the new image
  try {
    await fs.writeFileSync(`${path}.png`, canvas.toBuffer());
    return path.concat(".png");
  } catch (error) {
    throw new Error(error);
  }
};

const addTextService = async (url, text, font, path) => {
  try {
    // Load the image
    const image = await loadImage(url);
    // Create a new canvas with the same dimensions as the image
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // Draw the image onto the canvas
    ctx.drawImage(image, 0, 0, image.width, image.height);
    // Set the font
    setFont(ctx, font);
    // Add text to the image
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 240);
    const localPath = await saveImage(canvas, path);
    // Convert the canvas to a Buffer
    return localPath;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = addTextService;
