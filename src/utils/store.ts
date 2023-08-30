interface NodeField {
	name: string;
	type: string;
	required?: boolean;
	array?: boolean;
}

export interface NodeData {
	fields: NodeField[];
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
