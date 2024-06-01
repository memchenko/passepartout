import * as z from 'zod';

export const KNOWLEDGE_SPACE: Space = 'knowledge';
export const WORKSPACE_SPACE: Space = 'workspace';

export const possibleSpaces = z.enum([WORKSPACE_SPACE, KNOWLEDGE_SPACE]);
export const urlSchema = z.union([z.string().startsWith(`http://`), z.string().startsWith('https://')]);
export const knowledgeSpacePathSchema = z.string().startsWith(`${KNOWLEDGE_SPACE}://`);
export const workspaceSpacePathSchema = z.string().startsWith(`${WORKSPACE_SPACE}://`);

export type PossibleSpaces = z.infer<typeof possibleSpaces>;

export type AllKeys<T> = T extends any ? keyof T : never;
export type PickType<T, K extends AllKeys<T>> = T extends { [k in K]?: any } ? T[K] : undefined;
export type PickTypeOf<T, K extends string | number | symbol> = K extends AllKeys<T> ? PickType<T, K> : never;
export type Merge<T extends object> = {
  [K in AllKeys<T>]: PickTypeOf<T, K>;
};
