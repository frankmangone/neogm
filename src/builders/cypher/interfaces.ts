import {
	type AddConnectionParams,
	type NodeParams,
} from "../connection/interfaces";

export interface MatchParams {
	node: NodeParams;
	connections?: AddConnectionParams[];
}
