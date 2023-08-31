// import { OPERATION_TYPES } from '../constants';
// import { OperationBuilder } from './operation.builder';
// import { Decimal } from 'decimal.js';
// import { UnprocessableEntityException } from '@nestjs/common';
import { DIRECTIONS } from "~/builders/connection/interfaces";
import { MatchBuilder } from "~/builders/match.builder";

// const MOCK_FOUND_ID = 1;

// const mockConnection = {
//   createQueryRunner: () => ({
//     manager: {
//       create: (_: unknown, data: any | any[]) => data,
//       save: (_: unknown, data: any | any[]) => {
//         if (Array.isArray(data)) {
//           return data.map((d, id) => ({ ...d, id }));
//         }

//         return { ...data, id: 1 };
//       },
//       findOne: () => ({ id: MOCK_FOUND_ID }),
//     },
//     connect: () => undefined,
//     startTransaction: () => undefined,
//     commitTransaction: () => undefined,
//     rollbackTransaction: () => undefined,
//     release: () => undefined,
//   }),
// } as any;

const tag = "node";
const label = "Node";
const fields = {
	firstName: "Frank",
	lastName: "TheTank",
};
const [firstName, lastName] = Object.keys(fields);
const connectionLabel = "SOME_LABEL";

describe("MatchBuilder", () => {
	let builder: MatchBuilder;

	beforeEach(() => {
		builder = new MatchBuilder();
	});

	describe("Method: constructor", () => {
		it("Produces a correct cypher when only constructor is invoked", () => {
			builder = new MatchBuilder();
			expect(builder.cypher).toEqual("MATCH ()");
		});

		it("Produces a correct cypher when constructor is called with just a tag", () => {
			builder = new MatchBuilder({ tag });
			expect(builder.cypher).toEqual(`MATCH (${tag})`);
		});

		it("Produces a correct cypher when constructor is called with just a label", () => {
			builder = new MatchBuilder({ label });
			expect(builder.cypher).toEqual(`MATCH (:${label})`);
		});

		it("Produces a correct cypher when constructor is called with just fields", () => {
			builder = new MatchBuilder({ fields });
			expect(builder.cypher).toEqual(
				`MATCH ({${firstName}: $${firstName}, ${lastName}: $${lastName}})`
			);
		});

		it("Produces a correct cypher when constructor is called with tag and label", () => {
			builder = new MatchBuilder({ tag, label });
			expect(builder.cypher).toEqual(`MATCH (${tag}:${label})`);
		});

		it("Produces a correct cypher when constructor is called with tag, label, and fields", () => {
			builder = new MatchBuilder({ tag, label, fields });
			expect(builder.cypher).toEqual(
				`MATCH (${tag}:${label} {${firstName}: $${firstName}, ${lastName}: $${lastName}})`
			);
		});
	});

	describe("Method: addConnection", () => {
		it("Produces a correct cypher when only an edge label is used.", () => {
			builder = new MatchBuilder({ tag });
			builder.addConnection({
				sourceNode: {
					tag,
				},
				edge: {
					label: connectionLabel,
					direction: DIRECTIONS.OUTGOING,
				},
			});
			expect(builder.cypher).toEqual("MATCH (node),\n(node)-[:SOME_LABEL]->()");
		});
	});
});
