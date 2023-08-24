import neo4j, { type Driver } from "neo4j-driver";

export const createDriver = (config: Neo4jConfig): Driver => {
	// Create a Driver instance
	const driver = neo4j.driver(
		`${config.scheme}://${config.host}:${config.port}`,
		neo4j.auth.basic(config.username, config.password)
	);

	return driver;
};
