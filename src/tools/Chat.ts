import { DynamicStructuredTool } from '@langchain/core/tools';
import prompts from 'prompts';
import * as z from 'zod';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';

export const chat = new DynamicStructuredTool({
  name: 'chat',
  description: 'This tool provides a way to communicate with the user using "prompts" npm library.',
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
      .optional(),
    name: z.string(),
    message: z.string(),
    choices: z
      .array(
        z.object({
          title: z.string(),
          value: z.string(),
          description: z.string().optional(),
        }),
      )
      .optional(),
  }),
  func: async ({ type = 'text', name, message, choices }) => {
    try {
      const answer = await prompts({
        type,
        name,
        message,
        choices,
      });

      return String(answer[name]);
    } catch (err: unknown) {
      if (isError(err)) {
        return String(err);
      }

      return UNEXPECTED_ERROR_TOOL_TEXT;
    }
  },
});
