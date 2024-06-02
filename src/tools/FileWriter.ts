import { DynamicStructuredTool } from '@langchain/core/tools';
import fs from 'node:fs';
import { promisify } from 'node:util';
import * as z from 'zod';

import { possibleSpaces } from 'lib/types';
import { isError } from 'lib/type-guards';
import { getPaths } from 'lib/paths';

const writeFileAsync = promisify(fs.writeFile);

export const writeFile = new DynamicStructuredTool({
  name: 'write-file',
  description: 'This tool is the way to create a file. Whenever you need to create a file from scratch use this tool.',
  schema: z.object({
    filePathSegments: z.array(z.string()).describe('Relative to space folder lodash-style array path.'),
    space: possibleSpaces,
    fileName: z.string().describe('Name of the file without extension.'),
    extension: z.string().describe('Extension of the file you want to write.'),
    content: z.string().describe('Content of the file.'),
  }),
  func: async ({ filePathSegments, space, fileName, extension, content }) => {
    const { fullPath, relativePath } = getPaths(space, [...filePathSegments, `${fileName}.${extension}`]);

    try {
      await writeFileAsync(fullPath, content, {
        encoding: 'utf-8',
        flag: 'w',
      });

      return `File '${relativePath}' successfully written in the '${space}' space.`;
    } catch (err) {
      if (isError(err)) {
        throw err;
      }

      throw new Error(`Couldn't write file '${relativePath}' in the '${space}' space.`);
    }
  },
});
