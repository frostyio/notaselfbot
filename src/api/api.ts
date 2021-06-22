import { Bot } from "./bot";

export interface Help {
	help_name: string;
	description: string;
};

export interface Command {
	help(): Help;

	initialize(bot: Bot): void;
	execute(bot: Bot, message: any, args: any): Promise<MessageResult | MessageEmbed | void>;

	aliases: string;
	arg_pattern: string;

	rank?: number,
	group?: string
};

export interface BotConfig {
	prefix: string;
	suffix: string;
};

// Return Message Types 

export interface MessageResult {
	embed?: any
};

interface EmbedField {
	name?: string,
	value?: string,
	inline?: boolean
};

export interface EmbedProperties {
	color?: number,
	title?: string,
	url?: string,
	author?: {
		name?: string,
		icon_url?: string,
		url?: string,
	},
	description?: string,
	thumbnail?: {
		url?: string,
	},
	fields?: EmbedField[],
	image?: {
		url?: string,
	},
	timestamp?: Date,
	footer?: {
		text?: string,
		icon_url?: string,
	}
}

export class MessageEmbed implements MessageResult {
	embed: EmbedProperties

	constructor(title: string = "Response", description?: string, author?: any) {
		this.embed = {} as EmbedProperties;

		this.embed.color = 0x1cd5ff;
		this.embed.title = title;
		if (description) this.embed.description = description;
		if (author) this.embed.author = {icon_url: author.avatarURL(), name: author.tag};
		this.embed.timestamp = new Date();
	}
};

export class MessageError implements MessageResult {
	embed: EmbedProperties

	constructor(title: string = "Error",  description?: string) {
		this.embed = {} as EmbedProperties;

		this.embed.color = 0xff1c4d;
		this.embed.title = title;
		if (description) this.embed.description = description;
		this.embed.timestamp = new Date();
	}
};