import { DynamicStructuredTool } from '@langchain/core/tools';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import * as z from 'zod';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';
import { getRootDirectoryTypeToPathDict } from 'helpers/dicts';
import { possibleRootDirectories } from 'helpers/types';

const readdirAsync = promisify(fs.readdir);

export const directoryReader = new DynamicStructuredTool({
  name: 'directory-reader',
  description: 'This tool lists files inside a directory.',
  schema: z.object({
    directoryPath: z.string().startsWith('./').describe('Relative path from one of root folders.'),
    rootDirectory: possibleRootDirectories.describe('This parameter is to specify the root folder.'),
  }),
  func: async ({ directoryPath, rootDirectory }) => {
    try {
      const rootPath = getRootDirectoryTypeToPathDict()[rootDirectory];
      const fullPath = path.resolve(rootPath, directoryPath);
      const result = await readdirAsync(fullPath);

      console.log('READING', fullPath);

      return result.join('\n');
    } catch (err: unknown) {
      if (isError(err)) {
        return String(err);
      }

      return UNEXPECTED_ERROR_TOOL_TEXT;
    }
  },
});
