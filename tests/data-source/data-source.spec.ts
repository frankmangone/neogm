import { Driver } from "neo4j-driver";
import { DataSource } from "../../src/data-source/data-source"; // Replace with the correct path

// Mocking the neo4j-driver and driver modules for testing purposes
jest.mock("neo4j-driver");
jest.mock("../../src/data-source/driver");

/**
 * In order to run this test, you need a running instance of Neo4j
 */
describe(DataSource.name, () => {
	let dataSourceOptions: DataSourceOptions;

	beforeEach(() => {
		dataSourceOptions = {
			scheme: "neo4j",
			host: "localhost",
			port: 8474,
			username: "neo4j",
			password: "neo4j",
		};

		// Resetting mock implementations (if any)
		(Driver as jest.Mock).mockReset();
	});

	it("should instantiate with given options", () => {
		const dataSource = new DataSource(dataSourceOptions);

		expect(dataSource.options).toBe(dataSourceOptions);
		expect(dataSource.isInitialized).toBe(false);
	});

	it("should initialize the data source", async () => {
		const dataSource = new DataSource(dataSourceOptions);

		// Mocking getServerInfo to simulate successful connection
		(dataSource.driver.getServerInfo as jest.Mock).mockResolvedValueOnce({});

		await dataSource.initialize();

		expect(dataSource.isInitialized).toBe(true);
	});

	it("should throw error on failed initialization", async () => {
		const dataSource = new DataSource(dataSourceOptions);

		// Mocking getServerInfo to simulate connection failure
		(dataSource.driver.getServerInfo as jest.Mock).mockRejectedValueOnce(
			new Error("Connection Error")
		);

		await expect(dataSource.initialize()).rejects.toThrow("Connection Error");
	});
});
