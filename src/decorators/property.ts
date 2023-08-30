import "reflect-metadata";
import { ANNOTATED_PROPS } from "~/utils/constants";

/**
 * Property
 *
 * Marks a property as part of the schema for a node or edge.
 *
 * @returns {PropertyDecorator}
 */
export const Property = (): PropertyDecorator => {
	return (object: object, propertyName: string): void => {
		const annotatedKeys = Reflect.getMetadata(ANNOTATED_PROPS, object) ?? [];

		// TODO: Save property data

		Reflect.defineMetadata(
			ANNOTATED_PROPS,
			[...annotatedKeys, propertyName],
			object
		);
	};
};
