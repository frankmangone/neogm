import { ASC, DESC } from "./constants";

export type OrderByParams = {
	property: string;
	order?: typeof ASC | typeof DESC;
};
