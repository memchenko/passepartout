import { DynamicStructuredTool } from '@langchain/core/tools';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';
import { formatTask } from 'helpers/formatting';
import { getTask, taskSchema } from 'services/tasks';

export const readTask = new DynamicStructuredTool({
  name: 'read-task',
  description: 'This tool provides a way to read a full task description.',
  schema: taskSchema.pick({ id: true }),
  func: async ({ id }) => {
    try {
      const result = await getTask(id);

      return formatTask(result);
    } catch (err: unknown) {
      if (isError(err)) {
        return String(err);
      }

      return UNEXPECTED_ERROR_TOOL_TEXT;
    }
  },
});
