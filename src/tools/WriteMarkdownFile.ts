import { DynamicStructuredTool } from '@langchain/core/tools';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import * as z from 'zod';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';
import { getRootDirectoryTypeToPathDict } from 'helpers/dicts';

const writeFileAsync = promisify(fs.writeFile);

export const writeMarkdownFile = new DynamicStructuredTool({
  name: 'write-markdown-file',
  description:
    'This tool is the way to create a markdown file or update existing one. Can act in 2 modes: appending and overriding. Specify file name without extension.',
  schema: z.object({
    filePath: z.string().startsWith('./').describe('Relative path from root folder.'),
    fileName: z.string().describe('Name of file without extension.'),
    content: z.string().describe('Markdown content.'),
    isOverrideMode: z.boolean().optional().describe('Whether override content if file exist or not.'),
  }),
  func: async ({ filePath, fileName, content, isOverrideMode }) => {
    try {
      const rootPath = getRootDirectoryTypeToPathDict().result;
      const fullPath = path.join(rootPath, filePath, `${fileName}.md`);

      await writeFileAsync(fullPath, content, {
        encoding: 'utf-8',
        flag: isOverrideMode ? 'w' : 'a',
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
