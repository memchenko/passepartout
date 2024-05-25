import { DynamicStructuredTool } from '@langchain/core/tools';
import path from 'node:path';
import * as z from 'zod';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';
import { searchInFolder as searchInFolderHelper } from 'services/search/searchInFolder';
import { getSpaceTypeToPathDict } from 'helpers/dicts';

const description = `
This tool performs search by regex pattern inside the user
application space. Use it when you need to find some specific
substring that you know is presented in the codebase.`;

export const searchInFolder = new DynamicStructuredTool({
  name: 'search-codebase',
  description,
  schema: z.object({
    directoryPath: z.string().default('./').describe('Relative path inside of the application space.'),
    pattern: z.string().describe('Regex pattern to pass into JavaScript RegExp constructor.'),
  }),
  func: async ({ pattern, directoryPath }) => {
    try {
      const rootPath = getSpaceTypeToPathDict().application;
      const fullPath = path.resolve(rootPath, directoryPath);
      const result = await searchInFolderHelper(fullPath, pattern);

      if (result.length === 0) {
        return "Haven't found any occurence";
      }

      return result.map(({ filePath, line }) => `${filePath}:${line}`).join('\n');
    } catch (err: unknown) {
      if (isError(err)) {
        return String(err);
      }

      return UNEXPECTED_ERROR_TOOL_TEXT;
    }
  },
});
