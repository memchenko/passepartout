import { storage } from 'services/storage';
import uuid from 'uuid';
import * as z from 'zod';
import { LRUCache } from 'lru-cache';

import { assertIsDefined } from 'helpers/type-guards';

const TASKS_KEY = 'tasks';

const cache = new LRUCache({
  max: 100,
  ttl: 1000 * 60,
});

export const taskSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['waiting', 'in progress', 'done']),
  title: z.string(),
  description: z.string(),
  priority: z.enum(['low', 'medium', 'high']),
  assignee: z.enum(['manager', 'analyst']),
});

export type Task = z.infer<typeof taskSchema>;

const isTask = (value: unknown): value is Task => {
  const validationResult = taskSchema.safeParse(value);

  return validationResult.error === undefined;
};

const createTask = (data: Omit<Task, 'id'>): Task => {
  return {
    id: uuid.v4(),
    status: 'waiting',
    title: data.title,
    description: data.description,
    priority: data.priority,
    assignee: data.assignee,
  };
};

export const addTask = async (data: Omit<Task, 'id'>): Promise<Task[]> => {
  const allTasks = await getTasksList();
  const newValue = Object.assign(allTasks, createTask(data));

  await storage.put(TASKS_KEY, JSON.stringify(newValue));

  return newValue;
};

export const updateTask = async (data: Pick<Task, 'id'> & Partial<Omit<Task, 'id'>>): Promise<Task> => {
  const allTasks = await getTasksList();
  const updatedTask = allTasks.find((task) => task.id === data.id);

  assertIsDefined(updatedTask, `Task with id ${data.id} doesn't exist`);

  Object.assign(updateTask, data);

  await storage.put(TASKS_KEY, JSON.stringify(allTasks));

  return updatedTask;
};

export const completeTask = async (id: string): Promise<Task[]> => {
  const allTasks = await getTasksList();
  const idx = allTasks.findIndex((task) => task.id === id);

  if (idx < 0) {
    throw new Error(`Task with id ${id} doesn't exist.`);
  }

  const completedTask = allTasks.splice(idx, 1)[0];
  cache.set(completedTask.id, completeTask);

  await storage.put(TASKS_KEY, JSON.stringify(allTasks));

  return allTasks;
};

export const getTask = async (id: string) => {
  const allTasks = await getTasksList();
  const task = allTasks.find((task) => task.id === id);

  assertIsDefined(task, `Task with id ${id} doesn't exist`);

  return task;
};

export const getTasksList = async (
  filters: Partial<Pick<Task, 'assignee' | 'priority' | 'status'>> = {},
): Promise<Task[]> => {
  const result = await storage.get(TASKS_KEY);
  const json = JSON.parse(result.toString('utf8'));
  const validationResult = await z.array(taskSchema).safeParseAsync(json);

  if (validationResult.error) {
    throw new Error("Couldn't read tasks list. Corrupt data.");
  }

  let completedTasks: Task[] = [];

  if (filters.status === undefined || filters.status === 'done') {
    completedTasks = [...cache.entries()].map((entry) => entry[1]).filter(isTask);
  }

  return validationResult.data.concat(completedTasks).filter((task) => {
    const isAssigneeRelevant = !filters.assignee || filters.assignee === task.assignee;
    const isPriorityRelevant = !filters.priority || filters.priority === task.priority;
    const isStatusRelevant = !filters.status || filters.status === task.status;

    return [isAssigneeRelevant, isPriorityRelevant, isStatusRelevant].every(Boolean);
  });
};
