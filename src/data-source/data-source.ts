import { type Driver } from "neo4j-driver";
import { createDriver } from "./driver";

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
	driver: Driver;

	/**
	 * TODO: Connection options.
	 */
	// readonly options: DataSourceOptions;

	/**
	 * TODO: EntityManager of this connection.
	 */
	//readonly manager: EntityManager;

	constructor(options: DataSourceOptions) {
		this.options = options;
		this.isInitialized = false;
		this.driver = createDriver(options);

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
		// TODO:
		this.isInitialized = false;
	}

	/**
	 * Executes raw cypher query and returns raw database results.
	 */
	async query<T = any>(
		query: string,
		parameters?: any[]
		// queryRunner?: QueryRunner
	): Promise<T> {
		return;
		// TODO:
		// if (InstanceChecker.isMongoEntityManager(this.manager))
		// 	throw new TypeORMError(`Queries aren't supported by MongoDB.`);
		// if (queryRunner && queryRunner.isReleased)
		// 	throw new QueryRunnerProviderAlreadyReleasedError();
		// const usedQueryRunner = queryRunner || this.createQueryRunner();
		// try {
		// 	return await usedQueryRunner.query(query, parameters); // await is needed here because we are using finally
		// } finally {
		// 	if (!queryRunner) await usedQueryRunner.release();
		// }
	}

	/**
	 * TODO: Gets repository for the given entity.
	 */
	// getRepository<Entity extends ObjectLiteral>(
	// 	target: EntityTarget<Entity>
	// ): Repository<Entity> {
	// 	return this.manager.getRepository(target);
	// }
}
