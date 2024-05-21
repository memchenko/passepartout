import { DynamicStructuredTool } from '@langchain/core/tools';
import path from 'node:path';
import * as z from 'zod';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';
import { searchInFolder as searchInFolderHelper } from 'services/search/searchInFolder';
import { getRootDirectoryTypeToPathDict } from 'helpers/dicts';
import { possibleRootDirectories } from 'helpers/types';

export const searchInFolder = new DynamicStructuredTool({
  name: 'search-folder',
  description: 'This tool performs search by regex pattern within a folder.',
  schema: z.object({
    directoryPath: z.string().startsWith('./').describe('Relative path from one of root folders.'),
    rootDirectory: possibleRootDirectories.describe('This parameter is to specify the root folder.'),
    pattern: z.string(),
  }),
  func: async ({ rootDirectory, pattern, directoryPath }) => {
    try {
      const rootPath = getRootDirectoryTypeToPathDict()[rootDirectory];
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
