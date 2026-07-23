import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { registerUser, loginUser } from './auth.controller';
import { prisma } from '../lib/prisma';
const originalEnv = process.env.JWT_SECRET;
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
test('registerUser creates a user when input is valid', async () => {
    const req = { body: { name: 'Ana', email: 'ana@test.com', password: '123456' } };
    const res = createMockResponse();
    const originalFindUnique = prisma.user.findUnique;
    const originalCreate = prisma.user.create;
    prisma.user.findUnique = async () => null;
    prisma.user.create = async (data) => ({ id: 1, ...data.data });
    await registerUser(req, res);
    prisma.user.findUnique = originalFindUnique;
    prisma.user.create = originalCreate;
    assert.equal(res.statusCode, 201);
    assert.equal(res.payload.email, 'ana@test.com');
});
test('loginUser returns a token for a valid user', async () => {
    process.env.JWT_SECRET = 'test-secret';
    const req = { body: { email: 'ana@test.com', password: '123456' } };
    const res = createMockResponse();
    const originalFindUnique = prisma.user.findUnique;
    prisma.user.findUnique = async () => ({
        id: 1,
        name: 'Ana',
        email: 'ana@test.com',
        password: await bcrypt.hash('123456', 10),
    });
    await loginUser(req, res);
    prisma.user.findUnique = originalFindUnique;
    assert.equal(res.statusCode, 200);
    assert.ok(res.payload.token);
    assert.equal(res.payload.user.email, 'ana@test.com');
});
test.after(() => {
    process.env.JWT_SECRET = originalEnv;
});
//# sourceMappingURL=auth.controller.test.js.map