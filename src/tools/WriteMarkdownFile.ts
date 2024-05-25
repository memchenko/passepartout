import { DynamicStructuredTool } from '@langchain/core/tools';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import * as z from 'zod';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';
import { getSpaceTypeToPathDict } from 'helpers/dicts';

const writeFileAsync = promisify(fs.writeFile);

export const writeMarkdownFile = new DynamicStructuredTool({
  name: 'write-markdown-file',
  description:
    'This tool is the way to create a markdown file or override existing one. Specify file name without extension.',
  schema: z.object({
    filePath: z.string().default('./').describe('Relative path from root folder. Should start from `./`.'),
    fileName: z.string().describe('Name of the file without extension.'),
    content: z.string().describe('Markdown content.'),
  }),
  func: async ({ filePath, fileName, content }) => {
    try {
      const rootPath = getSpaceTypeToPathDict().result;
      const fullPath = path.join(rootPath, filePath, `${fileName}.md`);

      await writeFileAsync(fullPath, content, {
        encoding: 'utf-8',
        flag: 'w',
      });

      return `File written successfully: ${fullPath}`;
    } catch (err: unknown) {
      if (isError(err)) {
        return String(err);
      }

      return UNEXPECTED_ERROR_TOOL_TEXT;
    }
  },
});
