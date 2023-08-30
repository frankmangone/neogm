import { type PropertyData, store } from "~/utils/store";
import { ANNOTATED_PROPS } from "~/utils/constants";

export interface NodeData {
	name: string;
}

/**
 * This decorator is used to mark classes that will be an entity (table or document depend on database type).
 * Database schema will be created for all classes decorated with it, and Repository can be retrieved and used for it.
 */
export function Node(): ClassDecorator {
	return function (class_) {
		const props: PropertyData[] = Reflect.getMetadata(
			ANNOTATED_PROPS,
			class_.prototype
		);

		store.addNode({
			fields: props,
		});
	};

	// const options =
	// 	(ObjectUtils.isObject(nameOrOptions)
	// 		? (nameOrOptions as EntityOptions)
	// 		: maybeOptions) || {};
	// const name = typeof nameOrOptions === "string" ? nameOrOptions : options.name;
	// return function (target) {
	// 	getMetadataArgsStorage().tables.push({
	// 		target: target,
	// 		name: name,
	// 		type: "regular",
	// 		orderBy: options.orderBy ? options.orderBy : undefined,
	// 		engine: options.engine ? options.engine : undefined,
	// 		database: options.database ? options.database : undefined,
	// 		schema: options.schema ? options.schema : undefined,
	// 		synchronize: options.synchronize,
	// 		withoutRowid: options.withoutRowid,
	// 	} as TableMetadataArgs);
	// };
}
