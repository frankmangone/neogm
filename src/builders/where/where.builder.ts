import {
	LOGICAL_OPERATORS,
	LogicalOperator,
	nullCheckOperators,
	numberOnlyOperators,
	Operator,
	OPERATORS,
	stringOnlyOperators,
	type WhereParams,
} from "./interfaces";

/**
 * WhereBuilder
 *
 * A utility for building WHERE conditions.
 */
export class WhereBuilder {
	private _cypher: string = "";

	// ----------------------------------------------------------------
	// Public Methods
	// ----------------------------------------------------------------

	/**
	 * where
	 *
	 * Adds a clause to a WHERE statement.
	 * For complex queries, you can pass a raw cypher string.
	 *
	 * @param {string | WhereParams | WhereBuilder} params
	 * @returns {this}
	 */
	public where(params: string | WhereParams | WhereBuilder): this {
		const expression = this._parseExpression(params);

		if (this._cypher.length !== 0) {
			throw new Error(
				"`where` can only be used once. Use `and` or `or` instead."
			);
		} else {
			this._cypher = expression;
		}

		return this;
	}

	/**
	 * and
	 *
	 * Adds a clause to a WHERE statement with an AND logical operator.
	 * For complex queries, pass a raw cypher string.
	 *
	 * @param {string | WhereParams | WhereBuilder} params
	 * @returns {this}
	 */
	public and(params: string | WhereParams | WhereBuilder): this {
		return this._appendLogicalCondition(params, LOGICAL_OPERATORS.AND);
	}

	/**
	 * or
	 *
	 * Adds a clause to a WHERE statement with an OR logical operator.
	 * For complex queries, pass a raw cypher string.
	 *
	 * @param {string | WhereParams | WhereBuilder}
	 * @returns {this}
	 */
	public or(params: string | WhereParams | WhereBuilder): this {
		return this._appendLogicalCondition(params, LOGICAL_OPERATORS.OR);
	}

	/**
	 * xor
	 *
	 * Adds a clause to a WHERE statement with an XOR logical operator.
	 * For complex queries, pass a raw cypher string.
	 *
	 * @param {string | WhereParams | WhereBuilder}
	 * @returns {this}
	 */
	public xor(params: string | WhereParams | WhereBuilder): this {
		return this._appendLogicalCondition(params, LOGICAL_OPERATORS.XOR);
	}

	/**
	 * cypher
	 *
	 * Getter for the inner `_cypher` property.
	 *
	 * @returns {string}
	 */
	public get cypher(): string {
		return this._cypher;
	}

	/**
	 * done
	 *
	 * Ends the where statement, by adding the `WHERE` clause at the beginning of the cypher.
	 *
	 * @returns {this}
	 */
	public done(): this {
		this._cypher = `WHERE ${this._cypher}`;
		return this;
	}

	// ----------------------------------------------------------------
	// Private Methods
	// ----------------------------------------------------------------

	/**
	 * _appendLogicalCondition
	 *
	 * @param {string | WhereParams | WhereBuilder} params
	 * @param {LogicalOperator} operator
	 * @returns {this}
	 */
	private _appendLogicalCondition(
		params: string | WhereParams | WhereBuilder,
		operator: LogicalOperator
	): this {
		if (this._cypher.length === 0) {
			throw new Error(`${operator} must be used after a \`where\` call.`);
		}

		const expression = this._parseExpression(params);
		this._cypher = `${this._cypher} ${operator} ${expression}`;
		return this;
	}

	/**
	 * _parseExpression
	 *
	 * Parses params as an expression to be added to the WHERE clause.
	 *
	 * @param {string | WhereParams | WhereBuilder} params
	 * @returns {string}
	 */
	private _parseExpression(
		params: string | WhereParams | WhereBuilder
	): string {
		if (typeof params === "string") {
			// TODO: string validation to avoid injection
			return params;
		}

		if (params instanceof WhereBuilder) {
			return `(${params.cypher})`;
		}

		const { not = false, field, operator, value: rawValue } = params;

		this._validateOperator(operator, rawValue);
		const value = this._parseExpressionValue(rawValue);

		const expression = value
			? `${field} ${operator} ${value}`
			: `${field} ${operator}`;
		return not ? `NOT ${expression}` : expression;
	}

	/**
	 * _validateOperator
	 *
	 * Validates the operator and value combination, since some operators
	 * can be used with a specific type of value.
	 *
	 * @param {Operator} operator
	 * @param {unknown} value
	 */
	private _validateOperator(operator: Operator, value: unknown): void {
		if (nullCheckOperators.includes(operator)) {
			if (value !== undefined) {
				throw new Error(`Operator "${operator}" does not require a value.`);
			}
			return;
		}

		if (numberOnlyOperators.includes(operator)) {
			if (typeof value !== "number" || Number.isNaN(Number(value))) {
				throw new Error(
					`Operator "${operator}" may only be used in a numeric comparison.`
				);
			}
			return;
		}

		if (stringOnlyOperators.includes(operator)) {
			if (typeof value !== "string") {
				throw new Error(
					`Operator "${operator}" may only be used in a string comparison.`
				);
			}
			return;
		}

		if (operator === OPERATORS.IN) {
			if (!Array.isArray(value)) {
				throw new Error(
					`Operator "${operator}" may only be used with an array value.`
				);
			}
			return;
		}

		// Only remaining unchecked opearator is EQUALS
		if (operator === OPERATORS.EQUALS) {
			if (
				typeof value !== "string" &&
				typeof value !== "number" &&
				typeof value !== "boolean"
			) {
				throw new Error(
					`Operator "${operator}" may only be used with numbers, strings, or booleans.`
				);
			}
			return;
		}

		throw new Error(`Invalid operator provided (provided "${operator}").`);
	}

	/**
	 * _parseExpressionValue
	 *
	 * Takes the value of an expression, and parses it accordingly.
	 *
	 * @param {unknown} value
	 * @returns {string | undefined}
	 */
	private _parseExpressionValue(value: unknown): string | undefined {
		if (typeof value === "undefined") return;
		if (typeof value === "number" || typeof value === "boolean")
			return String(value);
		if (typeof value === "string") return `\"${value}\"`;
		if (!Array.isArray(value))
			throw new Error(`Invalid value provided (provided ${value}).`);

		const parsedArray = value.flat(Infinity).map((value) => {
			if (typeof value === "number" || typeof value === "boolean")
				return String(value);
			if (typeof value === "string") return `\"${value}\"`;
			throw new Error(`Invalid value provided (provided ${value}).`);
		});

		return `[${parsedArray.join(", ")}]`;
	}
}
