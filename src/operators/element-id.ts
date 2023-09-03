/**
 * ElementId
 *
 * Applies an `elementId` operator to a specified value in a cypher.
 *
 * @param {string} value
 * @returns {string}
 */
export function ElementId(value: string): string {
	if (value.split(".").length !== 1) {
		throw new Error("`elementId` can only be applied on nodes.");
	}

	return `elementId(${value})`;
}
