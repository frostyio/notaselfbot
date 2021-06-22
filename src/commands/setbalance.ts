import { Command, Help, MessageEmbed, MessageError, MessageResult } from "../api/api";
import { Bot } from "../api/bot";
import { UserModel } from "../api/database";

export const exported: Command = {
	help(): Help {
		return {
			help_name: "Set Balance",
			description: "Set your current cash and bank balance."
		};
	},

	initialize(bot: Bot): void {},
	async execute(bot: Bot, message: any, args: any): Promise<MessageResult | void> {		
		const cash = args[0] || 0, bank = args[1] || 0;

		const ServerConfig = await bot.db.find_server(message.guild.id);
		if (!ServerConfig) return new MessageError("Server Error", `Server is not configured yet.`);
		const {currency, currency_prefix, currency_suffix} = ServerConfig;

		// get user data

		const [db_user] = await bot.db.get_user(message.author.id);
		if (!db_user) return new MessageError("DB Error", "could not find/create user.");
		const server = await bot.db.get_user_server(db_user, message.guild.id);
		
		// operations

		await UserModel.findOneAndUpdate(
			{_id: db_user._id, "servers.id": server.id}, 
			{
				"servers.0.economy.Bank": bank,
				"servers.0.economy.Cash": cash
			}
		);

		const embed = new MessageEmbed(null, `✅ Successfully set balance.`, message.author);

		return embed;
	},

	aliases: "setbalance/setbal",
	arg_pattern: "int{1}/int{1}",

	rank: 4,
	group: "economy"
};