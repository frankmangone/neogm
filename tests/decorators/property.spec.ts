import "reflect-metadata";
import { Property } from "~/decorators/property";
import { ANNOTATED_PROPS } from "~/utils/constants";

const getPropertyMetadata = (target: object) => {
	return Reflect.getMetadata(ANNOTATED_PROPS, target);
};

describe("@Property", () => {
	it("should define metadata for a property", () => {
		class TestClass {
			@Property()
			prop: string;
		}

		const metadata = getPropertyMetadata(new TestClass());

		expect(metadata).toBeDefined();
		expect(metadata[0]).toEqual({
			propertyName: "prop",
			customName: undefined,
			required: false,
			type: "string",
			array: false,
		});
	});

	it("should use custom name when provided", () => {
		class TestClass {
			@Property({ name: "customProp" })
			prop: string;
		}

		const metadata = getPropertyMetadata(new TestClass());

		expect(metadata[0].customName).toEqual("customProp");
	});

	it("should infer primitive types correctly", () => {
		class TestClass {
			@Property()
			number: number;

			@Property()
			string: string;

			@Property()
			boolean: boolean;
		}

		const metadata = getPropertyMetadata(new TestClass());

		expect(metadata[0].type).toEqual("number");
		expect(metadata[1].type).toEqual("string");
		expect(metadata[2].type).toEqual("boolean");
	});

	it("should throw when a key is marked as array without passing explicit type", () => {
		expect.assertions(2);

		try {
			class TestClass {
				@Property()
				number: number[];
			}
		} catch (err) {
			expect(err).toBeInstanceOf(Error);
			expect(err.message).toBe("Arrays need specific type annotations.");
		}
	});

	it("should accept arrays marked with specific typings", () => {
		class TestClass {
			@Property({ type: "number" })
			number: number[];

			@Property({ type: "string" })
			string: string[];

			@Property({ type: "boolean" })
			boolean: boolean[];
		}

		const metadata = getPropertyMetadata(new TestClass());

		expect(metadata[0].type).toEqual("number");
		expect(metadata[0].array).toEqual(true);
		expect(metadata[1].type).toEqual("string");
		expect(metadata[1].array).toEqual(true);
		expect(metadata[2].type).toEqual("boolean");
		expect(metadata[2].array).toEqual(true);
	});

	it("should mark keys as required when explicitly stated", () => {
		class TestClass {
			@Property({ required: true })
			requiredKey: number;

			@Property()
			optionalKey?: string;
		}

		const metadata = getPropertyMetadata(new TestClass());

		expect(metadata[0].required).toEqual(true);
		expect(metadata[1].required).toEqual(false);
	});

	it("should accept nested object keys", () => {
		class NestedClass {
			someKey: boolean;
		}

		class TestClass {
			@Property({ type: NestedClass, required: true })
			nested: NestedClass;

			@Property({ type: NestedClass, required: true })
			nestedArray: NestedClass[];
		}

		const metadata = getPropertyMetadata(new TestClass());

		expect(metadata[0].type).toEqual(NestedClass);
		expect(metadata[1].type).toEqual(NestedClass);
	});

	it("should throw if a nested object is specified without expliciting `type`", () => {
		expect.assertions(2);

		class NestedClass {
			someKey: boolean;
		}

		try {
			class TestClass {
				@Property({ required: true })
				nested: NestedClass;
			}
		} catch (err) {
			expect(err).toBeInstanceOf(Error);
			expect(err.message).toBe("Explicit type annotation needed.");
		}
	});
});
