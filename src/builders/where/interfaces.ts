export const OPERATORS = {
	EQUALS: "=",
	GREATER_THAN: ">",
	LOWER_THAN: "<",
	GREATER_OR_EQUAL_THAN: ">=",
	LOWER_OR_EQUAL_THAN: "<=",
	NOT_EQUALS: "<>",
} as const;

export type Operator = (typeof OPERATORS)[keyof typeof OPERATORS];
export const operators = Object.values(OPERATORS);

export type WhereParams = {
	field: string;
	operator: Operator;
	value: any;
};
