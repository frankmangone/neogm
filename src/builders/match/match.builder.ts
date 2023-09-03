import { ConnectionBuilder } from "../connection/connection.builder";
import { MATCH } from "./constants";

export class MatchBuilder {
	private _cypher: string;
	private _params: Record<string, unknown> = {};
	private _isInitialized: boolean = false;
	private _isTerminated: boolean = false;

	/**
	 * cypher
	 *
	 * Getter for the `_cypher` property.
	 * This is not meant to be a full cypher; instead, it's just a node connection
	 * expression used for more useful statements such as MATCH and CREATE.
	 *
	 * @returns {string}
	 */
	public get cypher(): string {
		return this._cypher;
	}

	/**
	 * params
	 *
	 * Getter for the inner `_params` property.
	 *
	 * @returns {string}
	 */
	public get params(): Record<string, unknown> {
		return this._params;
	}

	/**
	 * isTerminated
	 *
	 * Getter for the inner `_isTerminated` property.
	 *
	 * @returns {boolean}
	 */
	public get isTerminated(): boolean {
		return this._isTerminated;
	}

	/**
	 * match
	 *
	 * Adds a match statement
	 *
	 * @param {ConnectionBuilder} builder - The connection builder used to generate the matched expression.
	 * @returns {this}
	 */
	public match(builder: ConnectionBuilder): this {
		if (!builder.isTerminated) {
			throw new Error(
				"MatchBuilder: cannot use an unterminated `ConnectionBuilder`."
			);
		}

		if (this._isTerminated) {
			throw new Error("MatchBuilder: Builder already terminated.");
		}

		Object.assign(this._params, builder.params);

		if (!this._isInitialized) {
			this._isInitialized = true;
			this._cypher = builder.cypher;
			return this;
		}

		this._cypher += `,\n${builder.cypher}`;
		return this;
	}

	/**
	 * done
	 *
	 * Terminates the match expression, by adding `MATCH` at the beginning of the produced cypher.
	 *
	 * @returns {this}
	 */
	public done(): this {
		if (this._isTerminated) {
			throw new Error("MatchBuilder: Builder already terminated.");
		}

		if (!this._isInitialized) {
			throw new Error(
				"MatchBuilder: Cannot terminate an uninitialized builder."
			);
		}

		this._isTerminated = true;
		this._cypher = `${MATCH} ${this._cypher}`;
		return this;
	}
}
