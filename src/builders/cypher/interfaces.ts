import {
	type AddConnectionParams,
	type NodeParams,
} from "../connection/interfaces";

export type MatchParams =
	| {
			node: NodeParams;
			connections?: AddConnectionParams[];
	  }
	| NodeParams;
