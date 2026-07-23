import test from 'node:test';
import assert from 'node:assert/strict';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from './auth.middleware';

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

test('authMiddleware rejects requests without a bearer token', () => {
  const req = { headers: {} } as Request;
  const res = createMockResponse();
  let nextCalled = false;
  const next: NextFunction = () => {
    nextCalled = true;
  };

  authMiddleware(req, res, next);

  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
});

test('authMiddleware accepts a valid bearer token and attaches the user', () => {
  const originalJwtSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'test-secret';

  const token = jwt.sign({ userId: 42, email: 'test@example.com' }, 'test-secret');
  const req = { headers: { authorization: `Bearer ${token}` } } as Request;
  const res = createMockResponse();
  let nextCalled = false;
  const next: NextFunction = () => {
    nextCalled = true;
  };

  try {
    authMiddleware(req, res, next);
  } finally {
    process.env.JWT_SECRET = originalJwtSecret;
  }

  assert.equal(nextCalled, true);
  assert.equal(req.user?.userId, 42);
  assert.equal(req.user?.email, 'test@example.com');
});
