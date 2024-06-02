import { DynamicStructuredTool } from '@langchain/core/tools';
import prompts from 'prompts';
import * as z from 'zod';

import { isError } from 'lib/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'lib/constants';

export const chat = new DynamicStructuredTool({
  name: 'chat',
  description: 'This tool provides a way to communicate with the user.',
  schema: z.object({
    type: z
      .enum([
        'text',
        'password',
        'invisible',
        'number',
        'confirm',
        'list',
        'toggle',
        'select',
        'multiselect',
        'autocomplete',
        'date',
        'autocompleteMultiselect',
      ])
      .optional()
      .describe('Specify this parameter to get appropriate response.'),
    question: z.string(),
    choices: z
      .array(
        z.object({
          title: z.string(),
          value: z.string(),
          description: z.string().optional(),
        }),
      )
      .optional()
      .describe(
        'You should specify this parameter in case of list, toggle, select or multiselect type to limit user responses.',
      ),
  }),
  func: async ({ type = 'text', question, choices }) => {
    try {
      const answer = await prompts({
        type,
        name: 'question',
        message: question,
        choices,
      });

      return String(answer.question);
    } catch (err: unknown) {
      if (isError(err)) {
        return String(err);
      }

      return UNEXPECTED_ERROR_TOOL_TEXT;
    }
  },
});
