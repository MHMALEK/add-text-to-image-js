const path = require("path");
const fs = require("fs-extra");

const admin = require("firebase-admin");
const bucket = admin.storage().bucket();

const getImageListFromLocalStorage = () => {
  const template_folder_path = path.resolve(__dirname, "templates");
  const files = fs.readdirSync(template_folder_path);
  return files.map((file) => {
    return {
      name: file,
      path: path.join(path, file),
    };
  });
};

const getImageFromLocalStorage = (index) => {
  const imageList = getImageListFromStorage();
  return imageList[index];
};

const getRandomImageLocalFromStorage = () => {
  const imageList = getImageListFromStorage();
  const randomIndex = Math.floor(Math.random() * imageList.length);
  return imageList[randomIndex];
};

const deleteFileFromLocalStorage = (filePath) => {
  fs.unlinkSync(filePath);
};

const getImageListFromStorage = async () => {
  const [files] = await bucket.getFiles();

  return Promise.all(
    files.map(async (file) => {
      // Make the file publicly readable
      await file.makePublic();

      return {
        name: file.name,
        url: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
      };
    })
  );
};

const getImageFromStorage = async (index) => {
  const imageList = await getImageListFromStorage();
  return imageList[index];
};

const getRandomImageFromStorage = async () => {
  const imageList = await getImageListFromStorage();
  const randomIndex = Math.floor(Math.random() * imageList.length);
  return imageList[randomIndex];
};

module.exports = {
  getImageListFromStorage,
  getRandomImageFromStorage,
  getImageFromStorage,
  getImageListFromLocalStorage,
  getImageFromLocalStorage,
  getRandomImageLocalFromStorage,
  deleteFileFromLocalStorage
};
