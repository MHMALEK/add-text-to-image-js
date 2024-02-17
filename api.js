const app = require("./server");
const addTextService = require("./image.service");
const startBot = require("./bot.service");

// API endpoint for adding text to image
app.post("/create", async (req, res) => {
  try {
    const { text, url } = req.body;
    const image = await addTextService(url, text);
    res.json({ message: "Image created successfully", image });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

startBot();
