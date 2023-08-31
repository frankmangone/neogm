export type Query<T> = Partial<Record<keyof T, T[keyof T]>>;
