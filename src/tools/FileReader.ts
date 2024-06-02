import { DynamicStructuredTool } from '@langchain/core/tools';
import fs from 'node:fs';
import { promisify } from 'node:util';
import * as z from 'zod';

import { possibleSpaces } from 'lib/types';
import { isError } from 'lib/type-guards';
import { getPaths } from 'lib/paths';

const readFileAsync = promisify(fs.readFile);
const lstatAsync = promisify(fs.lstat);

export const fileReader = new DynamicStructuredTool({
  name: 'file-reader',
  description: 'This tool displays full text of a file.',
  schema: z.object({
    filePathSegments: z.array(z.string()).describe('Relative to space folder lodash-style array path.'),
    space: possibleSpaces.describe('This parameter specifies the space in which you want to perform the action.'),
  }),
  func: async ({ filePathSegments, space }) => {
    const { fullPath, relativePath } = getPaths(space, filePathSegments);

    try {
      await lstatAsync(fullPath);

      const result = await readFileAsync(fullPath, {
        encoding: 'utf8',
      });

      return `// Location: ${space}://${relativePath}\n\n${result}`;
    } catch (err) {
      if (isError(err) && err.message.includes('ENOENT: no such file or directory, lstat')) {
        throw new Error(`The file '${relativePath}' doesn't exist in the '${space}' space.`);
      }

      throw new Error(`Couldn't read file '${relativePath}' in the '${space}' space.`);
    }
  },
});
