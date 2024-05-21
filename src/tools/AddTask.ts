import { DynamicStructuredTool } from '@langchain/core/tools';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';
import { asOrderedList, formatTask } from 'helpers/formatting';
import { addTask as addTaskService, taskSchema } from 'services/tasks';

export const addTask = new DynamicStructuredTool({
  name: 'add-task',
  description: 'This tool provides a way to create a task in todo list and displays updated list of tasks.',
  schema: taskSchema.omit({
    id: true,
  }),
  func: async (taskData) => {
    try {
      const result = await addTaskService(taskData);

      return asOrderedList(result.map(formatTask));
    } catch (err: unknown) {
      if (isError(err)) {
        return String(err);
      }

      return UNEXPECTED_ERROR_TOOL_TEXT;
    }
  },
});
