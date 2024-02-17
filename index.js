// const { uploadFile, downloadFile, downloadAllFiles } = require("./aws.service");
const firebase = require("./firebase.service");
const malek = async () => {
  const m = await firebase.uploadFile("output.png");
  console.log(m);
};


