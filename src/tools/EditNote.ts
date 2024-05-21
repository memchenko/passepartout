import { DynamicStructuredTool } from '@langchain/core/tools';

import { isError } from 'helpers/type-guards';
import { UNEXPECTED_ERROR_TOOL_TEXT } from 'helpers/constants';
import { asOrderedList, formatNote } from 'helpers/formatting';
import { updateNote, noteSchema, Note } from 'services/notes';

const buildEditNoteTool = (signer: Note['author']) =>
  new DynamicStructuredTool({
    name: 'edit-note',
    description: 'This tool provides a way to edit a note and displays updated list of notes.',
    schema: noteSchema.pick({
      id: true,
      title: true,
      text: true,
    }),
    func: async (data) => {
      try {
        const result = await updateNote({
          ...data,
          contributors: [signer],
        });

        return asOrderedList(result.map(formatNote));
      } catch (err: unknown) {
        if (isError(err)) {
          return String(err);
        }

        return UNEXPECTED_ERROR_TOOL_TEXT;
      }
    },
  });

export const editNoteByManager = buildEditNoteTool('manager');
export const editNoteByAnalyst = buildEditNoteTool('analyst');
