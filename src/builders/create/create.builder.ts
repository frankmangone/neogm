import { ConnectionBuilder } from "../connection/connection.builder";
import { CREATE } from "./constants";

export class CreateBuilder {
	private _cypher: string;
	private _params: Record<string, unknown> = {};
	private _isInitialized: boolean = false;
	private _isTerminated: boolean = false;

	/**
	 * cypher
	 *
	 * Getter for the `_cypher` property.
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
	 * create
	 *
	 * Adds a create statement.
	 *
	 * @param {ConnectionBuilder} builder - The connection builder used to generate the matched expression.
	 * @returns {this}
	 */
	public create(builder: ConnectionBuilder): this {
		if (!builder.isTerminated) {
			throw new Error(
				"CreateBuilder: cannot use an unterminated `ConnectionBuilder`."
			);
		}

		if (this._isTerminated) {
			throw new Error("CreateBuilder: Builder already terminated.");
		}

		if (this._isInitialized) {
			throw new Error(
				"CreateBuilder: `create` may only be called once. Use `done` to terminate the builder."
			);
		}

		Object.assign(this._params, builder.params);

		if (!this._isInitialized) {
			this._isInitialized = true;
			this._cypher = builder.cypher;
			return this;
		}

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
			throw new Error("CreateBuilder: Builder already terminated.");
		}

		if (!this._isInitialized) {
			throw new Error(
				"CreateBuilder: Cannot terminate an uninitialized builder."
			);
		}

		this._isTerminated = true;
		this._cypher = `${CREATE} ${this._cypher}`;
		return this;
	}
}
