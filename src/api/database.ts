import * as mongoose from "mongoose";
import * as schemas from "./db_schemas";

const ServerModel = mongoose.model<schemas.IServer>("ServerModel", schemas.ServerSchema);
const RankedModel = mongoose.model<schemas.IRankedUser>("RankedModel", schemas.RankedUser);
const UserModel = mongoose.model<schemas.IUser>("UserModel", schemas.User);

class Database {
	private uri: string;
	public database: mongoose.Connection;

	constructor(uri: string = "mongodb://127.0.0.1:27017/db") {
		if (mongoose.Connection) new Error("Connection already created");

		this.uri = uri;
	}

	private connection = res => {
		this.database = mongoose.connection;
		res();

		console.log("Connected to database");
	};

	private handle_error = err => {
		if (err) console.log(err);
	}

	public connect = (): Promise<void> => {
		return new Promise(res => {
			mongoose.connect(this.uri, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false}).then(() => this.connection(res));
		});
	}

	public disconnect = () => {
		if (!this.database) return;

		mongoose.disconnect();
	};

	public drop_database = () => {
		if (!this.database) return;

		console.log("dropping database...");
		this.database.db.dropDatabase();
	};

	// Schemas

	public create_server = async (server_id: string): Promise<schemas.IServer | Number> => {
		if (await ServerModel.findOne({"name": server_id})) { console.log("already created"); return 2 };

		const server = new ServerModel({name: server_id, currency: "Cash", currency_prefix: "$", currency_suffix: ""});
		server.save(this.handle_error);

		return 1;
	};

	public find_server = async (server_id: string): Promise<schemas.IServer> => {
		return await ServerModel.findOne({"name": server_id});
	}

	public create_ranked_user = (id: string, rank: number): void => {
		const ranked = new RankedModel({id: id, rank: rank});
		ranked.save(this.handle_error);
	};

	public find_ranked = async (id: string) => {
		return await RankedModel.findOne({"id": id});
	};

	/* user */

	public find_user = async (id: string): Promise<schemas.IUser> => {
		return await UserModel.findOne({"id": id});
	}

	public create_user = async (id: string, checked?: boolean): Promise<schemas.IUser | void> => {
		if (!checked) if (await this.find_user(id)) return;

		const user = new UserModel({id: id, servers: []});
		console.log("creating user " + id);
		await user.save(this.handle_error);
		return user;
	};

	public get_user = async (id: string): Promise<[schemas.IUser|void, boolean?]> => {
		const user = await this.find_user(id);

		if (user) {
			return [user, false];
		} else {
			console.log(`creating user for ${id}`);
			return [await this.create_user(id, true), true];
		}
	};

	public get_user_server = async (user: schemas.IUser, server_id: string) => {
		for (let server of user.servers) {
			if (server.id == server_id) return server;
		};

		// no server

		return await this.add_server_user(user, server_id, 0, 0);
	};

	public add_server_user = async (user: schemas.IUser, id: string, ec_cash: number = 0, ec_bank: number = 0) => {
		console.log(`adding server ${id} for user ${user.id} with c/${ec_cash} b/${ec_bank}`);
		const tbl = {
			"id": id,
			"economy": {
				"Cash": ec_cash,
				"Bank": ec_bank
			}
		};

		user.servers.push(tbl);
		await UserModel.findOneAndUpdate(
			{_id: user._id},
			{$push: {servers: tbl}}
		);
		return tbl;
	}
};


/*(async () => {
	const db = new Database();
	await db.connect();
	//console.log(await db.find_ranked("149740565351759873"));
	await db.drop_database();
	await db.create_ranked_user("149740565351759873", 5);

	console.log("done!");
	//ServerModel.find({"name": "12345"}, (err, res) => {
	//	console.log(res);
	//});
})();
//*/

export { Database };
export { ServerModel, RankedModel, UserModel };