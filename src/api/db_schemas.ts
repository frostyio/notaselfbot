import { Schema, Document } from "mongoose";

export interface IServer extends Document {
	name: string;
	currency: string;
	currency_prefix: string;
	currency_suffix: string;
};

const ServerSchema: Schema = new Schema({
	name: String,
	currency: String,
	currency_prefix: String,
	currency_suffix: String
});

export interface IRankedUser extends Document {
	id: string,
	rank: number
};

const RankedUser: Schema = new Schema({
	id: String,
	rank: Number
});

//

export interface IUser extends Document {
	id: string,
	servers: [
		{
			id: string,
			economy: {
				Cash: number,
				Bank: number
			}
		}
	]
};

const User: Schema = new Schema({
	id: String,
	servers: [
		{
			id: String,
			economy: {
				Cash: Number,
				Bank: Number
			}
		}
	]
});


export {ServerSchema, RankedUser, User};