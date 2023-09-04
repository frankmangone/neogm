import { CypherBuilder, Direction, Operator, Order } from "~/builders/cypher";

describe("CypherBuilder", () => {
	let builder: CypherBuilder;

	beforeEach(() => {
		builder = new CypherBuilder();
	});

	describe("Feature: Individual builders", () => {
		describe("Method: match", () => {
			it("should construct a simple MATCH statement", () => {
				builder.match({ labels: "Person", tag: "p" }).done();
				expect(builder.cypher).toBe("MATCH (p:Person);");
			});

			it("should construct a MATCH statement with fields and aliases", () => {
				builder
					.match({
						labels: "Person",
						tag: "p",
						fields: { name: "Alice", age: { value: 30, alias: "aliasedAge" } },
					})
					.done();
				expect(builder.cypher).toBe(
					"MATCH (p:Person {name: $name, age: $aliasedAge});"
				);
				expect(builder.params).toEqual({ name: "Alice", aliasedAge: 30 });
			});

			it("should support calling `connect` after `match`", () => {
				builder
					.match({
						labels: "Person",
						tag: "p",
					})
					.connect()
					.done();
				expect(builder.cypher).toBe("MATCH (p:Person)--();");
				expect(builder.params).toEqual({});
			});
		});

		describe("Method: where", () => {
			it("should construct a simple WHERE statement", () => {
				builder
					.where({ field: "p", operator: Operator.EQUALS, value: "yes" })
					.done();
				expect(builder.cypher).toBe("WHERE p = $p;");
				expect(builder.params).toEqual({ p: "yes" });
			});

			it("should allow calling `and` after `where`", () => {
				builder
					.where({ field: "p", operator: Operator.IS_NULL })
					.and({ field: "q", operator: Operator.IS_NULL })
					.done();
				expect(builder.cypher).toBe("WHERE p IS NULL AND q IS NULL;");
				expect(builder.params).toEqual({});
			});

			it("should allow calling `or` after `where`", () => {
				builder
					.where({ field: "p", operator: Operator.IS_NULL })
					.or({ field: "q", operator: Operator.IS_NULL })
					.done();
				expect(builder.cypher).toBe("WHERE p IS NULL OR q IS NULL;");
				expect(builder.params).toEqual({});
			});

			it("should allow calling `xor` after `where`", () => {
				builder
					.where({ field: "p", operator: Operator.IS_NULL })
					.xor({ field: "q", operator: Operator.IS_NULL })
					.done();
				expect(builder.cypher).toBe("WHERE p IS NULL XOR q IS NULL;");
				expect(builder.params).toEqual({});
			});
		});

		describe("Method: orderBy", () => {
			it("should construct a simple ORDER BY statement", () => {
				builder.orderBy({ property: "p", order: Order.ASC }).done();
				expect(builder.cypher).toBe("ORDER BY p ASC;");
			});
		});

		describe("Method: return", () => {
			it("should add a RETURN statement", () => {
				builder.return("p").done();
				expect(builder.cypher).toBe("RETURN p;");
			});

			it("should add a RETURN statement with alias", () => {
				builder.return({ value: "p", alias: "pepe" }).done();
				expect(builder.cypher).toBe("RETURN p AS pepe;");
			});

			it("should handle multiple values in the RETURN statement", () => {
				builder.return("p").return("q").done();
				expect(builder.cypher).toBe("RETURN p, q;");
			});
		});
	});

	describe("Feature: Combined builders", () => {
		it("should produce an expression with MATCH, WHERE, and RETURN", () => {
			builder
				.match({ tag: "p", labels: "Person" })
				.connect({
					node: { tag: "h", labels: "House" },
					edge: { labels: "OWNS", direction: Direction.FORWARD },
				})
				.where({
					field: "h.electricity",
					operator: Operator.EQUALS,
					value: true,
					alias: "electricity",
				})
				.return("p")
				.done();
			expect(builder.cypher).toBe(
				"MATCH (p:Person)-[:OWNS]->(h:House)\nWHERE h.electricity = $electricity\nRETURN p;"
			);
			expect(builder.params).toEqual({ electricity: true });
		});
	});

	describe("Feature: Error handling", () => {
		// it("should throw error when trying to connect without a MATCH", () => {
		// const connectArgs: ConnectParams = {
		// 	/*... your params here ...*/
		// };
		// expect(() => {
		// 	builder.connect(connectArgs);
		// }).toThrow(/*...expected error message...*/);
		// });
		// Add similar error handling tests for other methods.
		// ...
	});
});
