import { ConnectionBuilder } from "../connection";
import { CreateBuilder } from "../create/create.builder";
import { MatchBuilder } from "../match";
import { OrderByBuilder } from "../order-by";
import { ReturnBuilder } from "../return";
import { WhereBuilder } from "../where";
import { CYPHER_BLOCKS } from "./interfaces";

const BLOCK_BUILDERS = {
	[CYPHER_BLOCKS.MATCH]: MatchBuilder,
	[CYPHER_BLOCKS.CREATE]: CreateBuilder,
	[CYPHER_BLOCKS.WHERE]: WhereBuilder,
	[CYPHER_BLOCKS.CONNECTION]: ConnectionBuilder,
	[CYPHER_BLOCKS.RETURN]: ReturnBuilder,
	[CYPHER_BLOCKS.ORDER_BY]: OrderByBuilder,
};

interface BlockBuilderMap {
	[CYPHER_BLOCKS.MATCH]: MatchBuilder;
	[CYPHER_BLOCKS.CREATE]: CreateBuilder;
	[CYPHER_BLOCKS.WHERE]: WhereBuilder;
	[CYPHER_BLOCKS.CONNECTION]: ConnectionBuilder;
	[CYPHER_BLOCKS.RETURN]: ReturnBuilder;
	[CYPHER_BLOCKS.ORDER_BY]: OrderByBuilder;
}

export type BlockBuilder = BlockBuilderMap[keyof BlockBuilderMap];

export const blockBuilderFactory = <T extends keyof BlockBuilderMap>(
	type: T
): BlockBuilderMap[T] => {
	let builder = BLOCK_BUILDERS[type];

	if (!builder) {
		throw new Error("Unknown cypher block type.");
	}

	return new builder() as BlockBuilderMap[T];
};
