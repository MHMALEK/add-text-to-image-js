const startBot = require("./bot.service");

// init server
const app = require("./server");

// api routes
require("./api");

// listen to server
app.listen(3000, () => console.log("Server is running on port 3000"));

// start telegram bot
startBot();

// cron job
require("./cronjob");
