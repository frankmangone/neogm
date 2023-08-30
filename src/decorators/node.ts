import { type PropertyData, store } from "~/utils/store";
import { ANNOTATED_PROPS } from "~/utils/constants";

export interface NodeData {
	name: string;
}

/**
 * Node
 *
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
}
