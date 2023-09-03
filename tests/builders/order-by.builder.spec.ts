import { OrderByBuilder, ASC, DESC, Order } from "~/builders/order-by";

describe("OrderByBuilder", () => {
	let builder: OrderByBuilder;

	beforeEach(() => {
		builder = new OrderByBuilder();
	});

	describe("Method: constructor", () => {
		it("should initialize without any cypher statement", () => {
			expect(builder.cypher).toBeUndefined();
		});
	});

	describe("Method: orderBy", () => {
		it("should allow ordering by a property without specifying ASC or DESC", () => {
			builder.orderBy({ property: "name" }).done();
			expect(builder.cypher).toBe("ORDER BY name");
		});

		it("should allow ordering by a property in ascending order", () => {
			builder.orderBy({ property: "name", order: ASC }).done();
			expect(builder.cypher).toBe("ORDER BY name ASC");
		});

		it("should allow ordering by a property in descending order", () => {
			builder.orderBy({ property: "age", order: DESC }).done();
			expect(builder.cypher).toBe("ORDER BY age DESC");
		});

		it("should allow specifying order using the provided enum `Order`", () => {
			builder.orderBy({ property: "age", order: Order.DESC }).done();
			expect(builder.cypher).toBe("ORDER BY age DESC");
		});

		it("should allow ordering by multiple properties", () => {
			builder
				.orderBy({ property: "name", order: Order.ASC })
				.orderBy({ property: "age", order: Order.DESC })
				.done();
			expect(builder.cypher).toBe("ORDER BY name ASC, age DESC");
		});

		it("should throw an error if no properties are specified to order by", () => {
			expect(() => builder.done()).toThrow(
				"No properties to order by were specified."
			);
		});

		it("should allow multiple calls to orderBy for the same property, taking the last one", () => {
			builder
				.orderBy({ property: "name", order: ASC })
				.orderBy({ property: "name", order: DESC })
				.done();
			expect(builder.cypher).toBe("ORDER BY name DESC");
		});
	});
});
