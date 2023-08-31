export const DIRECTIONS = {
	INCOMING: "incoming",
	OUTGOING: "outgoing",
} as const;

export type Direction = (typeof DIRECTIONS)[keyof typeof DIRECTIONS];

export interface NodeParams {
	tag?: string;
	label?: string;
	fields?: Record<string, unknown>;
}

export interface EdgeParams {
	direction?: Direction;
	tag?: string;
	label?: string;
	fields?: Record<string, unknown>;
}

export interface AddConnectionParams {
	sourceNode?: NodeParams;
	edge?: EdgeParams;
	targetNode?: NodeParams;
}
