import { CreateBuilder } from "~/builders/create.builder";
import { MatchBuilder } from "~/builders/match.builder";
import { DataSource } from "~/data-source/data-source";
import { DeepPartial, ObjectLiteral } from "~/types";

/**
 * NodeManager
 *
 * Node manager supposed to work with any node, automatically find its repository,
 * and call its methods, regardless of the used entity type.
 */
export class NodeManager {
	readonly "@instanceof" = Symbol.for(NodeManager.name);

	/**
	 * Connection used by this entity manager.
	 */
	readonly #dataSource: DataSource;

	constructor(dataSource: DataSource) {
		this.#dataSource = dataSource;
	}

	/**
	 * save
	 *
	 * Saves a given node in the database.
	 */
	async save<Entity extends ObjectLiteral, T extends DeepPartial<Entity>>(
		data: T, // | T[],
		options?: any
	): Promise<any> {
		// Promise<T | T[]> {
		const { entity, nodeName } = options;

		// TODO: Validate schema

		// TODO: Perfect create builder
		const cypher = new CreateBuilder({
			tag: "r",
			label: nodeName,
			fields: data,
		}).return(["r"]).cypher;

		const result = await this.#dataSource.write(cypher, data);
		return result;
	}
}
