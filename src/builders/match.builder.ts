import { Query } from "../types";

export const DIRECTIONS = {
	INCOMING: "incoming",
	OUTGOING: "outgoing",
} as const;

export type Direction = (typeof DIRECTIONS)[keyof typeof DIRECTIONS];

interface NodeParams {
	tag?: string;
	label?: string;
	fields?: Record<string, unknown>;
}

interface EdgeParams {
	direction?: Direction;
	tag?: string;
	label?: string;
	fields?: Record<string, unknown>;
}

interface AddConnectionParams {
	sourceNode?: NodeParams;
	edge?: EdgeParams;
	targetNode?: NodeParams;
}

export class MatchBuilder {
	#cypher: string;

	constructor(node?: NodeParams) {
		this.#cypher = `MATCH ${this.#parseNodeCypher(node)}`;
	}

	/**
	 * cypher
	 *
	 * Getter for the cypher property.
	 *
	 * @returns {string}
	 */
	public get cypher(): string {
		return this.#cypher;
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

		this.#cypher += ",\n";

		const sourceNodeString = this.#parseNodeCypher(sourceNode);
		const targetNodeString = this.#parseNodeCypher(targetNode);
		const edgeString = this.#parseEdgeCypher(edge);

		this.#cypher += `${sourceNodeString}${edgeString}${targetNodeString}`;

		return this;
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
		this.#cypher += ` RETURN ${tags.join(", ")};`;
		return this;
	}

	/**
	 * #parseEdgparseNodeCyphereCypher
	 *
	 * @param {NodeParams | undefined} edge
	 * @returns {string}
	 */
	#parseNodeCypher(node?: NodeParams): string {
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

		result += `${this.#buildQueryFields(fields)})`;

		return result;
	}

	/**
	 * #parseEdgeCypher
	 *
	 * @param {EdgeParams | undefined} edge
	 * @returns {string}
	 */
	#parseEdgeCypher(edge?: EdgeParams): string {
		if (!edge) {
			return "--";
		}

		const { tag = "", label = "", fields = {}, direction } = edge;
		let result = "";

		if (!label && !tag && !fields) {
			return this.#parseDirectedEdge(result, direction);
		}

		if (label) {
			result += `[${tag}:${label}`;
		} else {
			result += `[${tag}`;
		}

		if (result !== "[" && Object.keys(fields).length !== 0) {
			result += " ";
		}

		result += `${this.#buildQueryFields(fields)}]`;
		return this.#parseDirectedEdge(result, direction);
	}

	/**
	 * #parseDirectedEdge
	 *
	 * @param {string} edgeContent
	 * @param {Direction | undefined} direction
	 * @returns {string}
	 */
	#parseDirectedEdge(edgeContent: string, direction?: Direction): string {
		if (direction === DIRECTIONS.OUTGOING) return `-${edgeContent}->`;
		if (direction === DIRECTIONS.INCOMING) return `<-${edgeContent}-`;
		return `-${edgeContent}-`;
	}

	/**
	 * #buildQueryFields
	 *
	 * Builds query fields for a given payload.
	 *
	 * @param {Query<T>} query
	 * @returns {string}
	 */
	#buildQueryFields<T>(query: Query<T>): string {
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
}
