import { MatchBuilder } from "~/builders/match";
import { ConnectionBuilder, Direction } from "~/builders/connection";

describe("MatchBuilder", () => {
	let matchBuilder: MatchBuilder;

	beforeEach(() => {
		matchBuilder = new MatchBuilder();
	});

	describe("Method: constructor", () => {
		it("should instantiate without errors", () => {
			expect(matchBuilder).toBeInstanceOf(MatchBuilder);
			expect(matchBuilder.cypher).toBeUndefined();
		});
	});

	describe("Method: match", () => {
		it("should build a MATCH statement using the ConnectionBuilder", () => {
			const connection = new ConnectionBuilder()
				.initialize({ labels: "Person", tag: "p", fields: { name: "John" } })
				.connect({
					node: { labels: "House", fields: { address: "123 Main St" } },
					edge: { labels: "OWNS", direction: Direction.FORWARD },
				})
				.done();

			matchBuilder.match(connection).done();

			expect(matchBuilder.cypher).toBe(
				"MATCH (p:Person {name: $name})-[:OWNS]->(:House {address: $address})"
			);
			expect(matchBuilder.params).toEqual({
				name: "John",
				address: "123 Main St",
			});
		});

		it("should throw error if attempting to use an unterminated ConnectionBuilder", () => {
			const connection = new ConnectionBuilder().initialize().connect();

			expect(() => {
				matchBuilder.match(connection);
			}).toThrowError(
				"MatchBuilder: cannot use an unterminated `ConnectionBuilder`."
			);
		});

		it("should allow chaining multiple connections in a single MATCH statement", () => {
			const connection1 = new ConnectionBuilder()
				.initialize({ labels: "Person", tag: "p1", fields: { name: "John" } })
				.connect({
					node: { labels: "House", fields: { address: "123 Main St" } },
					edge: { labels: "OWNS", direction: Direction.FORWARD },
				})
				.done();

			const connection2 = new ConnectionBuilder()
				.initialize({
					tag: "p1",
				})
				.connect({
					node: { labels: "Car", fields: { model: "Tesla" } },
					edge: { labels: "DRIVES", direction: Direction.FORWARD },
				})
				.done();

			matchBuilder.match(connection1).match(connection2).done();

			expect(matchBuilder.cypher).toBe(
				"MATCH (p1:Person {name: $name})-[:OWNS]->(:House {address: $address}),\n(p1)-[:DRIVES]->(:Car {model: $model})"
			);
			expect(matchBuilder.params).toEqual({
				name: "John",
				address: "123 Main St",
				model: "Tesla",
			});
		});

		it("should throw error if attempting to use match method after done has been called", () => {
			const connection = new ConnectionBuilder()
				.initialize({ labels: "Person", tag: "p", fields: { name: "John" } })
				.connect({
					node: { labels: "House", fields: { address: "123 Main St" } },
					edge: { labels: "OWNS", direction: Direction.FORWARD },
				})
				.done();

			matchBuilder.match(connection).done();

			expect(() => {
				matchBuilder.match(connection);
			}).toThrowError("MatchBuilder: Builder already terminated.");
		});
	});

	describe("Method: done", () => {
		it("should throw error if `done` is called before initializing with match", () => {
			expect(() => {
				matchBuilder.done();
			}).toThrowError(
				"MatchBuilder: Cannot terminate an uninitialized builder."
			);
		});

		it("should throw error if `done` is called multiple times", () => {
			const connection = new ConnectionBuilder()
				.initialize({ labels: "Person", tag: "p", fields: { name: "John" } })
				.connect({
					node: { labels: "House", fields: { address: "123 Main St" } },
					edge: { labels: "OWNS", direction: Direction.FORWARD },
				})
				.done();

			matchBuilder.match(connection).done();

			expect(() => {
				matchBuilder.done();
			}).toThrowError("MatchBuilder: Builder already terminated.");
		});
	});
});
