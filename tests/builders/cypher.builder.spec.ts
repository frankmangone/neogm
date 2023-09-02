import { CypherBuilder } from "~/builders/cypher/cypher.builder";

describe("CypherBuilder", () => {
	let builder: CypherBuilder;

	beforeEach(() => {
		builder = new CypherBuilder();
	});

	describe("Method: constructor", () => {
		it("should initiate an empty Cypher statement", () => {
			expect(builder.cypher).toBe("");
		});
	});

	describe("Method: match", () => {
		it("should construct a simple MATCH statement", () => {
			builder.match({ node: { label: "Person", tag: "p" } }).done();
			expect(builder.cypher).toBe("MATCH (p:Person);");
		});

		it("should construct a MATCH statement with fields", () => {
			builder
				.match({
					node: {
						label: "Person",
						tag: "p",
						fields: { name: "Alice", age: 30 },
					},
				})
				.done();
			expect(builder.cypher).toBe("MATCH (p:Person {name: $name, age: $age});");
		});

		it("should construct a MATCH statement with a connection", () => {
			builder
				.match({
					node: { label: "Person", tag: "p" },
					connections: [
						{
							sourceNode: { tag: "p" },
							edge: { label: "LIKES" },
							targetNode: { tag: "f", label: "Food" },
						},
					],
				})
				.done();
			expect(builder.cypher).toBe("MATCH (p:Person),\n(p)-[:LIKES]-(f:Food);");
		});

		it("should allow adding connections after the initial `match` call", () => {
			builder
				.match({
					node: { label: "Person", tag: "p" },
				})
				.addConnection({
					sourceNode: { tag: "p" },
					edge: { label: "LIKES" },
					targetNode: { tag: "f", label: "Food" },
				})
				.done();
			expect(builder.cypher).toBe("MATCH (p:Person),\n(p)-[:LIKES]-(f:Food);");
		});
	});

	describe("Method: return", () => {
		it("should add a RETURN statement", () => {
			builder
				.match({ node: { label: "Person", tag: "p" } })
				.return("p")
				.done();
			expect(builder.cypher).toBe("MATCH (p:Person)\nRETURN p;");
		});

		it("should add multiple values to RETURN statement", () => {
			builder
				.match({ node: { label: "Person", tag: "p" } })
				.return("p")
				.return("q")
				.done();
			expect(builder.cypher).toBe("MATCH (p:Person)\nRETURN p, q;");
		});

		it("should accept aliased values", () => {
			builder
				.match({ node: { label: "Person", tag: "p" } })
				.return({ value: "p", alias: "person" })
				.done();
			expect(builder.cypher).toBe("MATCH (p:Person)\nRETURN p AS person;");
		});
	});
});
