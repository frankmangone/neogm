import { DataSource, type DataSourceOptions } from "~/data-source/data-source";
import { Node } from "~/decorators/node/node";
import { store } from "~/tools/store";

const options = {
	scheme: "neo4j",
	host: "localhost",
	port: 7687,
	username: "neo4j",
	password: "password",
	database: "neo4j",
} as DataSourceOptions;

@Node()
class Test {}

(async () => {
	const dataSource = new DataSource(options);
	await dataSource.initialize();
	console.log(store);
	await dataSource.destroy();
})();
