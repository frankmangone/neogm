import { ReturnBuilder } from "~/builders/return";

describe("ReturnBuilder", () => {
	let builder: ReturnBuilder;

	beforeEach(() => {
		builder = new ReturnBuilder();
	});

	describe("Method: return", () => {
		it("adds a value to the return statement", () => {
			builder.return("node.property").done();
			expect(builder.cypher).toBe("RETURN node.property");
		});

		it("adds a value with an alias to the return statement", () => {
			builder.return({ value: "node.property", alias: "alias" }).done();
			expect(builder.cypher).toBe("RETURN node.property AS alias");
		});

		it("adds multiple values to the return statement", () => {
			builder.return("node.property1").return("node.property2").done();
			expect(builder.cypher).toBe("RETURN node.property1, node.property2");
		});
	});

	describe("Method: distinct", () => {
		it("adds the DISTINCT clause", () => {
			builder.return("a").distinct().done();
			expect(builder.cypher).toBe("RETURN DISTINCT a");
		});

		it("throws an error when called multiple times", () => {
			expect(() => builder.distinct().distinct()).toThrow(
				"`distinct` may only be called once for each RETURN statement."
			);
		});
	});

	describe("done", () => {
		it("builds return statement correctly", () => {
			builder
				.return({ value: "b.prop", alias: "alias" })
				.return({ value: "a" })
				.distinct()
				.done();
			expect(builder.cypher).toBe("RETURN DISTINCT b.prop AS alias, a");
		});

		it("throws an error if no values are specified", () => {
			expect(() => builder.done()).toThrow(
				"No values specified for the RETURN statement."
			);
		});
	});
});
