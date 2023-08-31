import { CreateBuilder } from "../create.builder";
import { MatchBuilder } from "../match.builder";
import { MatchParams } from "./interfaces";
import { type AddConnectionParams } from "../connection/interfaces";

export class CypherBuilder {
	protected _cypher: string;
	private _currentBuilder: MatchBuilder | CreateBuilder | null = null;

	constructor() {
		this._cypher = "";
	}

	// ----------------------------------------------------------------
	// Public Methods
	// ----------------------------------------------------------------

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
	 * match
	 */
	public match(params: MatchParams): this {
		const { node, connections } = params;

		this._currentBuilder = new MatchBuilder(node);
		connections?.forEach((connection) => {
			this._currentBuilder.addConnection(connection);
		});

		return this;
	}

	/**
	 * addConnection
	 */
	public addConnection(params: AddConnectionParams): this {
		if (!this._currentBuilder?.addConnection) {
			throw new Error("Current build step does not support `addConnection`.");
		}

		this._currentBuilder.addConnection(params);
		return this;
	}

	/**
	 * return
	 *
	 * Adds a return clause to the end of the cypher.
	 *
	 * @param {string[]} tags - The tags to be returned.
	 * @returns {this}
	 */
	public return(tags: string[]): this {
		this._clearCurrentBuilder();

		// Add return statement
		this._addToCypher(`RETURN ${tags.join(", ")};`);
		return this;
	}

	/**
	 * done
	 */
	public done(): this {
		this._clearCurrentBuilder();
		return this;
	}

	// ----------------------------------------------------------------
	// Private Methods
	// ----------------------------------------------------------------

	/**
	 * _clearCurrentBuilder
	 */
	private _clearCurrentBuilder(): void {
		if (!this._currentBuilder) return;

		this._addToCypher(this._currentBuilder.cypher);
		this._currentBuilder = null;
	}

	/**
	 * addToCypher
	 *
	 * Setter for the cypher property. Concats new values.
	 *
	 * @returns {string}
	 */
	private _addToCypher(value: string) {
		if (this._cypher.length !== 0) {
			this._cypher = `${this._cypher} ${value}`;
			return;
		}
		this._cypher = value;
	}
}
