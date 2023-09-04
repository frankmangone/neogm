import { CreateBuilder } from "~/builders/create";
import { ConnectionBuilder } from "~/builders/connection";

describe("CreateBuilder", () => {
	let builder: CreateBuilder;
	let connection: ConnectionBuilder;

	beforeEach(() => {
		builder = new CreateBuilder();
		connection = new ConnectionBuilder();
	});

	describe("Method: create", () => {
		it("should build a proper cypher with create and done calls", () => {
			connection.initialize({ labels: "Person" }).done();
			builder.create(connection).done();
			expect(builder.cypher).toBe("CREATE (:Person)");
		});

		it("should properly add parameters from connection to create", () => {
			connection
				.initialize({ labels: "Person", fields: { name: "John" } })
				.done();
			builder.create(connection).done();
			expect(builder.params).toEqual({ name: "John" });
		});

		it("should throw an error if create is called more than once", () => {
			connection.initialize({ labels: "Person" }).done();
			builder.create(connection);
			expect(() => builder.create(connection)).toThrowError(
				"`create` may only be called once. Use `done` to terminate the builder."
			);
		});

		it("should throw an error if an unterminated connection builder is used", () => {
			connection.initialize({ labels: "Person" });
			expect(() => builder.create(connection)).toThrowError(
				"cannot use an unterminated `ConnectionBuilder`"
			);
		});
	});

	describe("Method: done", () => {
		it("should throw an error if done is called without initialization", () => {
			expect(() => builder.done()).toThrowError(
				"Cannot terminate an uninitialized builder."
			);
		});

		it("should throw an error if done is called more than once", () => {
			connection.initialize({ labels: "Person" }).done();
			builder.create(connection).done();
			expect(() => builder.done()).toThrowError("Builder already terminated.");
		});
	});
});
