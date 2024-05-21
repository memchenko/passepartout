import { DynamicTool } from '@langchain/core/tools';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';
import { asOrderedList, formatNote } from 'helpers/formatting';
import { listNotes as listNotesHelper } from 'services/notes';

export const listNotes = new DynamicTool({
  name: 'list-all-notes',
  description: 'This tool displays list of all notes.',
  func: async () => {
    try {
      const result = await listNotesHelper();

      return asOrderedList(result.map(formatNote));
    } catch (err: unknown) {
      if (isError(err)) {
        return String(err);
      }

      return UNEXPECTED_ERROR_TOOL_TEXT;
    }
  },
});
