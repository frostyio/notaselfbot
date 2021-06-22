import { Command, Help, MessageEmbed, MessageError, MessageResult } from "../api/api";
import { Bot } from "../api/bot";

export const exported: Command = {
	help(): Help {
		return {
			help_name: "Balance",
			description: "Check yours or another person's balance."
		};
	},

	initialize(bot: Bot): void {},
	async execute(bot: Bot, message: any, args: any): Promise<MessageResult | void> {		
		const user = args[0] || message.author;

		const ServerConfig = await bot.db.find_server(message.guild.id);
		if (!ServerConfig) return new MessageError("Server Error", `Server is not configured yet.`);
		const {currency, currency_prefix, currency_suffix} = ServerConfig;

		const [db_user] = await bot.db.get_user(user.id);
		if (!db_user) return new MessageError("DB Error", "could not find/create user.");

		// find server
		const server = await bot.db.get_user_server(db_user, message.guild.id);

		const embed = new MessageEmbed(null, null, message.author);
		embed.embed.author.name += "'s Balance";
		embed.embed.fields = [
			{name: currency, value: `${currency_prefix}${server.economy.Cash}${currency_suffix}`, inline: true},
			{name: "Bank", value: `${currency_prefix}${server.economy.Bank}${currency_suffix}`, inline: true}
		];

		return embed;
	},

	aliases: "bal/balance",
	arg_pattern: "user{1}",

	rank: 0,
	group: "economy"
};