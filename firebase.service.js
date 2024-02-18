const admin = require("firebase-admin");
const serviceAccount = require("./send-love-message-telegram-bot-firebase-adminsdk-jvf08-5297defee2.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "send-love-message-telegram-bot.appspot.com",
});

const bucket = admin.storage().bucket();

async function uploadFile(filePath) {
  try {
    const [file] = await bucket.upload(filePath, {
      gzip: true,
      metadata: {
        cacheControl: "public, max-age=31536000",
      },
    });

    await file.makePublic();
    const publicUrl = await file.publicUrl();

    return publicUrl;
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
}

async function downloadFile(filename) {
  try {
    const options = {
      // The path to which the file should be downloaded, e.g. "./file.txt"
      destination: filename,
    };

    // Downloads the file
    await bucket.file(filename).download(options);
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
}

const deleteFile = async (filePath) => {
  try {
    const file = await bucket.file(filePath);
    await file.delete();
  } catch (e) {
    throw new Error(e);
  }
};

module.exports = { uploadFile, downloadFile, deleteFile };
