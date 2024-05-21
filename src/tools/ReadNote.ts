import { DynamicStructuredTool } from '@langchain/core/tools';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';
import { formatNote } from 'helpers/formatting';
import { getNote, noteSchema } from 'services/notes';

export const readNote = new DynamicStructuredTool({
  name: 'read-note',
  description: 'This tool displays full description of a note.',
  schema: noteSchema.pick({ id: true }),
  func: async ({ id }) => {
    try {
      const result = await getNote(id);

      return formatNote(result);
    } catch (err: unknown) {
      if (isError(err)) {
        return String(err);
      }

      return UNEXPECTED_ERROR_TOOL_TEXT;
    }
  },
});
