import { DynamicStructuredTool } from '@langchain/core/tools';
import path from 'node:path';
import * as z from 'zod';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';
import { asLabeledList, asOrderedList } from 'helpers/formatting';
import { goToDefinition as goToDefinitionHelper } from 'services/language';
import { getSpaceTypeToPathDict } from 'helpers/dicts';

export const goToDefinition = new DynamicStructuredTool({
  name: 'go-to-definition',
  description: 'This tool shows definitions of an identifier in the user application space.',
  schema: z.object({
    filePath: z.string().default('./').describe('Relative path inside one of spaces.'),
    line: z.number().min(0).int().describe('Line on which you encountered the identifier'),
    name: z.string().describe('Name of the identifier you want find references of'),
  }),
  func: async ({ filePath, line, name }) => {
    try {
      const rootPath = getSpaceTypeToPathDict().application;
      const fullPath = path.resolve(rootPath, filePath);
      const result = goToDefinitionHelper({ filePath: fullPath, line, name }).map((definition) => {
        return asLabeledList(
          [
            ['filePath', 'File path'],
            ['line', 'Line'],
            ['implementation', 'Implementation'],
          ],
          {
            ...definition,
            filePath: fullPath.replace(process.env.APP_PATH, 'application://'),
          },
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
