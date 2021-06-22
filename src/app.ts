require('dotenv').config({path: __dirname + '/.env'})
const selfcord = require("selfcord.js"); // don't mind totally not a self bot

import { Bot } from "./api/bot";
const bot = new Bot(selfcord, process.env.BotToken, process.env.DatabaseURI);

(async () => {
	bot.on("ready", () => console.log("Connected to discord"));

	await bot.login();
	
	// to be redone soon to automatically include all commands

	bot.register((await import("./commands/server")).exported);

	// money commands
	bot.register((await import("./commands/setbalance")).exported);

	bot.register((await import("./commands/balance")).exported);
	bot.register((await import("./commands/deposit")).exported);
	bot.register((await import("./commands/withdraw")).exported);
})();