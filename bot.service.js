const { Bot, InlineKeyboard, session } = require("grammy");
const addTextService = require("./image.service");
const dotenv = require("dotenv");
const firebase = require("./firebase.service");
const {
  getImageListFromStorage,
  deleteFileFromLocalStorage,
  getRandomImageFromStorage,
} = require("./utils");

dotenv.config();

let bot;
let chatId;
// Create a new bot
const createBot = () => {
  try {
    bot = new Bot(process.env.BOT_TOKEN);
    bot.api.sendMessage = async (chatId, text) => {};
  } catch (error) {
    throw new Error(error);
  }
};

createBot();

// Install session middleware, and define the initial session value.
function initial() {
  return { imageUrl: "", text: "" };
}

bot.use(session({ initial }));

// A simple start command
bot.command("start", (ctx) => {
  chatId = ctx.chat.id;
  // Send a welcome message
  ctx.reply(
    "Welcome! This bot allows you to create a love message with images. You can either upload your own image or choose a random image from our collection and add your text to it. What would you like to do?",
    {
      reply_markup: new InlineKeyboard()
        .text("Upload your own image", "upload")
        .row()
        .text("Random image from our gallery", "random"),
    }
  );
});

// Handle the InlineKeyboardButton callback queries
bot.callbackQuery("upload", async (ctx) => {
  // Ask the user to upload the image
  await ctx.answerCallbackQuery();
  await ctx.reply("Please upload your image.");
});

// Handle photo messages
bot.on("message:photo", async (ctx) => {
  try {
    const photo = ctx.message.photo;
    const fileId = photo[photo.length - 1].file_id;
    const file = await ctx.api.getFile(fileId);
    const url = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
    await ctx.reply(
      "Please enter your text! For better results, use short text and send it in one line."
    );
    // Save the image url in the session
    ctx.session.imageUrl = url;
  } catch (e) {
    sendErrorMessage(ctx.chat.id);
    throw new Error(e);
  }
});

bot.on("message:text", async (ctx) => {
  try {
    // Process the text and image
    const text = ctx.message.text;
    const chatId = ctx.chat.id;

    if (!ctx.session.imageUrl) {
      await ctx.reply(
        "Please upload an image first or use random button to select one from our templates."
      );
      return;
    }

    const fileName = `${chatId}-${Date.now().toString()}`;
    const fileNameWthExtension = `${fileName}.png`;

    // Implement your text processing function here
    const localPath = await addTextService(
      ctx.session.imageUrl,
      text,
      "nozha",
      fileName
    );
    const url = await firebase.uploadFile(localPath);
    await ctx.replyWithPhoto(url);
    await ctx.reply(
      "Your image is ready. Would you like to create another one? /start again ❤️ "
    );
    deleteFileFromLocalStorage(localPath);
    await firebase.deleteFile(fileNameWthExtension);
  } catch (e) {
    sendErrorMessage(ctx.chat.id);
    throw new Error(e);
  }
});

bot.command("select", async (ctx) => {
  try {
    // Get the list of images from your storage
    const imageList = await getImageListFromStorage();

    // Create an InlineKeyboard with buttons for each image
    const keyboard = new InlineKeyboard();
    imageList.forEach((image, index) => {
      keyboard.textButton(image.name, `select_${index}`);
    });

    // Send the list of images with buttons to the user
    await ctx.reply("Please select an image:", { reply_markup: keyboard });
  } catch (e) {
    sendErrorMessage(ctx.chat.id);
    throw new Error(e);
  }
});

// Scenario 3: Choose a random image and get text
bot.callbackQuery("random", async (ctx) => {
  try {
    // Implement your random image function here
    const { url } = await getRandomImageFromStorage();
    ctx.session.imageUrl = url;
    await ctx.reply(
      "Please enter the text you want to add to the image❤️! Please enter the text you wish to add to the image❤️! For better results, use short text and send it in one line."
    );
  } catch (e) {
    sendErrorMessage(ctx.chat.id);
    throw new Error(e);
  }
});

bot.catch((err, ctx) => {
  console.error("An error occurred", err);
  if (chatId) {
    bot.api.sendMessage(
      chatId,
      "Sorry, an error occurred while processing your request. Please try again."
    );
  }
});

const sendErrorMessage = async (chatId) => {
  if (!chatId) {
    throw new Error("Chat id is required");
  }
  try {
    await bot.api.sendMessage(
      chatId,
      "Sorry, an error occurred while processing your request. Please try again."
    );
  } catch (e) {
    throw new Error(e);
  }
};

const startBot = async () => {
  try {
    bot.start();

    // Stop bot when the Node.js process is about to exit
    process.on("exit", () => {
      console.log("Stopping bot...");
      bot.stop();
    });

    // Catch unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      console.error(
        "Unhandled promise rejection at:",
        promise,
        "reason:",
        reason
      );
    });

    // Catch uncaught exceptions
    process.on("uncaughtException", (err) => {
      console.error("Uncaught exception:", err);
      process.exit(1); // This will trigger the 'exit' event
    });
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1); // This will trigger the 'exit' event
  }
};

module.exports = startBot;
