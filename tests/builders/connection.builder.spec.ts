import { ConnectionBuilder, Direction } from "~/builders/connection";

describe("ConnectionBuilder", () => {
	let builder: ConnectionBuilder;

	beforeEach(() => {
		builder = new ConnectionBuilder();
	});

	describe("Method: initialize", () => {
		it("should initialize with a node", () => {
			builder.initialize({
				tag: "p",
				labels: "Person",
				fields: { name: "Alice" },
			});
			expect(builder.cypher).toBe("(p:Person {name: $name})");
			expect(builder.params).toEqual({ name: "Alice" });
		});

		it("should allow initialization with no params", () => {
			builder.initialize();
			expect(builder.cypher).toBe("()");
			expect(builder.params).toEqual({});
		});

		it("should throw an error if `initialize` is called twice", () => {
			builder.initialize({ tag: "p", labels: "Person" });
			expect(() => {
				builder.initialize({ tag: "a", labels: "Animal" });
			}).toThrowError("`initialize` may only be called once.");
		});
	});

	describe("Method: connect", () => {
		it("should create a connection between two nodes", () => {
			builder
				.initialize({ tag: "p", labels: "Person", fields: { name: "Alice" } })
				.connect({
					edge: { direction: Direction.FORWARD, labels: "KNOWS" },
					node: {
						tag: "f",
						labels: "Person",
						fields: { name: { value: "Frank", alias: "f_name" } },
					},
				});

			expect(builder.cypher).toBe(
				"(p:Person {name: $name})-[:KNOWS]->(f:Person {name: $f_name})"
			);
			expect(builder.params).toEqual({ name: "Alice", f_name: "Frank" });
		});

		it("should allow connecting with no params", () => {
			builder
				.initialize({ tag: "p", labels: "Person", fields: { name: "Alice" } })
				.connect();

			expect(builder.cypher).toBe("(p:Person {name: $name})--()");
			expect(builder.params).toEqual({ name: "Alice" });
		});

		it("should chain multiple connections", () => {
			builder
				.initialize({ tag: "p", labels: "Person", fields: { name: "Alice" } })
				.connect({
					edge: { direction: Direction.FORWARD, labels: "OWNS" },
					node: {
						tag: "h",
						labels: "House",
						fields: { address: "123 Street" },
					},
				})
				.connect({
					edge: { direction: Direction.FORWARD, labels: "HAS_SERVICE" },
					node: {
						tag: "s",
						labels: "Service",
						fields: { type: "electricity" },
					},
				});

			expect(builder.cypher).toBe(
				"(p:Person {name: $name})-[:OWNS]->(h:House {address: $address})-[:HAS_SERVICE]->(s:Service {type: $type})"
			);
			expect(builder.params).toEqual({
				name: "Alice",
				address: "123 Street",
				type: "electricity",
			});
		});

		it("should handle undirected edges", () => {
			builder
				.initialize({
					tag: "a",
					labels: "Animal",
					fields: { species: { value: "cat", alias: "a_species" } },
				})
				.connect({
					edge: { labels: "RELATED_TO" },
					node: {
						tag: "b",
						labels: "Animal",
						fields: { species: { value: "dog", alias: "b_species" } },
					},
				});

			expect(builder.cypher).toBe(
				"(a:Animal {species: $a_species})-[:RELATED_TO]-(b:Animal {species: $b_species})"
			);
			expect(builder.params).toEqual({ a_species: "cat", b_species: "dog" });
		});

		it("should handle nodes without labels", () => {
			builder.initialize({ tag: "a" }).connect({
				edge: { direction: Direction.BACKWARD, labels: "LINK" },
				node: { tag: "b" },
			});

			expect(builder.cypher).toBe("(a)<-[:LINK]-(b)");
			expect(builder.params).toEqual({});
		});

		it("should handle edges without labels or direction", () => {
			builder.initialize({ tag: "a", labels: "Entity" }).connect({
				edge: {},
				node: { tag: "b", labels: "Entity" },
			});

			expect(builder.cypher).toBe("(a:Entity)--(b:Entity)");
			expect(builder.params).toEqual({});
		});

		it("should throw error if `connect` is called before initialization", () => {
			expect(() => {
				builder.connect({
					edge: { direction: Direction.FORWARD, labels: "KNOWS" },
					node: { tag: "p", labels: "Person", fields: { name: "Paul" } },
				});
			}).toThrowError("`connect` may only be called after initialization.");
		});
	});

	describe("Method: done", () => {
		it("should terminate the connection builder", () => {
			builder
				.initialize({ tag: "p", labels: "Person" })
				.connect({ node: { tag: "f", labels: "Friend" } })
				.done();

			expect(builder.isTerminated).toBe(true);
		});

		it("should throw an error if terminating an uninitialized builder", () => {
			expect(() => {
				builder.done();
			}).toThrowError("Cannot terminate an uninitialized builder.");
		});

		it("should throw an error if terminated builder is used again", () => {
			builder.initialize({ tag: "p", labels: "Person" }).done();

			expect(() => {
				builder.connect({ node: { tag: "f", labels: "Friend" } });
			}).toThrowError("Builder already terminated.");

			expect(() => {
				builder.done();
			}).toThrowError("Builder already terminated.");
		});
	});
});
