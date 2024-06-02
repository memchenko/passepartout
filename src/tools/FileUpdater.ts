import { DynamicStructuredTool } from '@langchain/core/tools';
import fs from 'node:fs';
import { promisify } from 'node:util';
import * as z from 'zod';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

import { possibleSpaces } from 'lib/types';
import { isError } from 'lib/type-guards';
import { getPaths } from 'lib/paths';

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const lstatAsync = promisify(fs.lstat);

const llm = new ChatOpenAI({
  temperature: 0.1,
  apiKey: process.env.API_KEY,
  model: 'gpt-4o',
});

const chain = ChatPromptTemplate.fromTemplate(
  `
You're an assistant which updates files. Given a list of updates and
the original content of the file you have to apply these updates 
carefull to the content, followin the instructions exactly as given
without any improvisations, and respond with new, updated content
which then will be used to override the file. Given that your response
will be written to the file without any review please avoid any irrelevant
texts in your response.

## Example original file content:
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in
libero purus. Proin eleifend tincidunt metus, at suscipit lorem
sagittis sed.

## Example updates list:
Replace 'Lorem ipsum' with 'This is example change'. And remove 
'Nullam in libero purus' sentence.

## Your example response:
This is example change dolor sit amet, consectetur adipiscing elit.
Proin eleifend tincidunt metus, at suscipit lorem sagittis sed.

Begin!

## Original file content:
{content}

## Updates to apply:
{updates}
`,
)
  .pipe(llm)
  .pipe(new StringOutputParser());

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

      const newContent = await chain.invoke({ content, updates });

      await writeFileAsync(fullPath, newContent, {
        encoding: 'utf-8',
        flag: 'w',
      });

      return `
File '${relativePath}' updated successfully in the space '${space}'.
\n\n ## New content of the file is:
\n\`\`\`${newContent}\`\`\``;
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
