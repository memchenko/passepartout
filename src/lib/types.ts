import * as z from 'zod';
import { possibleSpaces } from './schemas';

export type PossibleSpaces = z.infer<typeof possibleSpaces>;

export type AllKeys<T> = T extends any ? keyof T : never;
export type PickType<T, K extends AllKeys<T>> = T extends { [k in K]?: any } ? T[K] : undefined;
export type PickTypeOf<T, K extends string | number | symbol> = K extends AllKeys<T> ? PickType<T, K> : never;
export type Merge<T extends object> = {
  [K in AllKeys<T>]: PickTypeOf<T, K>;
};
