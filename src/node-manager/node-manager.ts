import { CreateBuilder } from "~/builders/create.builder";
import { MatchBuilder } from "~/builders/match/match.builder";
import { DataSource } from "~/data-source/data-source";
import { Node, DeepPartial, ObjectLiteral } from "~/types";
import type { FindManyOptions, SaveOptions } from "./interfaces";
import { QueryResult, RecordShape } from "neo4j-driver";

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
		options: SaveOptions<T>
	): Promise<any> {
		// Promise<T | T[]> {
		const { node } = options;

		// TODO: Validate schema

		// TODO: Perfect the create builder
		const cypher = new CreateBuilder({
			tag: "r",
			label: node.name,
			fields: data,
		}).return(["r"]).cypher;

		return this.#dataSource.write(cypher, data);
	}

	/**
	 * Finds entities that match given find options.
	 */
	async find<Entity extends ObjectLiteral>(
		options: FindManyOptions<Entity>
	): Promise<QueryResult<RecordShape<string>>> {
		const { node, query: fields } = options;

		const cypher = new MatchBuilder({
			tag: "r",
			label: node.name,
			fields,
		}).return(["r"]).cypher;

		return this.#dataSource.read(cypher, fields);

		// const metadata = this.#dataSource.getMetadata(entityClass);
		// return this.createQueryBuilder<Entity>(
		// 	entityClass as any,
		// 	FindOptionsUtils.extractFindManyOptionsAlias(options) || metadata.name
		// )
		// 	.setFindOptions(options || {})
		// 	.getMany();
	}
}
