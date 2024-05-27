import { DynamicStructuredTool } from '@langchain/core/tools';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import * as z from 'zod';

import { getSpaceTypeToPathDict } from 'helpers/dicts';
import { possibleSpaces } from 'helpers/types';
import { isError } from 'helpers/type-guards';

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
    const rootPath = getSpaceTypeToPathDict()[space];
    let filePath = path.normalize(filePathSegments.join('/'));
    filePath = filePath.startsWith('./') ? filePath : `./${filePath}`;

    try {
      const fullPath = path.resolve(rootPath, filePath);

      await lstatAsync(fullPath);

      const result = await readFileAsync(fullPath, {
        encoding: 'utf8',
      });

      return `// Location: ${space}://${filePath}\n\n${result}`;
    } catch (err) {
      if (isError(err) && err.message.includes('ENOENT: no such file or directory, lstat')) {
        throw new Error(`The file '${filePath}' doesn't exist in the '${space}' space.`);
      }

      throw new Error(`Couldn't read file '${filePath}' in the '${space}' space.`);
    }
  },
});
