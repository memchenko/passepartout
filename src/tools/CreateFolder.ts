import { DynamicStructuredTool } from '@langchain/core/tools';
import fs from 'node:fs';
import { promisify } from 'node:util';
import * as z from 'zod';

import { possibleSpaces } from 'helpers/types';
import { getPaths } from 'helpers/paths';

const mkdirAsync = promisify(fs.mkdir);

export const mkdir = new DynamicStructuredTool({
  name: 'mkdir',
  description:
    'This tool is a way to create a folder. Folder can be created inside one of root folders you have access to.',
  schema: z.object({
    directoryPathSegments: z.array(z.string()).describe('Relative to space folder lodash-style array path.'),
    space: possibleSpaces.describe('This parameter specifies the space in which you want to perform the action.'),
  }),
  func: async ({ directoryPathSegments, space }) => {
    const { fullPath, relativePath } = getPaths(space, directoryPathSegments);

    if (!fs.existsSync(fullPath)) {
      await mkdirAsync(fullPath, { recursive: true });
    } else {
      return `Folder already exists: ${relativePath}`;
    }

    return `Folder at ${relativePath} has been created successfully.`;
  },
});
