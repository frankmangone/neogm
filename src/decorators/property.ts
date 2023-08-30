import "reflect-metadata";
import { ANNOTATED_PROPS } from "~/utils/constants";
import { inferArray, inferPropType } from "~/utils/inference";
import { type PropertyData } from "~/utils/store";

type PropertyOptions = Partial<
	Omit<PropertyData, "customName" | "propertyName">
> & { name?: string };

/**
 * Property
 *
 * Marks a property as part of the schema for a node or edge.
 *
 * @prop {PropertyOptions} options? - Options for property definition.
 * @returns {PropertyDecorator}
 */
export const Property = (options?: PropertyOptions): PropertyDecorator => {
	return (object: object, propertyName: string): void => {
		// Get property annotations for the current class
		const annotatedKeys: PropertyData[] =
			Reflect.getMetadata(ANNOTATED_PROPS, object) ?? [];

		const reflectType = Reflect.getMetadata(
			"design:type",
			object,
			propertyName
		).name;

		const {
			name: customName,
			type = inferPropType(reflectType),
			required = false,
			array = inferArray(reflectType),
		} = options ?? {};

		annotatedKeys.push({
			propertyName: propertyName,
			customName,
			required,
			type,
			array,
		});

		Reflect.defineMetadata(ANNOTATED_PROPS, annotatedKeys, object);
	};
};
