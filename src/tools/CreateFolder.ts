import { DynamicStructuredTool } from '@langchain/core/tools';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import * as z from 'zod';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';
import { getRootDirectoryTypeToPathDict } from 'helpers/dicts';
import { possibleRootDirectories } from 'helpers/types';

const mkdirAsync = promisify(fs.mkdir);

export const mkdir = new DynamicStructuredTool({
  name: 'mkdir',
  description:
    'This tool is a way to create a folder. Folder can be created inside one of root folders you have access to.',
  schema: z.object({
    directoryPath: z.string().startsWith('./').describe('Relative path from one of root folders.'),
    rootDirectory: possibleRootDirectories.describe('This parameter is to specify the root folder.'),
  }),
  func: async ({ directoryPath, rootDirectory }) => {
    try {
      const rootPath = getRootDirectoryTypeToPathDict()[rootDirectory];
      const fullPath = path.join(rootPath, directoryPath);

      if (!fs.existsSync(fullPath)) {
        await mkdirAsync(fullPath, { recursive: true });
      } else {
        return `Folder already exists: ${directoryPath}`;
      }

      return `Folder at ${directoryPath} has been created successfully.`;
    } catch (err: unknown) {
      if (isError(err)) {
        return String(err);
      }

      return UNEXPECTED_ERROR_TOOL_TEXT;
    }
  },
});
