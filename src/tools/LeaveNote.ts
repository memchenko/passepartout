import { DynamicStructuredTool } from '@langchain/core/tools';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';
import { asOrderedList, formatNote } from 'helpers/formatting';
import { addNote, noteSchema, Note } from 'services/notes';

const buildLeaveNoteTool = (signer: Note['contributors'][number]) =>
  new DynamicStructuredTool({
    name: 'leave-note',
    description: 'This tool provides a way to leave a note and displays updated list of notes.',
    schema: noteSchema.pick({
      title: true,
      text: true,
    }),
    func: async (data) => {
      try {
        const result = await addNote({ ...data, author: signer });

        return asOrderedList(result.map(formatNote));
      } catch (err: unknown) {
        if (isError(err)) {
          return String(err);
        }

        return UNEXPECTED_ERROR_TOOL_TEXT;
      }
    },
  });

export const leaveNoteFromManager = buildLeaveNoteTool('manager');
export const leaveNoteFromAnalyst = buildLeaveNoteTool('analyst');
