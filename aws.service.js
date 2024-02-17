const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsCommand,
} = require("@aws-sdk/client-s3");
const { createReadStream, writeFileSync } = require("fs");
const dotenv = require("dotenv");

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadFile = async (key, filePath) => {
  if (!key || !filePath) {
    throw new Error("Key and filePath are required");
  }

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `user-${key}-upload-image`, // File name you want to save as in S3
    Body: createReadStream(filePath),
  };

  try {
    const data = await s3Client.send(new PutObjectCommand(uploadParams));
    console.log(`File uploaded successfully. ${data}`);
    return data;
  } catch (err) {
    console.log("Error", err);
    throw err;
  }
};

const downloadFile = (key) => {
  // To download a file
  const downloadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key,
  };

  S3.getObject(downloadParams, function (err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
    } else {
      fs.writeFileSync("s3", data.Body.toString());
      console.log(data); // successful response
    }
  });
};

const downloadAllFiles = () => {
  // To download all files from a bucket
  const listParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
  };

  S3.listObjects(listParams, function (err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
    } else {
      data.Contents.forEach((file) => {
        const downloadParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: file.Key,
        };
        S3.getObject(downloadParams, function (err, data) {
          if (err) {
            console.log(err, err.stack); // an error occurred
          } else {
            fs.writeFileSync(`s3-bucket/${file.Key}`, data.Body.toString());
          }
        });
      });
    }
  });
};

module.exports = { uploadFile, downloadFile, downloadAllFiles };
