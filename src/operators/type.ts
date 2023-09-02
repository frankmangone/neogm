/**
 * Type
 *
 * Applies a `type` operator to a specified value in a cypher.
 *
 * @param {string} value
 * @returns {string}
 */
export function Type(value: string): string {
	return `type(${value})`;
}
