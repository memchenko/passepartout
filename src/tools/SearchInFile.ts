import { DynamicStructuredTool } from '@langchain/core/tools';
import path from 'node:path';
import * as z from 'zod';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';
import { searchInFile as searchInFileHelper } from 'services/search/searchInFile';
import { getSpaceTypeToPathDict } from 'helpers/dicts';

const description = `This tool performs search by regex pattern in a specific file
inside the user application space. Use it when you need to find some specific
substring that you know is presented in the specific file.`;

export const searchInFile = new DynamicStructuredTool({
  name: 'search-in-file',
  description,
  schema: z.object({
    filePath: z.string().default('./').describe('Relative path inside of the application space.'),
    pattern: z.string().describe('Regex pattern to pass into JavaScript RegExp constructor.'),
  }),
  func: async ({ filePath, pattern }) => {
    try {
      const rootPath = getSpaceTypeToPathDict().application;
      const fullPath = path.resolve(rootPath, filePath);
      const result = await searchInFileHelper(fullPath, pattern);

      if (result.length === 0) {
        return "Haven't found any occurence";
      }

      return result.map(({ filePath, line }) => `application://${filePath}:${line}`).join('\n');
    } catch (err: unknown) {
      if (isError(err)) {
        return String(err);
      }

      return UNEXPECTED_ERROR_TOOL_TEXT;
    }
  },
});
