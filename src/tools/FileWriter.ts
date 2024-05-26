import { DynamicStructuredTool } from '@langchain/core/tools';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import * as z from 'zod';

import { getSpaceTypeToPathDict } from 'helpers/dicts';
import { possibleSpaces } from 'helpers/types';

const writeFileAsync = promisify(fs.writeFile);

export const writeFile = new DynamicStructuredTool({
  name: 'write-file',
  description: 'This tool is the way to create a file.',
  schema: z.object({
    filePathSegments: z.array(z.string()).describe('Relative to space folder lodash-style array path.'),
    space: possibleSpaces,
    fileName: z.string().describe('Name of the file without extension.'),
    extension: z.string().describe('Extension of the file you want to write.'),
    content: z.string().describe('Content of the file.'),
  }),
  func: async ({ filePathSegments, space, fileName, extension, content }) => {
    const rootPath = getSpaceTypeToPathDict()[space];
    const filePath = path.normalize(`${filePathSegments.join('/')}/${fileName}.${extension}`);
    const fullPath = path.join(rootPath, filePath);

    await writeFileAsync(fullPath, content, {
      encoding: 'utf-8',
      flag: 'w',
    });

    return `File written successfully: ${fullPath}`;
  },
});
