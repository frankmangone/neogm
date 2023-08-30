import "reflect-metadata";
import { Property, Node } from "~/decorators";
import { store } from "~/utils/store";

describe("@Node", () => {
	it("should call store.addNode with correct metadata", () => {
		jest.spyOn(store, "addNode").mockImplementation(jest.fn());

		@Node()
		class TestClass {
			@Property({ required: true })
			stringProp: string;

			@Property()
			numberProp?: number;

			@Property({ type: "number" })
			arrayProp?: number[];
		}

		expect(store.addNode).toHaveBeenCalledTimes(1);

		const callArgs = (store.addNode as jest.Mock).mock.calls[0][0];

		expect(callArgs.fields).toBeDefined();
		expect(callArgs.fields).toHaveLength(3);

		expect(callArgs.fields[0]).toEqual({
			propertyName: "stringProp",
			required: true,
			type: "string",
			array: false,
		});

		expect(callArgs.fields[1]).toEqual({
			propertyName: "numberProp",
			required: false,
			type: "number",
			array: false,
		});

		expect(callArgs.fields[2]).toEqual({
			propertyName: "arrayProp",
			required: false,
			type: "number",
			array: true,
		});
	});
});
