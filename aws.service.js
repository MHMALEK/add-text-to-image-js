const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { createReadStream } = require("fs");
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
    return data;
  } catch (err) {
    throw err;
  }
};

module.exports = { uploadFile };
