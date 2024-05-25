import * as z from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import {
  fileReader,
  mkdir,
  findReferences,
  goToDefinition,
  searchInFolder,
  searchInFile,
  codeRetriever,
  writeMarkdownFile,
  directoryTree,
} from 'tools/index';

export const executorTools = Promise.all([
  fileReader,
  mkdir,
  findReferences,
  goToDefinition,
  searchInFolder,
  searchInFile,
  codeRetriever,
  writeMarkdownFile,
  directoryTree,
]);

const plan = zodToJsonSchema(
  z.object({
    steps: z.array(z.string()).describe('different steps to follow, should be in sorted order'),
  }),
);
export const planFunction = {
  name: 'plan',
  description: 'This tool is used to plan the steps to follow',
  parameters: plan,
};

export const reflectorTools = [fileReader, directoryTree, searchInFolder, searchInFile, codeRetriever];
