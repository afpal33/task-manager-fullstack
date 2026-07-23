import test from 'node:test';
import assert from 'node:assert/strict';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { createTask, deleteTask, readTasks, toggleTask, updateTask } from './task.controller';

function createMockResponse() {
  const res = {
    statusCode: 0,
    payload: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.payload = payload;
      return this;
    },
  } as Response & { statusCode: number; payload: unknown };

  return res;
}

test('createTask creates a task and normalizes tags', async () => {
  const req = {
    body: {
      title: '  Buy milk  ',
      description: '  Grocery list  ',
      tags: [' Home ', 'home', 'Urgent', ''],
    },
    user: { userId: 7, email: 'ana@test.com' },
  } as unknown as Request;
  const res = createMockResponse();

  const originalTagUpsert = prisma.tag.upsert as unknown as typeof prisma.tag.upsert;
  const originalTaskCreate = prisma.task.create as unknown as typeof prisma.task.create;
  const seenTags: string[] = [];

  (prisma.tag as any).upsert = async ({ create }: any) => {
    seenTags.push(create.name);
    return create as never;
  };
  (prisma.task as any).create = async (data: any) => ({
    id: 10,
    title: data.data.title,
    description: data.data.description,
    userId: data.data.userId,
    tags: [{ id: 1, name: 'home' }, { id: 2, name: 'urgent' }],
  }) as never;

  try {
    await createTask(req, res);
  } finally {
    (prisma.tag as any).upsert = originalTagUpsert;
    (prisma.task as any).create = originalTaskCreate;
  }

  assert.equal(res.statusCode, 201);
  assert.deepEqual(seenTags, ['home', 'urgent']);
  assert.equal((res.payload as any).title, 'Buy milk');
  assert.equal((res.payload as any).description, 'Grocery list');
  assert.equal((res.payload as any).userId, 7);
});

test('readTasks returns the current users tasks', async () => {
  const req = { user: { userId: 7, email: 'ana@test.com' } } as unknown as Request;
  const res = createMockResponse();

  const originalFindMany = prisma.task.findMany as unknown as typeof prisma.task.findMany;
  (prisma.task as any).findMany = async () => ([{ id: 1, title: 'First task', tags: [] }]) as never;

  try {
    await readTasks(req, res);
  } finally {
    (prisma.task as any).findMany = originalFindMany;
  }

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.payload, [{ id: 1, title: 'First task', tags: [] }]);
});

test('updateTask updates an owned task', async () => {
  const req = {
    params: { id: '3' },
    body: { title: 'Updated task', tags: [' work ', 'work', 'home'] },
    user: { userId: 7, email: 'ana@test.com' },
  } as unknown as Request;
  const res = createMockResponse();

  const originalFindFirst = prisma.task.findFirst as unknown as typeof prisma.task.findFirst;
  const originalTagUpsert = prisma.tag.upsert as unknown as typeof prisma.tag.upsert;
  const originalTaskUpdate = prisma.task.update as unknown as typeof prisma.task.update;
  const seenTags: string[] = [];

  (prisma.task as any).findFirst = async () => ({ id: 3, userId: 7, completed: false }) as never;
  (prisma.tag as any).upsert = async ({ create }: any) => {
    seenTags.push(create.name);
    return create as never;
  };
  (prisma.task as any).update = async (data: any) => ({
    id: 3,
    title: data.data.title,
    tags: [{ id: 1, name: 'work' }, { id: 2, name: 'home' }],
  }) as never;

  try {
    await updateTask(req, res);
  } finally {
    (prisma.task as any).findFirst = originalFindFirst;
    (prisma.tag as any).upsert = originalTagUpsert;
    (prisma.task as any).update = originalTaskUpdate;
  }

  assert.equal(res.statusCode, 200);
  assert.deepEqual(seenTags, ['work', 'home']);
  assert.equal((res.payload as any).title, 'Updated task');
});

test('deleteTask removes an owned task', async () => {
  const req = {
    params: { id: '4' },
    user: { userId: 7, email: 'ana@test.com' },
  } as unknown as Request;
  const res = createMockResponse();

  const originalFindFirst = prisma.task.findFirst as unknown as typeof prisma.task.findFirst;
  const originalDelete = prisma.task.delete as unknown as typeof prisma.task.delete;
  let deleted = false;

  (prisma.task as any).findFirst = async () => ({ id: 4, userId: 7 }) as never;
  (prisma.task as any).delete = async () => {
    deleted = true;
    return { id: 4 } as never;
  };

  try {
    await deleteTask(req, res);
  } finally {
    (prisma.task as any).findFirst = originalFindFirst;
    (prisma.task as any).delete = originalDelete;
  }

  assert.equal(res.statusCode, 200);
  assert.equal(deleted, true);
  assert.deepEqual(res.payload, { message: 'Task deleted' });
});

test('toggleTask flips the completed flag for an owned task', async () => {
  const req = {
    params: { id: '5' },
    user: { userId: 7, email: 'ana@test.com' },
  } as unknown as Request;
  const res = createMockResponse();

  const originalFindFirst = prisma.task.findFirst as unknown as typeof prisma.task.findFirst;
  const originalUpdate = prisma.task.update as unknown as typeof prisma.task.update;

  (prisma.task as any).findFirst = async () => ({ id: 5, userId: 7, completed: false }) as never;
  (prisma.task as any).update = async (data: any) => ({
    id: 5,
    completed: data.data.completed,
    tags: [],
  }) as never;

  try {
    await toggleTask(req, res);
  } finally {
    (prisma.task as any).findFirst = originalFindFirst;
    (prisma.task as any).update = originalUpdate;
  }

  assert.equal(res.statusCode, 200);
  assert.equal((res.payload as any).completed, true);
});