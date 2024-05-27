import { DynamicStructuredTool } from '@langchain/core/tools';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import * as z from 'zod';
import Diff from 'diff';

import { getSpaceTypeToPathDict } from 'helpers/dicts';
import { possibleSpaces } from 'helpers/types';
import { isError } from 'helpers/type-guards';

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const lstatAsync = promisify(fs.lstat);

export const updateFile = new DynamicStructuredTool({
  name: 'update-file',
  description: 'This tool is the way to update a file. Specify your updates in unified diff format patch.',
  schema: z.object({
    patch: z.string().describe('Unified diff format patch.'),
    filePathSegments: z
      .array(z.string())
      .describe('Relative to space folder lodash-style array path to the file you want to update.'),
    space: possibleSpaces.describe('The space in which the file is located.'),
  }),
  func: async ({ filePathSegments, space, patch }) => {
    const rootPath = getSpaceTypeToPathDict()[space];
    let filePath = path.normalize(filePathSegments.join('/'));
    filePath = filePath.startsWith('./') ? filePath : `./${filePath}`;
    const fullPath = path.join(rootPath, filePath);

    try {
      await lstatAsync(fullPath);

      const fileContent = await readFileAsync(fullPath, 'utf-8');
      const patchedFileContent = Diff.applyPatch(fileContent, patch);

      if (!patchedFileContent) {
        throw new Error();
      }

      await writeFileAsync(fullPath, patchedFileContent, {
        encoding: 'utf-8',
        flag: 'w',
      });

      return `File '${filePath}' updated successfully in the space '${space}'.`;
    } catch (err) {
      if (isError(err)) {
        if (err.message.includes('ENOENT: no such file or directory, lstat')) {
          throw new Error(`The file '${filePath}' doesn't exist in the '${space}' space.`);
        }
      }

      throw new Error(`Couldn't apply diff patch to the file '${filePath}' in the '${space}' space.`);
    }
  },
});
