import { operators, type WhereParams } from "./interfaces";

// TODO: Nested conditions?

/**
 * WhereBuilder
 *
 * A utility for building WHERE conditions.
 */
export class WhereBuilder {
	private _cypher: string = "";

	/**
	 * where
	 *
	 * Adds a clause to a WHERE statement.
	 * For complex queries, pass a raw cypher string.
	 *
	 * @param {string | WhereParams} params
	 * @returns {this}
	 */
	public where(params: string | WhereParams): this {
		const expression = this._parseExpression(params);

		if (this._cypher.length !== 0) {
			throw new Error(
				"`where` can only be used once. Use `and` or `or` instead."
			);
		} else {
			this._cypher = `WHERE ${expression}`;
		}

		return this;
	}

	/**
	 * and
	 *
	 * Adds a clause to a WHERE statement with an AND logical operator.
	 * For complex queries, pass a raw cypher string.
	 *
	 * @param {string | WhereParams} params
	 * @returns {this}
	 */
	public and(params: string | WhereParams): this {
		if (this._cypher.length === 0) {
			throw new Error("`and` must be used after a `where` call.");
		}

		const expression = this._parseExpression(params);
		this._cypher = `${this._cypher} AND ${expression}`;
		return this;
	}

	/**
	 * or
	 *
	 * Adds a clause to a WHERE statement with an OR logical operator.
	 * For complex queries, pass a raw cypher string.
	 *
	 * @param {string | WhereParams}
	 * @returns {this}
	 */
	public or(params: string | WhereParams): this {
		if (this._cypher.length === 0) {
			throw new Error("`or` must be used after a `where` call.");
		}

		const expression = this._parseExpression(params);
		this._cypher = `${this._cypher} OR ${expression}`;
		return this;
	}

	/**
	 * cypher
	 *
	 * Getter for the inner `_cypher` property.
	 */
	public get cypher(): string {
		return this._cypher;
	}

	/**
	 * _parseExpression
	 *
	 * Parses params as an expression to be added to the WHERE clause.
	 *
	 * @param {string | WhereParams} params
	 * @returns {string}
	 */
	private _parseExpression(params: string | WhereParams): string {
		if (typeof params === "string") {
			// TODO: string validation to avoid injection
			return params;
		}

		const { field, operator, value } = params;

		if (!operators.includes(operator)) {
			throw new Error("Invalid operator provided.");
		}

		return typeof value === "string"
			? `${field} ${operator} "${value}"`
			: `${field} ${operator} ${value}`;
	}
}
