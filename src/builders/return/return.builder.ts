import { DISTINCT, AS, RETURN } from "./constants";
import { ReturnParams } from "./interfaces";

export class ReturnBuilder {
	protected _cypher: string;
	private _distinct: boolean = false;
	private _valuesWithAlias: Map<string, false | string> = new Map<
		string,
		false | string
	>();

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
	 * return
	 *
	 * Adds a value to return in the resulting cypher expression.
	 *
	 * @param {ReturnParams} args
	 * @returns {this}
	 */
	public return(args: ReturnParams): this {
		if (typeof args === "string") {
			this._valuesWithAlias.set(args, false);
			return this;
		}

		const { value, alias } = args;
		this._valuesWithAlias.set(value, alias ?? false);
		return this;
	}

	/**
	 * distinct
	 *
	 * Adds a DISTINCT clause to the cypher.
	 *
	 * @returns {this}
	 */
	public distinct(): this {
		if (this._distinct) {
			throw new Error(
				"ReturnBuilder: `distinct` may only be called once for each RETURN statement."
			);
		}

		this._distinct = true;
		return this;
	}

	/**
	 * done
	 *
	 * Ends the return statement, and builds the cypher portion accordingly.
	 *
	 * @returns {this}
	 */
	public done(): this {
		if (this._valuesWithAlias.size === 0) {
			throw new Error(
				"ReturnBuilder: No values specified for the RETURN statement."
			);
		}

		this._cypher = `${RETURN} `;

		if (this._distinct) {
			this._cypher = `${this._cypher}${DISTINCT} `;
		}

		const returnedValues = Array.from(this._valuesWithAlias).map(
			(valueWithAlias) => {
				const [value, alias] = valueWithAlias;
				return alias ? `${value} ${AS} ${alias}` : value;
			}
		);

		this._cypher = `${this._cypher}${returnedValues.join(", ")}`;

		return this;
	}
}
