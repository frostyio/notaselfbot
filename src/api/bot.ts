import { Command, BotConfig, MessageResult, MessageError } from "./api";
import { EventManager, Connection } from "./event_manager";
import { Database, RankedModel, ServerModel } from "./database";

interface BotInfo {
	tag: string; // discriminator
	id: number;
	username: string;
	avatar: string;
}

const DefaultConfig: BotConfig = {
	prefix: ".",
	suffix: " ",
}

interface CommandReturn {
	command: Command;
	terms: []
};

export class Bot {
	private library: any;
	private client: any;
	private token: string;
	private commands: Command[];
	
	public Events: EventManager;
	public Info: BotInfo;
	public Config: BotConfig;
	
	public colors: any;

	//

	public get_command = (alias: string): Command | void => {
		for (let command of this.commands) {
			const aliases = command.aliases.split("/");
			if (aliases.find(e => e == alias)) {
				return command;
			}
		}

		return;
	}

	private check_if_command = (message): CommandReturn | boolean => {
		let content = message.content.trim();

		if (content.startsWith(this.Config.prefix)) {
			content = content.substring(this.Config.prefix.length);
			const terms = content.split(this.Config.suffix);
			const cmd_arg = terms.splice(0, 1)[0];
			const c: Command | void = this.get_command(cmd_arg);
			if (c) {
				const a: CommandReturn = {
					command: c,
					terms: terms
				};
				return a;
			}
		}
		return false;
	}

	//

	private get_args = (terms, arg_format, message) => {
		let args = [];


		for (let arg of arg_format.split("/")) {
			let nterms = arg.match(/\{(\d+|inf)\}/);
			if (nterms) nterms = nterms[1] == "inf" ? Infinity : parseInt(nterms[1]);
			else nterms = 1;

			// is a modifier "!" at the end says whether or not the value can be a value such as "all"

			switch (true) {
				case /string/.test(arg): {
					args = args.concat(terms.splice(0, nterms).join(this.Config.suffix));
					break;
				}
				case /int(!)?/.test(arg): {
					args = args.concat(terms.splice(0, nterms).filter(int => /^[+-]?(\d+|all)$/.test(int)));
					break;
				}
				case /float(1)?/.test(arg): {
					args = args.concat(terms.splice(0, nterms).filter(f => /^[+-]?(\d+(\.\d+)?|all)$/.test(f)));
					break;
				}
				case /boolean|bool/.test(arg): {
					args = args.concat(terms.splice(0, nterms).filter(b => /true|false/.test(b)));
					break;
				}
				case /user/.test(arg): {
					const mentions = [];
					terms.splice(0, nterms).map(term => {
						if (/<@!\d+>/.test(term)) term = term.substring(3, term.length - 1);

						if (term == "me") {
							mentions.push(message.author);
						} else if (/\d+/.test(term)) {
							mentions.push(this.client.users.find(user => user.id === term));
						};
					});

					args = args.concat(mentions);
					break;
				}
				default:
					break;
			}
		}

		return args;
	}


	private set_events = (): void => {

		const MessageFired: Connection = {
			type: "MessageFired",
			function: Message => {
				const command = this.check_if_command(Message);
				if (command) this.Events.fire("CommandCalled", command, Message);
			}
		}

		this.Events.new("MessageFired", MessageFired);

		/// COMMAND CALLED  - fires when a command is said in chat

		const CommandCalled: Connection = {
			type: "CommandCalled",
			function: async (cmd: CommandReturn, Message): Promise<void> => {
				const {command, terms} = cmd;

				// check ranking
				if (command.rank && this.db && command.rank > 0) {
					const isRanked = await this.db.find_ranked(Message.author.id);
					let rank = 0;
					if (isRanked) rank = isRanked.rank;
					if (rank < command.rank) {
						Message.channel.send(new MessageError("Error", "Insufficient Permissions"));

						return;
					}
				}
				//

				const args = this.get_args(terms, command.arg_pattern, Message);
				const result: MessageResult | MessageError | void = await command.execute(this, Message, args);

				if (result) {
					Message.channel.send(result);
				}
			}
		}

		this.Events.new("CommandCalled", CommandCalled);
	}

	constructor(library: any, token: string, database_uri: string, config?: BotConfig) {
		this.library = library, this.token = token, this.Config = config || DefaultConfig;
		this.client = new library.Client();

		this.commands = [];
		this.Events = new EventManager;

		this.colors = {
			success: 0x34eb34,
			casual: 0x1cd5ff,
			error: 0xff1c4d
		};

		this.set_events();

		this.on("message", msg => this.Events.fire("MessageFired", msg));

		// connect database
		if (database_uri) {
			this.connect_database(database_uri);
		}
	};

	// DATABSE

	public db: Database;

	private connect_database = async (uri: string): Promise<void> => {
		this.db = new Database();
		await this.db.connect();
	}

	//

	public login = async (): Promise<string> => {
		try {
			await this.client.login(this.token);

			this.Info = {
				tag: this.client.discriminator,
				id: this.client.id,
				username: this.client.username,
				avatar: this.client.username
			};

			return "Success!";
		} catch (err) {
			return err;
		}
	};

	public on = (...args: any): void => {
		this.client.on(...args);
	};

	public register = async (cmd: Command): Promise<void> => {
		this.commands.push(cmd);
		cmd.initialize(this);
	}
}