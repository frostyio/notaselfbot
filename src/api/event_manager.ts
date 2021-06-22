import { createConnection } from "net";

interface Connection {
	function: Function,
	type: string
};

export { Connection };

export class EventManager {
	private connections: Connection[];
	private connection_types;

	constructor() {
		this.connection_types = {};
		this.connections = [];
	}

	public new = (type: string, con?: Connection): void => {
		this.connection_types[type] = true;
		
		if (con) this.on(con);
	};

	public on = (con: Connection): void => {
		if (!this.connection_types[con.type]) new Error("No connection type created");

		this.connections.push(con);
	}

	public fire = (type: string, ...args): void => {
		if (!this.connection_types[type]) new Error("No connection type created");

		for (let con of this.connections) {
			if (con.type == type) con.function(...args);
		}
	}
}