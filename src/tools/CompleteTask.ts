import { DynamicStructuredTool } from '@langchain/core/tools';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';
import { asOrderedList, formatTask } from 'helpers/formatting';
import { completeTask as completeTaskService, taskSchema } from 'services/tasks';

export const completeTask = new DynamicStructuredTool({
  name: 'complete-task',
  description: 'This tool provides a way to complete a task in todo list and displays updated list of tasks.',
  schema: taskSchema.pick({
    id: true,
  }),
  func: async (taskData) => {
    try {
      const result = await completeTaskService(taskData.id);

      return asOrderedList(result.map(formatTask));
    } catch (err: unknown) {
      if (isError(err)) {
        return String(err);
      }

      return UNEXPECTED_ERROR_TOOL_TEXT;
    }
  },
});
