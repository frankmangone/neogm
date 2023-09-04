export const CYPHER_BLOCKS = {
	MATCH: "MATCH",
	CREATE: "CREATE",
	WHERE: "WHERE",
	CONNECTION: "CONNECTION",
	RETURN: "RETURN",
	ORDER_BY: "ORDER_BY",
} as const;

export enum CypherBlock {
	MATCH = "MATCH",
	CREATE = "CREATE",
	WHERE = "WHERE",
	CONNECTION = "CONNECTION",
	RETURN = "RETURN",
	ORDER_BY = "ORDER_BY",
}

export type CypherBlockType =
	(typeof CYPHER_BLOCKS)[keyof typeof CYPHER_BLOCKS];
