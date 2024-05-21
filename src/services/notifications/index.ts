import EventEmitter from 'node:events';

export enum Events {
  TaskAssigneeChanged = 'task-assignee-changed',
  TaskCompleted = 'task-comleted',
  NoteCreated = 'note-created',
  NoteUpdated = 'note-updated',
  InternalMessage = 'internal-message',
}

export const notifier = new EventEmitter();
