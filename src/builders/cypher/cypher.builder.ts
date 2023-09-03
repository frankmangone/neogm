import { CreateBuilder } from "../create.builder";
import { MatchBuilder } from "../match.builder";
import { CYPHER_BLOCKS, type MatchParams } from "./interfaces";
import type { AddConnectionParams } from "../connection";
import { type RawWhereParams, type WhereParams, WhereBuilder } from "../where";
import { type ReturnParams, ReturnBuilder } from "../return";
import {
	blockBuilderFactory,
	type BlockBuilder,
} from "./block-builder.factory";
import { OrderByBuilder, OrderByParams } from "../order-by";

export class CypherBuilder {
	private _cypher: string[] = [];
	private _params: Record<string, unknown> = {};

	private _currentBuilder: BlockBuilder | null = null;

	// ----------------------------------------------------------------
	// Public Methods
	// ----------------------------------------------------------------

	/**
	 * cypher
	 *
	 * Getter for the cypher property.
	 *
	 * @returns {string}
	 */
	public get cypher(): string {
		return this._cypher.join("\n");
	}

	/**
	 * params
	 *
	 * Getter for the params property.
	 *
	 * @returns {Record<string, unknown>}
	 */
	public get params(): Record<string, unknown> {
		return this._params;
	}

	/**
	 * match
	 *
	 * Adds a MATCH statement to the cypher.
	 *
	 * @param {MatchParams} args
	 * @returns {this}
	 */
	public match(args: MatchParams): this {
		let node, connections;

		if ("node" in args) {
			node = args.node;
			connections = args.connections;
		} else {
			node = args;
		}

		this._clearCurrentBuilder();

		this._currentBuilder = new MatchBuilder(node);
		connections?.forEach((connection) => {
			(this._currentBuilder as MatchBuilder).addConnection(connection);
		});

		return this;
	}

	/**
	 * where
	 *
	 * Adds a WHERE condition to the cypher.
	 *
	 * @param {string | RawWhereParams | WhereParams | WhereBuilder} args
	 * @returns {this}
	 */
	public where(
		args: string | RawWhereParams | WhereParams | WhereBuilder
	): this {
		this._clearCurrentBuilder();
		this._currentBuilder = blockBuilderFactory(CYPHER_BLOCKS.WHERE);
		this._currentBuilder.where(args);
		return this;
	}

	/**
	 * and
	 *
	 * Adds an AND condition to the current WHERE clause.
	 *
	 * @param {string | RawWhereParams | WhereParams | WhereBuilder} args
	 * @returns {this}
	 */
	public and(args: string | RawWhereParams | WhereParams | WhereBuilder): this {
		if (!(this._currentBuilder instanceof WhereBuilder)) {
			throw new Error(
				"Cannot use AND without initializing a WHERE clause first."
			);
		}

		this._currentBuilder.and(args);
		return this;
	}

	/**
	 * or
	 *
	 * Adds an OR condition to the current WHERE clause.
	 *
	 * @param {string | RawWhereParams | WhereParams | WhereBuilder} args
	 * @returns {this}
	 */
	public or(args: string | RawWhereParams | WhereParams | WhereBuilder): this {
		if (!(this._currentBuilder instanceof WhereBuilder)) {
			throw new Error(
				"Cannot use OR without initializing a WHERE clause first."
			);
		}

		this._currentBuilder.or(args);
		return this;
	}

	/**
	 * xor
	 *
	 * Adds an OR condition to the current WHERE clause.
	 *
	 * @param {string | RawWhereParams | WhereParams | WhereBuilder} args
	 * @returns {this}
	 */
	public xor(args: string | RawWhereParams | WhereParams | WhereBuilder): this {
		if (!(this._currentBuilder instanceof WhereBuilder)) {
			throw new Error(
				"Cannot use OR without initializing a WHERE clause first."
			);
		}

		this._currentBuilder.xor(args);
		return this;
	}

	/**
	 * with
	 */
	public with() {
		/* TODO: */
	}

	/**
	 * remove
	 */
	public remove() {
		/* TODO: */
	}

	/**
	 * delete
	 */
	public delete() {
		/* TODO: */
	}

	/**
	 * forEach
	 */
	public forEach() {
		/* TODO: */
	}

	/**
	 * orderBy
	 *
	 * Adds an order by clause or expands existing one by adding a new condition.
	 *
	 * @param {OrderByParams} args
	 * @returns {this}
	 */
	public orderBy(args: OrderByParams): this {
		if (!(this._currentBuilder instanceof OrderByBuilder)) {
			this._clearCurrentBuilder();
			this._currentBuilder = blockBuilderFactory(CYPHER_BLOCKS.ORDER_BY);
		}

		this._currentBuilder.orderBy(args);

		return this;
	}

	/**
	 * paginate
	 */
	public paginate() {
		/* TODO: (SKIP & LIMIT combined)*/
	}

	/**
	 * call
	 */
	public call() {
		/* TODO: (SKIP & LIMIT combined)*/
	}

	/**
	 * addConnection
	 *
	 * Adds a connection to the current statement.
	 * This requires the current builder to support the `addConnection` method.
	 *
	 * @param {AddConnectionParams} args
	 * @returns {this}
	 */
	public addConnection(args: AddConnectionParams): this {
		const builder = this._currentBuilder as any;

		if (!builder?.addConnection) {
			throw new Error("Current build step does not support `addConnection`.");
		}

		builder.addConnection(args);
		return this;
	}

	/**
	 * return
	 *
	 * Adds a return clause to the end of the cypher.
	 *
	 * @param {ReturnParams} args
	 * @returns {this}
	 */
	public return(args: ReturnParams): this {
		if (this._currentBuilder instanceof ReturnBuilder) {
			this._currentBuilder.return(args);
			return this;
		}

		this._clearCurrentBuilder();
		this._currentBuilder = new ReturnBuilder();
		this._currentBuilder.return(args);

		return this;
	}

	/**
	 * distinct
	 *
	 * Adds a distinct clause to the return statement.
	 *
	 * @returns {this}
	 */
	public distinct(): this {
		const builder = this._currentBuilder as any;

		if (!builder?.distinct) {
			throw new Error("Current build step does not support `distinct`.");
		}

		builder.distinct();
		return this;
	}

	/**
	 * done
	 *
	 * Finishes producing the cypher for this builder,
	 * by terminating the current builder and appending its
	 * result.
	 *
	 * @returns {this}
	 */
	public done(): this {
		this._clearCurrentBuilder();

		// Add semicolon at the end of the cypher
		const lastStatement = this._cypher.pop();
		this._cypher.push(`${lastStatement};`);

		return this;
	}

	// ----------------------------------------------------------------
	// Private Methods
	// ----------------------------------------------------------------

	/**
	 * _clearCurrentBuilder
	 *
	 * Clears current builder, by appending the latest produced
	 * builder's result to the cypher builder. This means both appending the
	 * produced expression, and the new params.
	 */
	private _clearCurrentBuilder(): void {
		if (!this._currentBuilder) return;

		(this._currentBuilder as any)?.done?.();

		this._addToCypher(this._currentBuilder.cypher);

		Object.assign(this._params, (this._currentBuilder as any)?.params ?? {});

		this._currentBuilder = null;
	}

	/**
	 * addToCypher
	 *
	 * Setter for the cypher property. Concats new values.
	 *
	 * @param {string} value
	 */
	private _addToCypher(value: string): void {
		this._cypher.push(value);
	}
}
