import { DynamicStructuredTool } from '@langchain/core/tools';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import * as z from 'zod';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';
import { getSpaceTypeToPathDict } from 'helpers/dicts';
import { possibleSpaces } from 'helpers/types';

const mkdirAsync = promisify(fs.mkdir);
const lstatAsync = promisify(fs.lstat);

export const mkdir = new DynamicStructuredTool({
  name: 'mkdir',
  description:
    'This tool is a way to create a folder. Folder can be created inside one of root folders you have access to.',
  schema: z.object({
    directoryPathSegments: z.array(z.string()).describe('Relative to space folder lodash-style array path.'),
    space: possibleSpaces.describe('This parameter specifies the space in which you want to perform the action.'),
  }),
  func: async ({ directoryPathSegments, space }) => {
    const rootPath = getSpaceTypeToPathDict()[space];
    let directoryPath = path.normalize(directoryPathSegments.join('/'));
    directoryPath = directoryPath.startsWith('./') ? directoryPath : `./${directoryPath}`;
    const fullPath = path.join(rootPath, directoryPath);

    if (!fs.existsSync(fullPath)) {
      await mkdirAsync(fullPath, { recursive: true });
    } else {
      return `Folder already exists: ${directoryPath}`;
    }

    return `Folder at ${directoryPath} has been created successfully.`;
  },
});
