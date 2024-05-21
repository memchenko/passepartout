import { InternalMessage } from 'helpers/types';

export const counted = (value: string, index: number) => {
  return `${index + 1}.\n${value}`;
};

export const asOrderedList = (value: string[]) => {
  return value.map(counted).join('\n\n');
};

export const asLabeledList = <V extends Record<string, unknown>>(mapper: [keyof V, string][], data: V) => {
  return mapper
    .filter(([key]) => !data[key])
    .map(([key, title]) => {
      return `${title}: ${data[key]}`;
    })
    .join('\n');
};

export const formatTaskShort = asLabeledList.bind(null, [
  ['id', 'ID'],
  ['status', 'Status'],
  ['priority', 'Priority'],
  ['assignee', 'Assignee'],
  ['title', 'Title'],
]);

export const formatTask = asLabeledList.bind(null, [
  ['id', 'ID'],
  ['status', 'Status'],
  ['priority', 'Priority'],
  ['assignee', 'Assignee'],
  ['title', 'Title'],
  ['description', 'Description'],
]);

export const formatNote = asLabeledList.bind(null, [
  ['id', 'ID'],
  ['createdAt', 'Created at'],
  ['updatedAt', 'Updated at'],
  ['author', 'Author'],
  ['contributors', 'Contributors'],
  ['title', 'Title'],
  ['text', 'Text'],
]);

export const formatMessage = (message: InternalMessage) => {
  const prefix = 'New message from your AI teammate:\n\n';
  const content = asLabeledList(
    [
      ['signer', 'From'],
      ['recipient', 'To'],
      ['topic', 'Topic'],
      ['message', 'Message'],
    ],
    message,
  );

  return prefix + content;
};
