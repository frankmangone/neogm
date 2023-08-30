import { DataSource, type DataSourceOptions } from "~/data-source/data-source";
import { Node } from "~/decorators/node";
import { Property } from "~/decorators/property";
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
class Test {
	@Property({ type: "string" })
	prop: string[];
}

(async () => {
	const dataSource = new DataSource(options);
	await dataSource.initialize();
	console.log(JSON.stringify(store));
	await dataSource.destroy();
})();
