import { ASC, DESC, ORDER_BY } from "./constants";
import { OrderByParams } from "./interfaces";

export class OrderByBuilder {
	protected _cypher: string;
	private _properties: Map<string, false | typeof ASC | typeof DESC> = new Map<
		string,
		false | typeof ASC | typeof DESC
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
	 * orderBy
	 *
	 * Adds a property to order by. Properties are considered in the order they are added;
	 * with the first call of `orderBy` being the first condition in the resulting cypher expression.
	 *
	 * @param {OrderByParams} args
	 * @returns {this}
	 */
	public orderBy(args: OrderByParams): this {
		const { property, order } = args;
		this._properties.set(property, order);
		return this;
	}

	/**
	 * done
	 *
	 * Finishes the construction of the ORDER BY clause, by producing the corresponding
	 * cypher expression.
	 *
	 * @returns {this}
	 */
	public done(): this {
		if (this._properties.size === 0) {
			throw new Error("No properties to order by were specified.");
		}

		const orderByConditions = Array.from(this._properties).map((property) => {
			const [key, order] = property;
			return order ? `${key} ${order}` : key;
		});

		this._cypher = `${ORDER_BY} ${orderByConditions.join(", ")}`;
		return this;
	}
}
