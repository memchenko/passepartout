import { DateTime } from 'luxon';
import pick from 'lodash/fp/pick';
import uuid from 'uuid';
import * as z from 'zod';

import { storage } from 'services/storage';
import { assertIsDefined } from 'helpers/type-guards';
import { possibleAgentsSchema } from 'helpers/types';

const NOTES_KEY = 'notes';

export const noteSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  author: possibleAgentsSchema,
  contributors: z.array(possibleAgentsSchema),
  text: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Note = z.infer<typeof noteSchema>;

const createNote = (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'contributors'>): Note => {
  return {
    id: uuid.v4(),
    author: data.author,
    title: data.title,
    contributors: [data.author],
    text: data.text,
    createdAt: DateTime.now().toISO(),
    updatedAt: DateTime.now().toISO(),
  };
};

export const addNote = async (data: Parameters<typeof createNote>[0]) => {
  const allNotes = await getNotes();
  const newValue = Object.assign(allNotes, createNote(data));

  await storage.put(NOTES_KEY, JSON.stringify(newValue));

  return newValue;
};

export const updateNote = async (data: Pick<Note, 'id' | 'text' | 'contributors' | 'title'>) => {
  const allNotes = await getNotes();
  const note = allNotes.find((note) => note.id === data.id);

  assertIsDefined(note, `Error: note with id ${data.id} doesn't exist`);

  note.title = data.title;
  note.text = data.text;
  note.updatedAt = DateTime.now().toISO();
  note.contributors = [...new Set(note.contributors.concat(data.contributors))];

  await storage.put(NOTES_KEY, JSON.stringify(allNotes));

  return allNotes;
};

export const removeNote = async (id: string) => {
  const allNotes = await getNotes();
  const newValue = allNotes.filter((note) => note.id !== id);

  await storage.put(NOTES_KEY, JSON.stringify(newValue));

  return newValue;
};

export const listNotes = async () => {
  const allNotes = await getNotes();

  return allNotes.map(pick(['id', 'title', 'createdAt', 'author']));
};

export const getNote = async (id: string) => {
  const allNotes = await getNotes();
  const result = allNotes.find((note) => note.id === id);

  assertIsDefined(result, `Note with id ${id} doesn't exist.`);

  return result;
};

export const getNotes = async () => {
  const result = await storage.get(NOTES_KEY);
  const json = JSON.parse(result.toString('utf8'));
  const validationResult = await z.array(noteSchema).safeParseAsync(json);

  if (validationResult.error) {
    throw new Error("Error: Couldn't read notes list. Corrupt data.");
  }

  return validationResult.data.sort((a, b) => {
    return DateTime.fromISO(b.createdAt).diff(DateTime.fromISO(a.createdAt)).toMillis();
  });
};
