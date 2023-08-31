import { QueryResult, type Driver } from "neo4j-driver";
import { createDriver } from "./driver";
import { type Neo4jConfig } from "~/types";
import { SessionManager } from "./session-manager";

export interface DataSourceOptions extends Neo4jConfig {}

export enum Session {
	READ,
	WRITE,
}

/**
 * DataSource is a pre-defined connection configuration to a specific database.
 * You can have multiple data sources connected (with multiple connections in it),
 * connected to multiple databases in your application.
 */
export class DataSource {
	readonly "@instanceof" = Symbol.for(DataSource.name);

	// -------------------------------------------------------------------------
	// Public Properties
	// -------------------------------------------------------------------------

	/**
	 * Connection options.
	 */
	readonly options: DataSourceOptions;

	/**
	 * Indicates if DataSource is initialized or not.
	 */
	isInitialized: boolean;

	/**
	 * Database driver used by this connection.
	 */
	readonly driver: Driver;

	/**
	 * TODO: Connection options.
	 */
	// readonly options: DataSourceOptions;

	/**
	 * Session manager for read and write operations.
	 */
	readonly sessionManager: SessionManager;

	constructor(options: DataSourceOptions) {
		this.options = options;
		this.isInitialized = false;
		this.driver = createDriver(options);
		this.sessionManager = new SessionManager(this.driver, options.database);

		// this.logger = new LoggerFactory().create(
		// 	this.options.logger,
		// 	this.options.logging
		// );
		// this.driver = new DriverFactory().create(this);
		// this.manager = this.createEntityManager();
		// this.namingStrategy = options.namingStrategy || new DefaultNamingStrategy();
		// this.metadataTableName = options.metadataTableName || "typeorm_metadata";
		// this.queryResultCache = options.cache
		// 	? new QueryResultCacheFactory(this).create()
		// 	: undefined;
		// this.relationLoader = new RelationLoader(this);
		// this.relationIdLoader = new RelationIdLoader(this);
	}

	// -------------------------------------------------------------------------
	// Public Methods
	// -------------------------------------------------------------------------
	/**
	 * Performs connection to the database.
	 * This method should be called once on application bootstrap.
	 * This method not necessarily creates database connection (depend on database type),
	 * but it also can setup a connection pool with database to use.
	 */
	async initialize(): Promise<this> {
		// if (this.isInitialized)
		// 	throw new CannotConnectAlreadyConnectedError(this.name);

		// verify the connection details or throw an Error
		await this.driver.getServerInfo();

		// build all metadatas registered in the current connection
		// await this.buildMetadatas();

		this.isInitialized = true;

		return this;
	}

	/**
	 * Closes connection with the database.
	 * Once connection is closed, you cannot use repositories or perform any operations except opening connection again.
	 */
	async destroy(): Promise<void> {
		await this.driver.close();
		this.isInitialized = false;
	}

	/**
	 * query
	 *
	 * Executes raw cypher query and returns raw database results.
	 *
	 * @param {string} cypher - The cypher expression.
	 * @param {Record<string, any>} parameters? - The parameters required for the cypher.
	 * @param {Session} session? - Either READ or WRITE session.
	 * @returns {Promise<QueryResult<T>>}
	 */
	async query<T = any>(
		cypher: string,
		parameters?: Record<string, any>,
		session: Session = Session.READ
	): Promise<QueryResult<T>> {
		if (session === Session.READ) return this.read(cypher, parameters);
		return this.write(cypher, parameters);
	}

	/**
	 * read
	 *
	 * Executes raw read query and returns raw database results.
	 *
	 * @param {string} cypher - The cypher expression.
	 * @param {Record<string, any>} parameters? - The parameters required for the cypher.
	 * @returns {Promise<QueryResult<T>>}
	 */
	async read<T = any>(
		cypher: string,
		parameters?: Record<string, any>
	): Promise<QueryResult<T>> {
		return this.sessionManager.read(cypher, parameters);
	}

	/**
	 * write
	 *
	 * Executes raw write query and returns raw database results.
	 *
	 * @param {string} cypher - The cypher expression.
	 * @param {Record<string, any>} parameters? - The parameters required for the cypher.
	 * @returns {Promise<QueryResult<T>>}
	 */
	async write<T = any>(
		cypher: string,
		parameters?: Record<string, any>
	): Promise<QueryResult<T>> {
		return this.sessionManager.write(cypher, parameters);
	}
}
