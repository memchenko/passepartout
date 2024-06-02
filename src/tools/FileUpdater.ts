import { DynamicStructuredTool } from '@langchain/core/tools';
import fs from 'node:fs';
import { promisify } from 'node:util';
import * as z from 'zod';
import * as editor from 'actors/editor';
import { possibleSpaces } from 'lib/schemas';
import { isError } from 'lib/type-guards';
import { getPaths } from 'lib/paths';

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const lstatAsync = promisify(fs.lstat);

export const updateFile = new DynamicStructuredTool({
  name: 'update-file',
  description: 'This tool is the way to update a file. Whenever you need to update an existing file prefer this tool.',
  schema: z.object({
    updates: z.string().describe('As detailed as possible list of updates to apply to the file.'),
    filePathSegments: z
      .array(z.string())
      .describe('Relative to space folder lodash-style array path to the file you want to update.'),
    space: possibleSpaces.describe('The space in which the file is located.'),
  }),
  func: async ({ filePathSegments, space, updates }) => {
    const { fullPath, relativePath } = getPaths(space, filePathSegments);

    try {
      await lstatAsync(fullPath);

      const content = await readFileAsync(fullPath, 'utf-8');
      const { response } = await editor.run({ content, updates });

      await writeFileAsync(fullPath, response, {
        encoding: 'utf-8',
        flag: 'w',
      });

      return `
File '${relativePath}' updated successfully in the space '${space}'.
\n\n ## New content of the file is:
\n\`\`\`${response}\`\`\``;
    } catch (err) {
      if (isError(err)) {
        if (err.message.includes('ENOENT: no such file or directory, lstat')) {
          throw new Error(`The file '${relativePath}' doesn't exist in the '${space}' space.`);
        }
      }

      throw new Error(`Couldn't apply updates to the file '${relativePath}' in the '${space}' space.`);
    }
  },
});
