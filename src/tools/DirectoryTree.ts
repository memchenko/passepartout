import { DynamicStructuredTool } from '@langchain/core/tools';
import fs from 'node:fs';
import treeCli from 'tree-cli';
import * as z from 'zod';
import { promisify } from 'node:util';

import { isError } from 'lib/type-guards';
import { possibleSpaces } from 'lib/schemas';
import { getPaths } from 'lib/paths';

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
    const { fullPath, relativePath } = getPaths(space, directoryPathSegments);

    try {
      await lstatAsync(fullPath);

      const result = await treeCli({
        base: fullPath,
        l: 1,
      });
      const lines = result.report.split('\n');
      const folderPath = `/${directoryPathSegments.join('/')}`;
      lines.splice(0, 1, folderPath);

      return lines.join('\n');
    } catch (err) {
      if (isError(err) && err.message.includes('ENOENT: no such file or directory, lstat')) {
        throw new Error(`The file '${relativePath}' doesn't exist in the '${space}' space.`);
      }

      throw new Error(`Couldn't create directory tree of '${relativePath}' in the '${space}' space.`);
    }
  },
});
