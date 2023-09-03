export const DIRECTIONS = {
	FORWARD: "forward",
	BACKWARD: "backward",
} as const;

export type DirectionType = (typeof DIRECTIONS)[keyof typeof DIRECTIONS];

export enum Direction {
	FORWARD = "forward",
	BACKWARD = "backward",
}

type Primitive = string | number | boolean;
type Labels = string | string[];
export type Fields = Record<
	string,
	Primitive | { value: Primitive; alias: string }
>;

export interface NodeParams {
	tag?: string;
	labels?: Labels;
	fields?: Fields;
}

export interface EdgeParams {
	direction?: Direction;
	tag?: string;
	labels?: Labels;
	fields?: Fields;
}

export interface ConnectParams {
	edge?: EdgeParams;
	node?: NodeParams;
}
