import {
	DataSource,
	type DataSourceOptions,
} from "../../src/data-source/data-source"; // Replace with the correct path

const dataSourceOptions: DataSourceOptions = {
	scheme: "neo4j",
	host: "localhost",
	port: 7687,
	username: "neo4j",
	password: "password",
	database: "neo4j",
};

/**
 * In order to run this test, you need a running instance of Neo4j
 */
describe(DataSource.name, () => {
	it("should instantiate with given options", () => {
		const dataSource = new DataSource(dataSourceOptions);

		expect(dataSource.options).toBe(dataSourceOptions);
		expect(dataSource.isInitialized).toBe(false);
	});

	it("should initialize the data source", async () => {
		const dataSource = new DataSource(dataSourceOptions);
		await dataSource.initialize();
		expect(dataSource.isInitialized).toBe(true);
		await dataSource.destroy();
	});

	it("should throw error on failed initialization", async () => {
		const dataSource = new DataSource({ ...dataSourceOptions, port: 0 });
		expect.assertions(1);

		try {
			await dataSource.initialize();
		} catch (err) {
			expect(err).toBeInstanceOf(Error);
		}
	});
});
