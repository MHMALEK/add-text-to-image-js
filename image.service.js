const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");

// Register a custom font
registerFont("font/nozha2.otf", { family: "nozha" });
registerFont("font/sarve.otf", { family: "sarve" });

const setFont = (ctx, fontFamily, fontSize = "60") => {
  // Set the font properties
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = "black";
};

const saveImage = async (canvas, file_name) => {
  // Save the new image
  try {
    const extention = ".png";
    const saveDir = path.resolve(__dirname, "./images-temp");
    const fullName = `${saveDir}/${file_name}${extention}`;
    await fs.writeFileSync(fullName, canvas.toBuffer());
    return fullName;
  } catch (error) {
    throw new Error(error);
  }
};

const addTextService = async (url, text, font, file_name) => {
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

    // Create a semi-transparent overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set the font and color
    setFont(ctx, font);
    ctx.fillStyle = "white";

    // Split the text into lines
    const words = text.split(" ");
    let line = "";
    let lines = [];

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const testWidth = testLine.length * 10; // Estimating width with 10px per character
      if (testWidth > 420 && n > 0) {
        lines.push(line);
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    // Add text to the image
    const lineHeight = 70; // Define the line height
    const yStart = (canvas.height - lines.length * lineHeight) / 2; // Determine the starting y coordinate
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], canvas.width / 2, yStart + i * lineHeight);
    }

    const localPath = await saveImage(canvas, file_name);
    // Convert the canvas to a Buffer
    return localPath;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = addTextService;
