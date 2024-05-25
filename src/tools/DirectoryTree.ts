import { DynamicStructuredTool } from '@langchain/core/tools';
import path from 'node:path';
import treeCli from 'tree-cli';
import * as z from 'zod';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';
import { getSpaceTypeToPathDict } from 'helpers/dicts';
import { possibleSpaces } from 'helpers/types';

export const directoryTree = new DynamicStructuredTool({
  name: 'directory-tree',
  description:
    'This tool lists files inside a directory. Prefer to use this tool in the first place to get initial insights.',
  schema: z.object({
    directoryPath: z.string().default('./').describe('Relative path inside one of spaces.'),
    space: possibleSpaces.describe('This parameter specifies the space in which you want to perform the action.'),
  }),
  func: async ({ directoryPath, space }) => {
    try {
      const rootPath = getSpaceTypeToPathDict()[space];
      const fullPath = path.resolve(rootPath, directoryPath);

      const result = await treeCli({
        base: fullPath,
        l: 5,
      });

      return result.report;
    } catch (err: unknown) {
      if (isError(err)) {
        return String(err);
      }

      return UNEXPECTED_ERROR_TOOL_TEXT;
    }
  },
});
