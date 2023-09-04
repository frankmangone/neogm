import { ASC, DESC } from "./constants";

export enum Order {
	ASC = "ASC",
	DESC = "DESC",
}

export type OrderByParams = {
	property: string;
	order?: typeof ASC | typeof DESC;
};
