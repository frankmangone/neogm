import {
	DIRECTIONS,
	type DirectionType,
	type NodeParams,
	type EdgeParams,
	type ConnectParams,
	type Fields,
} from "./interfaces";

/**
 * ConnectionBuilder
 *
 * Allows for the creation of expressions that represent connections between nodes,
 * such as `(p:Person)-[:OWNS]->(h:House)-[:HAS_SERVICE]->(s: Service {name: "electricity"})`.
 * The API allows initialization (through `initialize`) with a node, and then provides a `connect`
 * method that allows the chaining of edges and nodes.
 */
export class ConnectionBuilder {
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
	 * initialize
	 *
	 * Adds the starting node for a chain of connections.
	 * This method may only be called once for each builder.
	 *
	 * @param {AddConnectionParams | undefined} params
	 * @returns {this}
	 */
	public initialize(args?: NodeParams): this {
		if (this._isInitialized) {
			throw new Error(
				"ConnectionBuilder: Connection chain has already been initialized in this builder instance. `initialize` may only be called once."
			);
		}

		const { expression, params } = this._parseNodeCypher(args);

		Object.assign(this._params, params);

		this._cypher = expression;
		this._isInitialized = true;
		return this;
	}

	/**
	 * connect
	 *
	 * Adds a connection to the match expression.
	 *
	 * @param {ConnectParams | undefined} params
	 * @returns {this}
	 */
	public connect(params?: ConnectParams): this {
		if (!this._isInitialized) {
			throw new Error(
				"ConnectionBuilder: `connect` may only be called after initialization."
			);
		}

		if (this._isTerminated) {
			throw new Error("ConnectionBuilder: Builder already terminated.");
		}

		const { edge, node } = params ?? {};

		const { expression: nodeExpression, params: nodeParams } =
			this._parseNodeCypher(node);
		const { expression: edgeExpression, params: edgeParams } =
			this._parseEdgeCypher(edge);

		Object.assign(this._params, edgeParams);
		Object.assign(this._params, nodeParams);
		this._cypher += `${edgeExpression}${nodeExpression}`;

		return this;
	}

	/**
	 * done
	 *
	 * Terminates the connection expression.
	 *
	 * @returns {this}
	 */
	public done(): this {
		if (!this._isInitialized) {
			throw new Error(
				"ConnectionBuilder: Cannot terminate an uninitialized builder."
			);
		}

		if (this._isTerminated) {
			throw new Error("ConnectionBuilder: Builder already terminated.");
		}

		this._isTerminated = true;
		return this;
	}

	/**
	 * reset
	 *
	 * Resets the builder to its initial state.
	 *
	 * @returns {this}
	 */
	public reset(): this {
		this._cypher = undefined;
		this._params = {};
		this._isInitialized = false;
		this._isTerminated = false;
		return this;
	}

	/**
	 * _parseNodeCypher
	 *
	 * @param {NodeParams | undefined} edge
	 * @returns { expression: string; params: Record<string, unknown>; }
	 */
	protected _parseNodeCypher(node?: NodeParams): {
		expression: string;
		params: Record<string, unknown>;
	} {
		if (!node) return { expression: "()", params: {} };

		const { tag = "", labels = "", fields = {} } = node;
		let expression = "";

		if (labels) {
			expression += `(${tag}:${this._parseLabels(labels)}`;
		} else {
			expression += `(${tag}`;
		}

		if (expression !== "(" && Object.keys(fields).length !== 0) {
			expression += " ";
		}

		const { expression: fieldsExpression, params } =
			this._parseQueryFields(fields);
		expression += `${fieldsExpression})`;

		return { expression, params };
	}

	/**
	 * _parseEdgeCypher
	 *
	 * @param {EdgeParams | undefined} edge
	 * @returns { expression: string; params: Record<string, unknown>; }
	 */
	private _parseEdgeCypher(edge?: EdgeParams): {
		expression: string;
		params: Record<string, unknown>;
	} {
		if (!edge) return { expression: "--", params: {} };

		const { tag = "", labels, fields = {}, direction } = edge;
		let expression = "";

		if (!labels && !tag && Object.keys(fields).length === 0) {
			return {
				expression: this._parseDirectedEdge(expression, direction),
				params: {},
			};
		}

		if (labels) {
			expression += `[${tag}:${this._parseLabels(labels)}`;
		} else {
			expression += `[${tag}`;
		}

		if (expression !== "[" && Object.keys(fields).length !== 0) {
			expression += " ";
		}

		const { expression: fieldsExpression, params } =
			this._parseQueryFields(fields);
		expression += `${fieldsExpression}]`;

		return {
			expression: this._parseDirectedEdge(expression, direction),
			params,
		};
	}

	/**
	 * _parseDirectedEdge
	 *
	 * @param {string} edgeContent
	 * @param {DirectionType | undefined} direction
	 * @returns {string}
	 */
	private _parseDirectedEdge(
		edgeContent: string,
		direction?: DirectionType
	): string {
		if (direction === DIRECTIONS.FORWARD) return `-${edgeContent}->`;
		if (direction === DIRECTIONS.BACKWARD) return `<-${edgeContent}-`;
		return `-${edgeContent}-`;
	}

	/**
	 * _parseLabels
	 *
	 * Parses labels by joining them with `|` if multiple are present.
	 *
	 * @param {string | string[]} labels
	 * @returns {string}
	 */
	private _parseLabels(labels: string | string[]): string {
		if (typeof labels === "string") return labels;
		return labels.join("|");
	}

	/**
	 * _parseQueryFields
	 *
	 * Builds query fields for a given payload.
	 *
	 * @param {Fields} fields
	 * @returns { expression: string; params: Record<string, unknown> }
	 */
	private _parseQueryFields(fields: Fields): {
		expression: string;
		params: Record<string, unknown>;
	} {
		if (Object.keys(fields).length === 0) {
			return { expression: "", params: {} };
		}

		let expression = "";
		const params = {};

		Object.entries(fields).forEach((entry) => {
			const [key, value] = entry;

			if (
				typeof value === "string" ||
				typeof value === "number" ||
				typeof value === "boolean"
			) {
				expression += `${key}: $${key}, `;
				params[key] = value;
				return;
			}

			const { value: innerValue, alias = key } = value;
			expression += `${key}: $${alias}, `;
			params[alias] = innerValue;
		});

		return { expression: `{${expression.slice(0, -2)}}`, params };
	}
}
