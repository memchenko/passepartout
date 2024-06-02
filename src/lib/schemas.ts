import * as z from 'zod';
import { WORKSPACE_SPACE, KNOWLEDGE_SPACE } from './constants';

export const possibleSpaces = z.enum([WORKSPACE_SPACE, KNOWLEDGE_SPACE]);
export const urlSchema = z.union([z.string().startsWith(`http://`), z.string().startsWith('https://')]);
export const knowledgeSpacePathSchema = z.string().startsWith(`${KNOWLEDGE_SPACE}://`);
export const workspaceSpacePathSchema = z.string().startsWith(`${WORKSPACE_SPACE}://`);
