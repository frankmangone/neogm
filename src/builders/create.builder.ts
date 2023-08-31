import { DeepPartial, ObjectLiteral, Query } from "../types";

interface NodeParams {
	tag?: string;
	label?: string;
	fields?: DeepPartial<ObjectLiteral>;
}

export class CreateBuilder {
	#cypher: string;

	constructor(node?: NodeParams) {
		this.#cypher = `CREATE ${this.#parseNodeCypher(node)}`;
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
