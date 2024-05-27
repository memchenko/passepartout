import { DynamicStructuredTool } from '@langchain/core/tools';
import path from 'node:path';
import fs from 'node:fs';
import treeCli from 'tree-cli';
import * as z from 'zod';
import { promisify } from 'node:util';

import { isError } from 'helpers/type-guards';
import { getSpaceTypeToPathDict } from 'helpers/dicts';
import { possibleSpaces } from 'helpers/types';

const lstatAsync = promisify(fs.lstat);

export const directoryTree = new DynamicStructuredTool({
  name: 'directory-tree',
  description:
    'This tool lists files inside a directory. Prefer to use this tool in the first place to get initial insights.',
  schema: z.object({
    directoryPathSegments: z.array(z.string()).describe('Relative to space folder lodash-style array path.'),
    space: possibleSpaces.describe('This parameter specifies the space in which you want to perform the action.'),
  }),
  func: async ({ directoryPathSegments, space }) => {
    const rootPath = getSpaceTypeToPathDict()[space];
    let directoryPath = path.normalize(directoryPathSegments.join('/'));
    directoryPath = directoryPath.startsWith('./') ? directoryPath : `./${directoryPath}`;
    const fullPath = path.resolve(rootPath, directoryPath);

    try {
      await lstatAsync(fullPath);

      const result = await treeCli({
        base: fullPath,
        l: 5,
      });

      return result.report;
    } catch (err) {
      if (isError(err) && err.message.includes('ENOENT: no such file or directory, lstat')) {
        throw new Error(`The file '${directoryPath}' doesn't exist in the '${space}' space.`);
      }

      throw new Error(`Couldn't create directory tree of '${directoryPath}' in the '${space}' space.`);
    }
  },
});
