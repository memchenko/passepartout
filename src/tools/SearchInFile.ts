import { DynamicStructuredTool } from '@langchain/core/tools';
import path from 'node:path';
import * as z from 'zod';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';
import { searchInFile as searchInFileHelper } from 'services/search/searchInFile';
import { getRootDirectoryTypeToPathDict } from 'helpers/dicts';
import { possibleRootDirectories } from 'helpers/types';

export const searchInFile = new DynamicStructuredTool({
  name: 'search-in-file',
  description: 'This tool performs search by regex pattern in a file.',
  schema: z.object({
    filePath: z.string().startsWith('./').describe('Relative path from one of root folders.'),
    rootDirectory: possibleRootDirectories.describe('This parameter is to specify the root folder.'),
    pattern: z.string(),
  }),
  func: async ({ filePath, pattern, rootDirectory }) => {
    try {
      const rootPath = getRootDirectoryTypeToPathDict()[rootDirectory];
      const fullPath = path.resolve(rootPath, filePath);
      const result = await searchInFileHelper(fullPath, pattern);

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
