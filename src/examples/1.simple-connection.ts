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

@Node()
class Test {
	@Property()
	prop: string;

	@Property()
	prop2: number;
}

(async () => {
	const dataSource = new DataSource(options);
	await dataSource.initialize();
	console.log(JSON.stringify(store));
	await dataSource.destroy();
})();
