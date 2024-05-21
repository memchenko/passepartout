import { DynamicStructuredTool } from '@langchain/core/tools';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';
import { formatTaskShort, asOrderedList } from 'helpers/formatting';
import { getTasksList, taskSchema } from 'services/tasks';

export const listTasks = new DynamicStructuredTool({
  name: 'list-tasks',
  description: 'This tool provides a way to find tasks. Result can be filtered by assignee, priority and status',
  schema: taskSchema.pick({ assignee: true, priority: true, status: true }).partial(),
  func: async ({ assignee, status, priority }) => {
    try {
      const result = await getTasksList({ assignee, status, priority });

      return asOrderedList(result.map(formatTaskShort));
    } catch (err: unknown) {
      if (isError(err)) {
        return String(err);
      }

      return UNEXPECTED_ERROR_TOOL_TEXT;
    }
  },
});
