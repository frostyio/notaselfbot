// setup a server

import { Command, Help, MessageEmbed, MessageError, MessageResult } from "../api/api";
import { Bot } from "../api/bot";

export const exported: Command = {
	help(): Help {
		return {
			help_name: "Server Setup",
			description: "Set up a server."
		};
	},

	initialize(bot: Bot): void {

	},
	async execute(bot: Bot, message: any, args: any): Promise<MessageResult | void> {		
		const result = await bot.db.create_server(message.guild.id);
		if (result == 1) {
			const embed = new MessageEmbed(`Success`, "Successfully created server!");
			embed.embed.color = bot.colors.success;
			return embed;
		} else if (result == 2) {
			return new MessageError(`Error`, "Server already created :(");
		} else {
			return  new MessageError(`Error`, "error");
		}
	},

	aliases: "server",
	arg_pattern: "",

	rank: 5,
};