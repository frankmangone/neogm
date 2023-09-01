import { ConnectionBuilder } from "./connection/connection.builder";
import type { NodeParams } from "./connection/interfaces";

export class CreateBuilder extends ConnectionBuilder {
	constructor(node?: NodeParams) {
		super(node);
		this._cypher = `CREATE ${this._parseNodeCypher(node)}`;
	}

	/**
	 * return
	 *
	 * Adds a return clause to the end of the cypher.
	 * TODO: Maybe move this to an aggregator builder.
	 *
	 * @param {string[]} tags - The tags to be returned.
	 * @returns {this}
	 */
	public return(tags: string[]): this {
		this._cypher += ` RETURN ${tags.join(", ")};`;
		return this;
	}
}
