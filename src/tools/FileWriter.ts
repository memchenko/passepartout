import { DynamicStructuredTool } from '@langchain/core/tools';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import * as z from 'zod';

import { getSpaceTypeToPathDict } from 'helpers/dicts';
import { possibleSpaces } from 'helpers/types';
import { isError } from 'helpers/type-guards';

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
    const rootPath = getSpaceTypeToPathDict()[space];
    let filePath = path.normalize(`${filePathSegments.join('/')}/${fileName}.${extension}`);
    filePath = filePath.startsWith('./') ? filePath : `./${filePath}`;
    const fullPath = path.join(rootPath, filePath);

    try {
      await writeFileAsync(fullPath, content, {
        encoding: 'utf-8',
        flag: 'w',
      });

      return `File '${filePath}' successfully written in the '${space}' space.`;
    } catch (err) {
      if (isError(err)) {
        throw err;
      }

      throw new Error(`Couldn't write file '${filePath}' in the '${space}' space.`);
    }
  },
});
