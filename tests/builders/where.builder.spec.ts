import { WhereBuilder, OPERATORS } from "~/builders/where";

describe("WhereBuilder", () => {
	let whereBuilder: WhereBuilder;

	beforeEach(() => {
		whereBuilder = new WhereBuilder();
	});

	describe("Method: where", () => {
		// Basic `where` functionality
		it("should add a basic where clause", () => {
			whereBuilder.where({
				field: "age",
				operator: OPERATORS.EQUALS,
				value: 25,
			});
			expect(whereBuilder.cypher).toBe("WHERE age = 25");
		});

		it("should add a where clause with a string value", () => {
			whereBuilder.where({
				field: "name",
				operator: OPERATORS.EQUALS,
				value: "John",
			});
			expect(whereBuilder.cypher).toBe('WHERE name = "John"');
		});

		it("should add a raw cypher string", () => {
			whereBuilder.where("age = 25");
			expect(whereBuilder.cypher).toBe("WHERE age = 25");
		});

		it("should throw error when trying to use `where` more than once", () => {
			whereBuilder.where({
				field: "age",
				operator: OPERATORS.EQUALS,
				value: 25,
			});
			expect(() => {
				whereBuilder.where({
					field: "name",
					operator: OPERATORS.EQUALS,
					value: "John",
				});
			}).toThrowError(
				"`where` can only be used once. Use `and` or `or` instead."
			);
		});

		it("should throw error for invalid operator", () => {
			expect.assertions(2);

			try {
				// @ts-ignore
				whereBuilder.where({ field: "age", operator: "==", value: 25 });
			} catch (err) {
				expect(err).toBeInstanceOf(Error);
				expect(err.message).toBe("Invalid operator provided.");
			}
		});
	});

	describe("Method: and", () => {
		it("should combine cypher with AND", () => {
			whereBuilder
				.where({ field: "age", operator: OPERATORS.EQUALS, value: 25 })
				.and({ field: "name", operator: OPERATORS.EQUALS, value: "John" });
			expect(whereBuilder.cypher).toBe('WHERE age = 25 AND name = "John"');
		});

		it("should throw error when trying to use `and` before `where`", () => {
			expect(() => {
				whereBuilder.and({
					field: "name",
					operator: OPERATORS.EQUALS,
					value: "John",
				});
			}).toThrowError("`and` must be used after a `where` call.");
		});
	});

	describe("Method: or", () => {
		it("should combine cypher with OR", () => {
			whereBuilder
				.where({ field: "age", operator: OPERATORS.EQUALS, value: 25 })
				.or({ field: "name", operator: OPERATORS.EQUALS, value: "John" });
			expect(whereBuilder.cypher).toBe('WHERE age = 25 OR name = "John"');
		});

		it("should throw error when trying to use `or` before `where`", () => {
			expect(() => {
				whereBuilder.or({
					field: "name",
					operator: OPERATORS.EQUALS,
					value: "John",
				});
			}).toThrowError("`or` must be used after a `where` call.");
		});
	});
});
