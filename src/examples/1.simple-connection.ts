import { DataSource, type DataSourceOptions } from "../data-source/data-source";

const options = {
	scheme: "neo4j",
	host: "localhost",
	port: 7687,
	username: "neo4j",
	password: "password",
	database: "neo4j",
} as DataSourceOptions;

(async () => {
	const dataSource = new DataSource(options);
	await dataSource.initialize();
})();
