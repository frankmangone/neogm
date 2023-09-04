import {
	LOGICAL_OPERATORS,
	LogicalOperator,
	nullCheckOperators,
	numberOnlyOperators,
	OperatorType,
	OPERATORS,
	stringOnlyOperators,
	type WhereParams,
	type RawWhereParams,
} from "./interfaces";

/**
 * WhereBuilder
 *
 * A utility for building WHERE conditions.
 */
export class WhereBuilder {
	protected _cypher: string = "";
	private _params: Record<string, unknown> = {};

	// ----------------------------------------------------------------
	// Public Methods
	// ----------------------------------------------------------------

	/**
	 * where
	 *
	 * Adds a clause to a WHERE statement.
	 * For complex queries, you can pass a raw cypher string.
	 *
	 * @param {string | RawWhereParams | WhereParams | WhereBuilder} args
	 * @returns {this}
	 */
	public where(
		args: string | RawWhereParams | WhereParams | WhereBuilder
	): this {
		const { expression, params } = this._parseExpression(args);

		Object.assign(this._params, params);

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
	 * @param {string | RawWhereParams | WhereParams | WhereBuilder} params
	 * @returns {this}
	 */
	public and(
		params: string | RawWhereParams | WhereParams | WhereBuilder
	): this {
		return this._appendLogicalCondition(params, LOGICAL_OPERATORS.AND);
	}

	/**
	 * or
	 *
	 * Adds a clause to a WHERE statement with an OR logical operator.
	 * For complex queries, pass a raw cypher string.
	 *
	 * @param {string | RawWhereParams | WhereParams | WhereBuilder}
	 * @returns {this}
	 */
	public or(
		params: string | RawWhereParams | WhereParams | WhereBuilder
	): this {
		return this._appendLogicalCondition(params, LOGICAL_OPERATORS.OR);
	}

	/**
	 * xor
	 *
	 * Adds a clause to a WHERE statement with an XOR logical operator.
	 * For complex queries, pass a raw cypher string.
	 *
	 * @param {string | RawWhereParams | WhereParams | WhereBuilder}
	 * @returns {this}
	 */
	public xor(
		params: string | RawWhereParams | WhereParams | WhereBuilder
	): this {
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
	 * @param {string | RawWhereParams | WhereParams | WhereBuilder} params
	 * @param {LogicalOperator} operator
	 * @returns {this}
	 */
	private _appendLogicalCondition(
		args: string | RawWhereParams | WhereParams | WhereBuilder,
		operator: LogicalOperator
	): this {
		if (this._cypher.length === 0) {
			throw new Error(`${operator} must be used after a \`where\` call.`);
		}

		const { expression, params } = this._parseExpression(args);

		Object.assign(this._params, params);

		this._cypher = `${this._cypher} ${operator} ${expression}`;
		return this;
	}

	/**
	 * _parseExpression
	 *
	 * Parses params as an expression to be added to the WHERE clause.
	 *
	 * @param {string | RawWhereParams | WhereParams | WhereBuilder} args
	 * @returns {string}
	 */
	private _parseExpression(
		args: string | RawWhereParams | WhereParams | WhereBuilder
	): {
		expression: string;
		params: Record<string, unknown>;
	} {
		if (typeof args === "string") {
			// TODO: Add validation logic here for trusted sources
			// If not a trusted source, throw an error
			// throw new Error("Untrusted Cypher string");
			return { expression: args, params: {} };
		}

		if (args instanceof WhereBuilder) {
			return { expression: `(${args.cypher})`, params: args.params };
		}

		// RawWhereParams
		if ("expression" in args) {
			return { expression: args.expression, params: args.params };
		}

		const { not = false, field, operator, value: rawValue, alias } = args;

		this._validateOperator(operator, rawValue);
		const value = this._parseExpressionValue(rawValue);

		const expression = value
			? `${field} ${operator} $${alias ?? field}`
			: `${field} ${operator}`;

		return {
			expression: not ? `NOT ${expression}` : expression,
			params: { [alias ?? field]: value },
		};
	}

	/**
	 * _validateOperator
	 *
	 * Validates the operator and value combination, since some operators
	 * can be used with a specific type of value.
	 *
	 * @param {OperatorType} operator
	 * @param {unknown} value
	 */
	private _validateOperator(operator: OperatorType, value: unknown): void {
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
	 * @returns {any}
	 */
	private _parseExpressionValue(value: unknown): any {
		if (typeof value === "undefined") return;
		if (
			typeof value === "number" ||
			typeof value === "boolean" ||
			typeof value === "string"
		)
			return value;

		if (!Array.isArray(value))
			throw new Error(`Invalid value provided (provided ${value}).`);

		return value.flat(Infinity).map((item) => {
			if (
				typeof item !== "number" &&
				typeof item !== "boolean" &&
				typeof item !== "string"
			) {
				throw new Error(`Invalid value provided (provided ${item}).`);
			}
			return item;
		});
	}
}
