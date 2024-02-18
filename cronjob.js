const cron = require("node-cron");
const path = require("path");
const fs = require("fs-extra");

const imageTemplatePath = path.join(__dirname, "image-template");

// Empty the image-template folder every day at midnight
cron.schedule("0 0 * * *", async () => {
  fs.emptyDirSync(imageTemplatePath);
});

module.exports = cron;
