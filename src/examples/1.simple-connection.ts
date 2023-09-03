import { MatchBuilder } from "~/builders/match/match.builder";
import { DataSource, type DataSourceOptions } from "~/data-source/data-source";
import { Node } from "~/decorators/node";
import { Property } from "~/decorators/property";
import { NodeManager } from "~/node-manager/node-manager";
import { store } from "~/utils/store";

const options = {
	scheme: "neo4j",
	host: "localhost",
	port: 7687,
	username: "neo4j",
	password: "password",
	database: "neo4j",
} as DataSourceOptions;

class A {}

@Node()
class TestNode {
	@Property()
	prop: string;
}

(async () => {
	const dataSource = new DataSource(options);
	await dataSource.initialize();

	const nodeManager = new NodeManager(dataSource);
	await nodeManager.save({ prop: "test" }, { node: TestNode });
	await nodeManager.save({ prop: "test2" }, { node: TestNode });
	await nodeManager.save({ prop: "test3" }, { node: TestNode });

	const result = await nodeManager.find({ node: TestNode });
	console.log(result.records.map((record) => record.get("r").properties));

	await dataSource.write(`MATCH (a:${TestNode.name}) DELETE a;`);

	await dataSource.destroy();
})();
