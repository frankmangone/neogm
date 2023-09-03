/**
 * Keys
 *
 * Applies a `keys` operator to a specified value in a cypher.
 *
 * @param {string} value
 * @returns {string}
 */
export function Keys(value: string): string {
	return `keys(${value})`;
}
