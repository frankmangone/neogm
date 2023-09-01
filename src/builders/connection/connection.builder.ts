import type { Query } from "../../types";
import {
	DIRECTIONS,
	type AddConnectionParams,
	type Direction,
	type EdgeParams,
	type NodeParams,
} from "./interfaces";

export class ConnectionBuilder {
	protected _cypher: string;

	constructor(baseNode?: NodeParams) {
		this._cypher = `${this._parseNodeCypher(baseNode)}`;
	}

	/**
	 * cypher
	 *
	 * Getter for the `_cypher` property.
	 * This is not meant to be a full cypher; instead, it's just the node specification
	 * for more useful expressions such as MATCH and CREATE.
	 *
	 * @returns {string}
	 */
	public get cypher(): string {
		return this._cypher;
	}

	/**
	 * addConnection
	 *
	 * Adds a connection to the match expression.
	 *
	 * @param {AddConnectionParams} params
	 * @returns {this}
	 */
	public addConnection(params: AddConnectionParams): this {
		const { sourceNode, edge, targetNode } = params;

		this._cypher += ",\n";

		const sourceNodeString = this._parseNodeCypher(sourceNode);
		const targetNodeString = this._parseNodeCypher(targetNode);
		const edgeString = this._parseEdgeCypher(edge);

		this._cypher += `${sourceNodeString}${edgeString}${targetNodeString}`;

		return this;
	}

	/**
	 * _parseNodeCypher
	 *
	 * @param {NodeParams | undefined} edge
	 * @returns {string}
	 */
	protected _parseNodeCypher(node?: NodeParams): string {
		if (!node) {
			return "()";
		}

		const { tag = "", label = "", fields = {} } = node;
		let result = "";

		if (label) {
			result += `(${tag}:${label}`;
		} else {
			result += `(${tag}`;
		}

		if (result !== "(" && Object.keys(fields).length !== 0) {
			result += " ";
		}

		result += `${this._buildQueryFields(fields)})`;

		return result;
	}

	/**
	 * _parseEdgeCypher
	 *
	 * @param {EdgeParams | undefined} edge
	 * @returns {string}
	 */
	protected _parseEdgeCypher(edge?: EdgeParams): string {
		if (!edge) {
			return "--";
		}

		const { tag = "", label = "", fields = {}, direction } = edge;
		let result = "";

		if (!label && !tag && !fields) {
			return this._parseDirectedEdge(result, direction);
		}

		if (label) {
			result += `[${tag}:${label}`;
		} else {
			result += `[${tag}`;
		}

		if (result !== "[" && Object.keys(fields).length !== 0) {
			result += " ";
		}

		result += `${this._buildQueryFields(fields)}]`;
		return this._parseDirectedEdge(result, direction);
	}

	/**
	 * _parseDirectedEdge
	 *
	 * @param {string} edgeContent
	 * @param {Direction | undefined} direction
	 * @returns {string}
	 */
	protected _parseDirectedEdge(
		edgeContent: string,
		direction?: Direction
	): string {
		if (direction === DIRECTIONS.OUTGOING) return `-${edgeContent}->`;
		if (direction === DIRECTIONS.INCOMING) return `<-${edgeContent}-`;
		return `-${edgeContent}-`;
	}

	/**
	 * _buildQueryFields
	 *
	 * Builds query fields for a given payload.
	 *
	 * @param {Query<T>} query
	 * @returns {string}
	 */
	_buildQueryFields<T>(query: Query<T>): string {
		let result = "";
		const fields = Object.keys(query);

		if (fields.length === 0) {
			return "";
		}

		Object.keys(query).forEach((key) => {
			result += `${key}: $${key}, `;
		});

		return `{${result.slice(0, -2)}}`;
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
