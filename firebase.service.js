const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccount = require("./send-love-message-telegram-bot-firebase-adminsdk-jvf08-5297defee2.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "send-love-message-telegram-bot.appspot.com",
});

const bucket = admin.storage().bucket();

async function uploadFile(filePath) {
  const [file] = await bucket.upload(filePath, {
    gzip: true,
    metadata: {
      cacheControl: "public, max-age=31536000",
    },
  });

  await file.makePublic();
  const publicUrl = await file.publicUrl()

  console.log(`${filePath} uploaded., ${publicUrl}`);
  return publicUrl;
}

async function downloadFile(filename) {
  const options = {
    // The path to which the file should be downloaded, e.g. "./file.txt"
    destination: filename,
  };

  // Downloads the file
  await bucket.file(filename).download(options);
}

module.exports = { uploadFile, downloadFile };
