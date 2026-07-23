import test from 'node:test';
import assert from 'node:assert/strict';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { registerUser, loginUser } from './auth.controller';
import { prisma } from '../lib/prisma';

const originalEnv = process.env.JWT_SECRET;

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

test('registerUser creates a user when input is valid', async () => {
  const req = { body: { name: 'Ana', email: 'ana@test.com', password: '123456' } } as Request;
  const res = createMockResponse();

  const originalFindUnique = prisma.user.findUnique;
  const originalCreate = prisma.user.create;

  prisma.user.findUnique = async () => null as never;
  prisma.user.create = async (data: any) => ({ id: 1, ...data.data }) as never;

  await registerUser(req, res);

  prisma.user.findUnique = originalFindUnique;
  prisma.user.create = originalCreate;

  assert.equal(res.statusCode, 201);
  assert.equal((res.payload as any).email, 'ana@test.com');
});

test('loginUser returns a token for a valid user', async () => {
  process.env.JWT_SECRET = 'test-secret';

  const req = { body: { email: 'ana@test.com', password: '123456' } } as Request;
  const res = createMockResponse();

  const originalFindUnique = prisma.user.findUnique;
  prisma.user.findUnique = async () => ({
    id: 1,
    name: 'Ana',
    email: 'ana@test.com',
    password: await bcrypt.hash('123456', 10),
  }) as never;

  await loginUser(req, res);

  prisma.user.findUnique = originalFindUnique;

  assert.equal(res.statusCode, 200);
  assert.ok((res.payload as any).token);
  assert.equal((res.payload as any).user.email, 'ana@test.com');
});

test.after(() => {
  process.env.JWT_SECRET = originalEnv;
});
