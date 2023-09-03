import { type ConnectParams, type NodeParams } from "../connection/interfaces";

export type MatchParams =
	| {
			node: NodeParams;
			connections?: ConnectParams[];
	  }
	| NodeParams;

//

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
