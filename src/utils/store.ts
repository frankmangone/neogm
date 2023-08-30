export interface PropertyData {
	propertyName: string;
	type: "number" | "string" | "boolean" | object;
	customName?: string;
	required?: boolean;
	array?: boolean;
}

export interface NodeData {
	fields: PropertyData[];
}

class Store {
	nodes: NodeData[] = [];

	/**
	 * addNode
	 *
	 * Adds a node to the list of discovered node types.
	 */
	public addNode(data: NodeData): void {
		this.nodes.push(data);
	}
}

export const store: Store = new Store();
