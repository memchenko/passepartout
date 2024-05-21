import { DynamicStructuredTool } from '@langchain/core/tools';
import path from 'node:path';
import * as z from 'zod';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';
import { asLabeledList, asOrderedList } from 'helpers/formatting';
import { goToDefinition as goToDefinitionHelper } from 'services/language';
import { getRootDirectoryTypeToPathDict } from 'helpers/dicts';
import { possibleRootDirectories } from 'helpers/types';

export const goToDefinition = new DynamicStructuredTool({
  name: 'go-to-definition',
  description: 'This tool shows definitions of an identifier giving file path, line number and implementation.',
  schema: z.object({
    rootDirectory: possibleRootDirectories.describe('This parameter is to specify the root folder.'),
    filePath: z.string().startsWith('./').describe('Relative path from one of root folders.'),
    line: z.number().min(0).int().describe('Line on which you encountered the identifier'),
    name: z.string().describe('Name of the identifier you want find references of'),
  }),
  func: async ({ rootDirectory, filePath, line, name }) => {
    try {
      const rootPath = getRootDirectoryTypeToPathDict()[rootDirectory];
      const fullPath = path.resolve(rootPath, filePath);
      const result = goToDefinitionHelper({ filePath: fullPath, line, name }).map((definition) => {
        return asLabeledList(
          [
            ['filePath', 'File path'],
            ['line', 'Line'],
            ['implementation', 'Implementation'],
          ],
          definition,
        );
      });

      return asOrderedList(result);
    } catch (err: unknown) {
      if (isError(err)) {
        return String(err);
      }

      return UNEXPECTED_ERROR_TOOL_TEXT;
    }
  },
});
