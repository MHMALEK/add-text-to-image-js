const { Bot, InlineKeyboard, session } = require("grammy");
const addTextService = require("./image.service");
const { uploadFile } = require("./aws.service");
const dotenv = require("dotenv");
const fs = require("fs");
const firebase = require("./firebase.service");

dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN);

// Install session middleware, and define the initial session value.
function initial() {
  return { imageUrl: "", text: "" };
}
bot.use(session({ initial }));

let selectedImage;
let selectedScenario;

// A simple start command
bot.command("start", (ctx) =>
  ctx.reply(
    "Welcome! This bot allows you to create a love message with images. You can either upload your own image or choose a random image from our collection and add your text to it. What would you like to do?",
    {
      reply_markup: new InlineKeyboard()
        .text("Upload your image", "upload")
        .text("Select an image from us", "random"),
    }
  )
);

// Handle the InlineKeyboardButton callback queries
bot.callbackQuery("upload", async (ctx) => {
  // Ask the user to upload the image
  await ctx.answerCallbackQuery();
  await ctx.reply("Please upload your image.");
});

bot.callbackQuery("random", async (ctx) => {
  // Ask the user to enter the text
  await ctx.answerCallbackQuery();
  await ctx.reply("Please enter your text.");
});

// Handle photo messages
bot.on("message:photo", async (ctx) => {
  const photo = ctx.message.photo;
  const fileId = photo[photo.length - 1].file_id;
  const file = await ctx.api.getFile(fileId);
  const url = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;
  await ctx.reply("Please enter your text.");
  // Save the image url in the session
  ctx.session.imageUrl = url;
});

bot.on("message:text", async (ctx) => {
  // Process the text and image
  const text = ctx.message.text;
  const chatId = ctx.chat.id;

  //   Implement your text processing function here
  const localPath = await addTextService(
    ctx.session.imageUrl,
    text,
    "nozha",
    `${chatId}-${Date.now().toString()}`
  );
  const url = await firebase.uploadFile(localPath);
  console.log(url);
  await ctx.replyWithPhoto(url);
});

// // Scenario 2: User selects an image from a list
// bot.command("select", async (ctx) => {
//   selectedScenario = 2;

//   // Get the list of images from your storage
//   const imageList = await getImageListFromStorage();

//   // Create an InlineKeyboard with buttons for each image
//   const keyboard = new InlineKeyboard();
//   imageList.forEach((image, index) => {
//     keyboard.textButton(image.name, `select_${index}`);
//   });

//   // Send the list of images with buttons to the user
//   await ctx.reply("Please select an image:", { reply_markup: keyboard });
// });

// bot.on("callback_query:data", async (ctx) => {
//   const selectedImageIndex = parseInt(ctx.callbackQuery.data.split("_")[1]);

//   // Implement your image retrieval function here
//   selectedImage = await getImageFromStorage(selectedImageIndex);

//   await ctx.reply("Please enter the text you want to add to the image.");
// });

// // Scenario 3: Choose a random image and get text
// bot.command("random", async (ctx) => {
//   selectedScenario = 3;

//   // Implement your random image function here
//   selectedImage = await getRandomImageFromStorage();

//   await ctx.reply("Please enter the text you want to add to the image.");
// });

bot.catch((err) => {
  console.error("An error occurred", err);
});

const startBot = async () => {
  try {
    bot.start();
  } catch (error) {
    console.log(error);
  }
};

module.exports = startBot;
