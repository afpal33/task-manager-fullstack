import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { authMiddleware } from './auth.middleware';
function createMockResponse() {
    const res = {
        statusCode: 0,
        payload: undefined,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.payload = payload;
            return this;
        },
    };
    return res;
}
test('authMiddleware rejects requests without a bearer token', () => {
    const req = { headers: {} };
    const res = createMockResponse();
    let nextCalled = false;
    const next = () => {
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
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createMockResponse();
    let nextCalled = false;
    const next = () => {
        nextCalled = true;
    };
    try {
        authMiddleware(req, res, next);
    }
    finally {
        process.env.JWT_SECRET = originalJwtSecret;
    }
    assert.equal(nextCalled, true);
    assert.equal(req.user?.userId, 42);
    assert.equal(req.user?.email, 'test@example.com');
});
//# sourceMappingURL=auth.middleware.test.js.map