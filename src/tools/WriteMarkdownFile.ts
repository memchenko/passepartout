import { DynamicStructuredTool } from '@langchain/core/tools';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import * as z from 'zod';

import { getSpaceTypeToPathDict } from 'helpers/dicts';
import { possibleSpaces } from 'helpers/types';

const writeFileAsync = promisify(fs.writeFile);

export const writeMarkdownFile = new DynamicStructuredTool({
  name: 'write-markdown-file',
  description:
    'This tool is the way to create a markdown file or override existing one. Specify file name without extension.',
  schema: z.object({
    filePathSegments: z.array(z.string()).describe('Relative lodash-style array path from space folder.'),
    space: possibleSpaces,
    fileName: z.string().describe('Name of the file without extension.'),
    extension: z.string().describe('Extension of the file you want to write.'),
    content: z.string().describe('Content of the file.'),
  }),
  func: async ({ filePathSegments, space, fileName, extension, content }) => {
    const rootPath = getSpaceTypeToPathDict()[space];
    const fullPath = path.join(rootPath, filePathSegments.join('/'), `${fileName}.${extension}`);

    await writeFileAsync(fullPath, content, {
      encoding: 'utf-8',
      flag: 'w',
    });

    return `File written successfully: ${fullPath}`;
  },
});
