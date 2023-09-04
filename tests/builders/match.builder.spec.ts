import { MatchBuilder } from "~/builders/match";
import { Direction } from "~/builders/connection";

describe("MatchBuilder", () => {
	let matchBuilder: MatchBuilder;

	beforeEach(() => {
		matchBuilder = new MatchBuilder();
	});

	describe("Method: constructor", () => {
		it("should instantiate without errors", () => {
			expect(matchBuilder).toBeInstanceOf(MatchBuilder);
			expect(matchBuilder.cypher).toBe("");
		});
	});

	describe("Methods: match & connect", () => {
		it("should build a MATCH statement", () => {
			matchBuilder
				.match({ labels: "Person", tag: "p", fields: { name: "John" } })
				.connect({
					node: { labels: "House", fields: { address: "123 Main St" } },
					edge: { labels: "OWNS", direction: Direction.FORWARD },
				})
				.done();

			expect(matchBuilder.cypher).toBe(
				"MATCH (p:Person {name: $name})-[:OWNS]->(:House {address: $address})"
			);
			expect(matchBuilder.params).toEqual({
				name: "John",
				address: "123 Main St",
			});
		});

		it("should allow chaining multiple connections in a single MATCH statement", () => {
			matchBuilder
				.match({ labels: "Person", tag: "p1", fields: { name: "John" } })
				.connect({
					node: { labels: "House", fields: { address: "123 Main St" } },
					edge: { labels: "OWNS", direction: Direction.FORWARD },
				})
				.match({
					tag: "p1",
				})
				.connect({
					node: { labels: "Car", fields: { model: "Tesla" } },
					edge: { labels: "DRIVES", direction: Direction.FORWARD },
				})
				.done();

			expect(matchBuilder.cypher).toBe(
				"MATCH (p1:Person {name: $name})-[:OWNS]->(:House {address: $address}),\n(p1)-[:DRIVES]->(:Car {model: $model})"
			);
			expect(matchBuilder.params).toEqual({
				name: "John",
				address: "123 Main St",
				model: "Tesla",
			});
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
			matchBuilder
				.match({ labels: "Person", tag: "p", fields: { name: "John" } })
				.connect({
					node: { labels: "House", fields: { address: "123 Main St" } },
					edge: { labels: "OWNS", direction: Direction.FORWARD },
				})
				.done();

			expect(() => {
				matchBuilder.done();
			}).toThrowError("MatchBuilder: Builder already terminated.");
		});
	});
});
