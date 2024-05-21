import { DynamicStructuredTool } from '@langchain/core/tools';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';
import { asOrderedList, formatNote } from 'helpers/formatting';
import { removeNote as removeNoteService, noteSchema } from 'services/notes';

export const removeNote = new DynamicStructuredTool({
  name: 'remove-note',
  description: 'This tool provides a way to remove a note and displays updated list of notes.',
  schema: noteSchema.pick({
    id: true,
  }),
  func: async (data) => {
    try {
      const result = await removeNoteService(data.id);

      return asOrderedList(result.map(formatNote));
    } catch (err: unknown) {
      if (isError(err)) {
        return String(err);
      }

      return UNEXPECTED_ERROR_TOOL_TEXT;
    }
  },
});
