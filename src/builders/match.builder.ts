import { ConnectionBuilder } from "./connection/connection.builder";
import type { NodeParams } from "./connection/interfaces";

export class MatchBuilder extends ConnectionBuilder {
	constructor(node?: NodeParams) {
		super(node);
		this._cypher = `MATCH ${this._parseNodeCypher(node)}`;
	}
}
