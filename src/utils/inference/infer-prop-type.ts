const PRIMITIVE_TYPES = {
	Number: "number",
	String: "string",
	Boolean: "boolean",
};

export const inferPropType = (type: string) => {
	if (type === "Array") {
		throw new Error("Arrays need specific type annotations.");
	}

	const primitiveType = PRIMITIVE_TYPES[type];

	if (!primitiveType) {
		throw new Error("Explicit type annotation needed.");
	}

	return primitiveType;
};
