import test from 'node:test';
import assert from 'node:assert/strict';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { createTag, deleteTag, readTags, updateTag } from './tag.controller';

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

test('createTag creates a tag', async () => {
  const req = { body: { name: 'Work' } } as unknown as Request;
  const res = createMockResponse();

  const originalCreate = prisma.tag.create as unknown as typeof prisma.tag.create;
  (prisma.tag as any).create = async (data: any) => ({ id: 1, name: data.data.name }) as never;

  try {
    await createTag(req, res);
  } finally {
    (prisma.tag as any).create = originalCreate;
  }

  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.payload, { id: 1, name: 'Work' });
});

test('readTags returns the tag list', async () => {
  const req = {} as Request;
  const res = createMockResponse();

  const originalFindMany = prisma.tag.findMany as unknown as typeof prisma.tag.findMany;
  (prisma.tag as any).findMany = async () => ([{ id: 1, name: 'work' }]) as never;

  try {
    await readTags(req, res);
  } finally {
    (prisma.tag as any).findMany = originalFindMany;
  }

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.payload, [{ id: 1, name: 'work' }]);
});

test('updateTag returns 404 when the tag does not exist', async () => {
  const req = { params: { id: '9' }, body: { name: 'Updated' } } as unknown as Request;
  const res = createMockResponse();

  const originalFindUnique = prisma.tag.findUnique as unknown as typeof prisma.tag.findUnique;
  (prisma.tag as any).findUnique = async () => null as never;

  try {
    await updateTag(req, res);
  } finally {
    (prisma.tag as any).findUnique = originalFindUnique;
  }

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.payload, { message: 'Tag not found' });
});

test('deleteTag removes an existing tag', async () => {
  const req = { params: { id: '3' } } as unknown as Request;
  const res = createMockResponse();

  const originalFindUnique = prisma.tag.findUnique as unknown as typeof prisma.tag.findUnique;
  const originalDelete = prisma.tag.delete as unknown as typeof prisma.tag.delete;
  let deleted = false;

  (prisma.tag as any).findUnique = async () => ({ id: 3, name: 'work' }) as never;
  (prisma.tag as any).delete = async () => {
    deleted = true;
    return { id: 3 } as never;
  };

  try {
    await deleteTag(req, res);
  } finally {
    (prisma.tag as any).findUnique = originalFindUnique;
    (prisma.tag as any).delete = originalDelete;
  }

  assert.equal(res.statusCode, 200);
  assert.equal(deleted, true);
  assert.deepEqual(res.payload, { id: 3, name: 'work' });
});