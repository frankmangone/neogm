/**
 * Same as Partial<T> but goes deeper and makes all nested objects be Partial<T>
 * as well.
 */
export type DeepPartial<T> =
	| T
	| (T extends Array<infer U>
			? DeepPartial<U>[]
			: T extends Map<infer K, infer V>
			? Map<DeepPartial<K>, DeepPartial<V>>
			: T extends Set<infer M>
			? Set<DeepPartial<M>>
			: T extends object
			? { [K in keyof T]?: DeepPartial<T[K]> }
			: T);

export type ObjectLiteral = Record<string, any>;

export type ClassConstructor<T = any> = new (...args: any[]) => T;
export type Node<T = any> = ClassConstructor<T>;
