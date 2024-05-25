import { DynamicStructuredTool } from '@langchain/core/tools';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import * as z from 'zod';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';
import { getSpaceTypeToPathDict } from 'helpers/dicts';
import { possibleSpaces } from 'helpers/types';

const readFileAsync = promisify(fs.readFile);

export const fileReader = new DynamicStructuredTool({
  name: 'file-reader',
  description: 'This tool displays full text of a file.',
  schema: z.object({
    filePath: z.string().default('./').describe('Relative path inside one of spaces.'),
    space: possibleSpaces.describe('This parameter specifies the space in which you want to perform the action.'),
  }),
  func: async ({ filePath, space }) => {
    try {
      const rootPath = getSpaceTypeToPathDict()[space];
      const fullPath = path.resolve(rootPath, filePath);
      const result = await readFileAsync(fullPath, {
        encoding: 'utf8',
      });

      return `// Location: ${space}://${filePath}\n\n${result}`;
    } catch (err: unknown) {
      if (isError(err)) {
        return String(err);
      }

      return UNEXPECTED_ERROR_TOOL_TEXT;
    }
  },
});
