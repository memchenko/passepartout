import { DynamicStructuredTool } from '@langchain/core/tools';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';
import { formatTask } from 'helpers/formatting';
import { updateTask as updateTaskService, taskSchema } from 'services/tasks';

export const updateTask = new DynamicStructuredTool({
  name: 'update-task',
  description:
    'This tool provides a way to update a task in todo list and displays updated task. One of examples is to update status of a task.',
  schema: taskSchema
    .pick({
      id: true,
    })
    .merge(taskSchema.omit({ id: true }).partial()),
  func: async (taskData) => {
    try {
      const result = await updateTaskService(taskData);

      return formatTask(result);
    } catch (err: unknown) {
      if (isError(err)) {
        return String(err);
      }

      return UNEXPECTED_ERROR_TOOL_TEXT;
    }
  },
});
