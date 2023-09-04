import {
	ConnectionBuilder,
	type NodeParams,
	type ConnectParams,
} from "../connection";
import { MATCH } from "./constants";

export class MatchBuilder {
	private _cypher: string = "";
	private _connectionBuilder: ConnectionBuilder = new ConnectionBuilder();
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
	 * match
	 *
	 * Starts adding a new connection to the MATCH statement. If a connection builder was already
	 * initialized, it terminates it, collects the result, and resets it.
	 *
	 * @param {NodeParams} node - The node data for initialization of the `ConnectionBuilder`.
	 * @returns {this}
	 */
	public match(node: NodeParams): this {
		if (this._isInitialized) {
			this._collect();
			this._cypher = `${this._cypher},\n`;
			this._connectionBuilder.reset();
		}

		this._connectionBuilder.initialize(node);
		if (!this._isInitialized) this._isInitialized = true;

		return this;
	}

	/**
	 * connect
	 *
	 * Adds a connection in the current `ConnectionBuilder`.
	 *
	 * @param {ConnectParams} connection - The connection data.
	 * @returns {this}
	 */
	public connect(connection: ConnectParams): this {
		this._connectionBuilder.connect(connection);
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
		this._collect();

		this._cypher = `${MATCH} ${this._cypher}`;
		return this;
	}

	/**
	 * _collect
	 *
	 * Collects the current `ConnectionBuilder`'s result.
	 *
	 * @returns {void}
	 */
	private _collect(): void {
		this._connectionBuilder.done();
		this._cypher = `${this._cypher}${this._connectionBuilder.cypher}`;
		Object.assign(this._params, this._connectionBuilder.params);
	}
}
