import neo4j, { type Driver } from "neo4j-driver";

export const createDriver = async (config: Neo4jConfig): Promise<Driver> => {
	// Create a Driver instance
	const driver = neo4j.driver(
		`${config.scheme}://${config.host}:${config.port}`,
		neo4j.auth.basic(config.username, config.password)
	);

	// Verify the connection details or throw an Error
	await driver.getServerInfo();

	// If everything is OK, return the driver
	return driver;
};
