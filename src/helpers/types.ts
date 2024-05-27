import * as z from 'zod';

export const PROJECT_SPACE = 'project';
export const RESULT_SPACE = 'result';

export const possibleSpaces = z.enum([RESULT_SPACE, PROJECT_SPACE]);

export type PossibleSpaces = z.infer<typeof possibleSpaces>;
