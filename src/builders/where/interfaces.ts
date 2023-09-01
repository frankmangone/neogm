export type WhereParams = {
	not?: boolean;
	field: string;
	operator: Operator;
	value?: unknown;
};

//

export const OPERATORS = {
	EQUALS: "=",
	MATCH: "=~",
	GREATER_THAN: ">",
	LOWER_THAN: "<",
	GREATER_OR_EQUAL_THAN: ">=",
	LOWER_OR_EQUAL_THAN: "<=",
	CONTAINS: "CONTAINS",
	STARTS_WITH: "STARTS WITH",
	ENDS_WITH: "ENDS WITH",
	IN: "IN",
	IS_NULL: "IS NULL",
	IS_NOT_NULL: "IS NOT NULL",
} as const;

export type Operator = (typeof OPERATORS)[keyof typeof OPERATORS];
export const operators = Object.values(OPERATORS);

export const nullCheckOperators: Operator[] = [
	OPERATORS.IS_NULL,
	OPERATORS.IS_NOT_NULL,
];

export const numberOnlyOperators: Operator[] = [
	OPERATORS.GREATER_THAN,
	OPERATORS.LOWER_THAN,
	OPERATORS.GREATER_OR_EQUAL_THAN,
	OPERATORS.LOWER_OR_EQUAL_THAN,
];

export const stringOnlyOperators: Operator[] = [
	OPERATORS.CONTAINS,
	OPERATORS.STARTS_WITH,
	OPERATORS.ENDS_WITH,
	OPERATORS.MATCH,
];

//

export const LOGICAL_OPERATORS = {
	AND: "AND",
	OR: "OR",
	XOR: "XOR",
} as const;

export type LogicalOperator =
	(typeof LOGICAL_OPERATORS)[keyof typeof LOGICAL_OPERATORS];
