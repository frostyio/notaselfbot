import { Command, Help, MessageEmbed, MessageError, MessageResult } from "../api/api";
import { Bot } from "../api/bot";
import { UserModel } from "../api/database";

export const exported: Command = {
	help(): Help {
		return {
			help_name: "Withdraw",
			description: "Withdraw currency to your bank account."
		};
	},

	initialize(bot: Bot): void {},
	async execute(bot: Bot, message: any, args: any): Promise<MessageResult | void> {	
		let money = args[0] || "all";

		const ServerConfig = await bot.db.find_server(message.guild.id);
		if (!ServerConfig) return new MessageError("Server Error", `Server is not configured yet.`);
		const {currency, currency_prefix, currency_suffix} = ServerConfig;

		// get user data

		const [db_user] = await bot.db.get_user(message.author.id);
		if (!db_user) return new MessageError("DB Error", "could not find/create user.");
		const server = await bot.db.get_user_server(db_user, message.guild.id);
		const {Bank, Cash} = server.economy;
		
		if (money == "all") money = Bank;
		// operations

		if (money < 0) return new MessageError("Withdrawing Error", `Cannot withdraw ${currency_prefix}${money}${currency_suffix}.`);

		if (money > Bank) 
			return new MessageError("Insufficient Funds", `You have insufficient funds to withdraw ${currency_prefix}${money}${currency_suffix}.`);

		const NewBank = Bank - money, NewCash = Cash + money;

		await UserModel.findOneAndUpdate(
			{_id: db_user._id, "servers.id": server.id}, 
			{
				"servers.0.economy.Bank": NewBank,
				"servers.0.economy.Cash": NewCash
			}
		);

		const embed = new MessageEmbed(null, `✅ Withdrew ${currency_prefix}${money}${currency_suffix}!\n\n**New Bank Balance:**`, message.author);
		embed.embed.fields = [
			{name: currency, value: `${currency_prefix}${NewCash*1}${currency_suffix}`, inline: true},
			{name: "Bank", value: `${currency_prefix}${NewBank*1}${currency_suffix}`, inline: true}
		];

		return embed;
	},

	aliases: "with/withdraw",
	arg_pattern: "float!{1}",

	rank: 0,
	group: "economy"
};