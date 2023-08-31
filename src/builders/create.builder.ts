import { ConnectionBuilder, type NodeParams } from "./connection.builder";

export class CreateBuilder extends ConnectionBuilder {
	protected _cypher: string;

	constructor(node?: NodeParams) {
		super(node);
		this._cypher = `CREATE ${this._parseNodeCypher(node)}`;
	}

	/**
	 * cypher
	 *
	 * Getter for the cypher property.
	 *
	 * @returns {string}
	 */
	public get cypher(): string {
		return this._cypher;
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
