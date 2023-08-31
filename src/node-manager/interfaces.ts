import { ClassConstructor, Query } from "~/types";

export interface SaveOptions<T> {
	node: ClassConstructor<T>;
}

export interface FindManyOptions<T> {
	node: ClassConstructor<T>;
	query?: Query<T>;
}
