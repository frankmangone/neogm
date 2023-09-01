import { WhereBuilder, OPERATORS } from "~/builders/where";

describe("WhereBuilder", () => {
	let whereBuilder: WhereBuilder;

	beforeEach(() => {
		whereBuilder = new WhereBuilder();
	});

	describe("Method: where", () => {
		it("should set basic where condition with string", () => {
			whereBuilder.where('name = "John"');
			expect(whereBuilder.cypher).toBe('name = "John"');
		});

		it("should set basic where condition with params", () => {
			whereBuilder.where({
				field: "age",
				operator: OPERATORS.EQUALS,
				value: 25,
			});
			expect(whereBuilder.cypher).toBe("age = 25");
		});

		it("should handle NOT condition", () => {
			whereBuilder.where({
				not: true,
				field: "age",
				operator: OPERATORS.EQUALS,
				value: 25,
			});
			expect(whereBuilder.cypher).toBe("NOT age = 25");
		});

		it("should add a where clause with a string value", () => {
			whereBuilder.where({
				field: "name",
				operator: OPERATORS.EQUALS,
				value: "John",
			});
			expect(whereBuilder.cypher).toBe('name = "John"');
		});

		it("should accept null check operators", () => {
			const data = { field: "expiredAt" };

			whereBuilder.where({ ...data, operator: OPERATORS.IS_NOT_NULL });
			expect(whereBuilder.cypher).toBe("expiredAt IS NOT NULL");

			whereBuilder = new WhereBuilder();
			whereBuilder.where({ ...data, operator: OPERATORS.IS_NULL });
			expect(whereBuilder.cypher).toBe("expiredAt IS NULL");
		});

		it("should accept number operators", () => {
			const data = { field: "age", value: 25 };

			whereBuilder.where({ ...data, operator: OPERATORS.GREATER_THAN });
			expect(whereBuilder.cypher).toBe("age > 25");

			whereBuilder = new WhereBuilder();
			whereBuilder.where({ ...data, operator: OPERATORS.LOWER_THAN });
			expect(whereBuilder.cypher).toBe("age < 25");

			whereBuilder = new WhereBuilder();
			whereBuilder.where({
				...data,
				operator: OPERATORS.GREATER_OR_EQUAL_THAN,
			});
			expect(whereBuilder.cypher).toBe("age >= 25");

			whereBuilder = new WhereBuilder();
			whereBuilder.where({
				...data,
				operator: OPERATORS.LOWER_OR_EQUAL_THAN,
			});
			expect(whereBuilder.cypher).toBe("age <= 25");
		});

		it("should accept string operators", () => {
			const stringData = { field: "color", value: "blu" };

			whereBuilder.where({ ...stringData, operator: OPERATORS.EQUALS });
			expect(whereBuilder.cypher).toBe('color = "blu"');

			whereBuilder = new WhereBuilder();
			whereBuilder.where({ ...stringData, operator: OPERATORS.STARTS_WITH });
			expect(whereBuilder.cypher).toBe('color STARTS WITH "blu"');

			whereBuilder = new WhereBuilder();
			whereBuilder.where({ ...stringData, operator: OPERATORS.ENDS_WITH });
			expect(whereBuilder.cypher).toBe('color ENDS WITH "blu"');

			whereBuilder = new WhereBuilder();
			whereBuilder.where({ ...stringData, operator: OPERATORS.CONTAINS });
			expect(whereBuilder.cypher).toBe('color CONTAINS "blu"');

			whereBuilder = new WhereBuilder();
			whereBuilder.where({ ...stringData, operator: OPERATORS.MATCH });
			expect(whereBuilder.cypher).toBe('color =~ "blu"');
		});

		it("should accept the IN operator", () => {
			const inData = { field: "bytes", value: [1, 2, 4, 8] };

			whereBuilder.where({
				...inData,
				operator: OPERATORS.IN,
			});
			expect(whereBuilder.cypher).toBe("bytes IN [1, 2, 4, 8]");
		});

		it("should throw if null check operators are passed a value", () => {
			const data = { field: "expiredAt", value: 25 };

			expect(() => {
				whereBuilder.where({ ...data, operator: OPERATORS.IS_NOT_NULL });
			}).toThrow(`Operator "IS NOT NULL" does not require a value.`);

			expect(() => {
				whereBuilder.where({ ...data, operator: OPERATORS.IS_NULL });
			}).toThrow(`Operator "IS NULL" does not require a value.`);
		});

		it("should throw if number operators are passed a non-numeric value", () => {
			const data = { field: "age", value: "John" };

			expect(() => {
				whereBuilder.where({ ...data, operator: OPERATORS.GREATER_THAN });
			}).toThrow(`Operator ">" may only be used in a numeric comparison.`);

			expect(() => {
				whereBuilder.where({ ...data, operator: OPERATORS.LOWER_THAN });
			}).toThrow(`Operator "<" may only be used in a numeric comparison.`);

			expect(() => {
				whereBuilder.where({
					...data,
					operator: OPERATORS.GREATER_OR_EQUAL_THAN,
				});
			}).toThrow(`Operator ">=" may only be used in a numeric comparison.`);

			expect(() => {
				whereBuilder.where({
					...data,
					operator: OPERATORS.LOWER_OR_EQUAL_THAN,
				});
			}).toThrow(`Operator "<=" may only be used in a numeric comparison.`);
		});

		it("should throw if string operators are passed a non-string value", () => {
			const data = { field: "name", value: 25 };

			expect(() => {
				whereBuilder.where({ ...data, operator: OPERATORS.CONTAINS });
			}).toThrow(
				`Operator "CONTAINS" may only be used in a string comparison.`
			);

			expect(() => {
				whereBuilder.where({ ...data, operator: OPERATORS.STARTS_WITH });
			}).toThrow(
				`Operator "STARTS WITH" may only be used in a string comparison.`
			);

			expect(() => {
				whereBuilder.where({ ...data, operator: OPERATORS.ENDS_WITH });
			}).toThrow(
				`Operator "ENDS WITH" may only be used in a string comparison.`
			);

			expect(() => {
				whereBuilder.where({ ...data, operator: OPERATORS.MATCH });
			}).toThrow(`Operator "=~" may only be used in a string comparison.`);
		});

		it("should throw if IN is passed an invalid value", () => {
			expect(() => {
				whereBuilder.where({
					field: "bytes",
					operator: OPERATORS.IN,
					value: 8,
				});
			}).toThrow(`Operator "IN" may only be used with an array value.`);
		});

		it("should throw if EQUALS is passed an invalid value", () => {
			expect(() => {
				whereBuilder.where({
					field: "bytes",
					operator: OPERATORS.EQUALS,
					value: [],
				});
			}).toThrow(`may only be used with numbers, strings, or booleans.`);
		});

		it("should throw error if where is called multiple times", () => {
			expect(() => {
				whereBuilder.where('name = "John"').where("age = 25");
			}).toThrow("`where` can only be used once. Use `and` or `or` instead.");
		});

		it("should throw error for invalid operator", () => {
			expect(() => {
				// @ts-ignore
				whereBuilder.where({ field: "age", operator: "==", value: 25 });
			}).toThrow('Invalid operator provided (provided "==").');
		});
	});

	describe("Method: and", () => {
		it("should append an AND condition", () => {
			whereBuilder.where('name = "John"').and("age = 25");
			expect(whereBuilder.cypher).toBe('name = "John" AND age = 25');
		});

		it("should allow nested where builders", () => {
			whereBuilder
				.where({
					field: "gender",
					operator: OPERATORS.EQUALS,
					value: "male",
				})
				.and(new WhereBuilder().where("age < 25").or("age > 40"));
			expect(whereBuilder.cypher).toBe(
				'gender = "male" AND (age < 25 OR age > 40)'
			);

			whereBuilder = new WhereBuilder();
			whereBuilder
				.where(new WhereBuilder().where("age < 25").or("age > 40"))
				.and({
					field: "gender",
					operator: OPERATORS.EQUALS,
					value: "male",
				});
			expect(whereBuilder.cypher).toBe(
				'(age < 25 OR age > 40) AND gender = "male"'
			);
		});

		it("should throw an error if called before where()", () => {
			expect(() => {
				whereBuilder.and("age = 25");
			}).toThrow("AND must be used after a `where` call.");
		});
	});

	describe("Method: or", () => {
		it("should append an OR condition", () => {
			whereBuilder.where('name = "John"').or("age = 25");
			expect(whereBuilder.cypher).toBe('name = "John" OR age = 25');
		});

		it("should allow nested where builders", () => {
			whereBuilder
				.where({
					field: "gender",
					operator: OPERATORS.EQUALS,
					value: "male",
				})
				.or(new WhereBuilder().where("age > 25").and("age < 40"));
			expect(whereBuilder.cypher).toBe(
				'gender = "male" OR (age > 25 AND age < 40)'
			);

			whereBuilder = new WhereBuilder();
			whereBuilder
				.where(new WhereBuilder().where("age > 25").and("age < 40"))
				.or({
					field: "gender",
					operator: OPERATORS.EQUALS,
					value: "male",
				});
			expect(whereBuilder.cypher).toBe(
				'(age > 25 AND age < 40) OR gender = "male"'
			);
		});

		it("should throw an error if called before where()", () => {
			expect(() => {
				whereBuilder.or("age = 25");
			}).toThrow("OR must be used after a `where` call.");
		});
	});

	describe("Method: xor", () => {
		it("should append an XOR condition", () => {
			whereBuilder.where('name = "John"').xor("age = 25");
			expect(whereBuilder.cypher).toBe('name = "John" XOR age = 25');
		});

		it("should allow nested where builders", () => {
			whereBuilder
				.where({
					field: "gender",
					operator: OPERATORS.EQUALS,
					value: "male",
				})
				.xor(new WhereBuilder().where("age > 25").and("age < 40"));
			expect(whereBuilder.cypher).toBe(
				'gender = "male" XOR (age > 25 AND age < 40)'
			);

			whereBuilder = new WhereBuilder();
			whereBuilder
				.where(new WhereBuilder().where("age > 25").and("age < 40"))
				.xor({
					field: "gender",
					operator: OPERATORS.EQUALS,
					value: "male",
				});
			expect(whereBuilder.cypher).toBe(
				'(age > 25 AND age < 40) XOR gender = "male"'
			);
		});

		it("should throw an error if called before where()", () => {
			expect(() => {
				whereBuilder.xor("age = 25");
			}).toThrow("XOR must be used after a `where` call.");
		});
	});
});
