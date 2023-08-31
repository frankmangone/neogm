import { Session, session, Result, type Driver } from "neo4j-driver";

export class SessionManager {
	#driver: Driver;
	#database: string;

	constructor(driver: Driver, database: string) {
		this.#driver = driver;
		this.#database = database;
	}

	async read(cypher: string, params: Record<string, any>): Promise<Result> {
		const session = this.#getReadSession();
		return session.run(cypher, params);
	}

	async write(cypher: string, params: Record<string, any>): Promise<Result> {
		const session = this.#getWriteSession();
		return session.run(cypher, params);
	}

	#getReadSession(): Session {
		return this.#driver.session({
			database: this.#database,
			defaultAccessMode: session.READ,
		});
	}

	#getWriteSession(): Session {
		return this.#driver.session({
			database: this.#database,
			defaultAccessMode: session.WRITE,
		});
	}
}
