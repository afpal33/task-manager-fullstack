import test from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../lib/prisma';
import { createTask, deleteTask, readTasks, toggleTask, updateTask } from './task.controller';
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
test('createTask creates a task and normalizes tags', async () => {
    const req = {
        body: {
            title: '  Buy milk  ',
            description: '  Grocery list  ',
            tags: [' Home ', 'home', 'Urgent', ''],
        },
        user: { userId: 7, email: 'ana@test.com' },
    };
    const res = createMockResponse();
    const originalTagUpsert = prisma.tag.upsert;
    const originalTaskCreate = prisma.task.create;
    const seenTags = [];
    prisma.tag.upsert = async ({ create }) => {
        seenTags.push(create.name);
        return create;
    };
    prisma.task.create = async (data) => ({
        id: 10,
        title: data.data.title,
        description: data.data.description,
        userId: data.data.userId,
        tags: [{ id: 1, name: 'home' }, { id: 2, name: 'urgent' }],
    });
    try {
        await createTask(req, res);
    }
    finally {
        prisma.tag.upsert = originalTagUpsert;
        prisma.task.create = originalTaskCreate;
    }
    assert.equal(res.statusCode, 201);
    assert.deepEqual(seenTags, ['home', 'urgent']);
    assert.equal(res.payload.title, 'Buy milk');
    assert.equal(res.payload.description, 'Grocery list');
    assert.equal(res.payload.userId, 7);
});
test('readTasks returns the current users tasks', async () => {
    const req = { user: { userId: 7, email: 'ana@test.com' } };
    const res = createMockResponse();
    const originalFindMany = prisma.task.findMany;
    prisma.task.findMany = async () => ([{ id: 1, title: 'First task', tags: [] }]);
    try {
        await readTasks(req, res);
    }
    finally {
        prisma.task.findMany = originalFindMany;
    }
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.payload, [{ id: 1, title: 'First task', tags: [] }]);
});
test('updateTask updates an owned task', async () => {
    const req = {
        params: { id: '3' },
        body: { title: 'Updated task', tags: [' work ', 'work', 'home'] },
        user: { userId: 7, email: 'ana@test.com' },
    };
    const res = createMockResponse();
    const originalFindFirst = prisma.task.findFirst;
    const originalTagUpsert = prisma.tag.upsert;
    const originalTaskUpdate = prisma.task.update;
    const seenTags = [];
    prisma.task.findFirst = async () => ({ id: 3, userId: 7, completed: false });
    prisma.tag.upsert = async ({ create }) => {
        seenTags.push(create.name);
        return create;
    };
    prisma.task.update = async (data) => ({
        id: 3,
        title: data.data.title,
        tags: [{ id: 1, name: 'work' }, { id: 2, name: 'home' }],
    });
    try {
        await updateTask(req, res);
    }
    finally {
        prisma.task.findFirst = originalFindFirst;
        prisma.tag.upsert = originalTagUpsert;
        prisma.task.update = originalTaskUpdate;
    }
    assert.equal(res.statusCode, 200);
    assert.deepEqual(seenTags, ['work', 'home']);
    assert.equal(res.payload.title, 'Updated task');
});
test('deleteTask removes an owned task', async () => {
    const req = {
        params: { id: '4' },
        user: { userId: 7, email: 'ana@test.com' },
    };
    const res = createMockResponse();
    const originalFindFirst = prisma.task.findFirst;
    const originalDelete = prisma.task.delete;
    let deleted = false;
    prisma.task.findFirst = async () => ({ id: 4, userId: 7 });
    prisma.task.delete = async () => {
        deleted = true;
        return { id: 4 };
    };
    try {
        await deleteTask(req, res);
    }
    finally {
        prisma.task.findFirst = originalFindFirst;
        prisma.task.delete = originalDelete;
    }
    assert.equal(res.statusCode, 200);
    assert.equal(deleted, true);
    assert.deepEqual(res.payload, { message: 'Task deleted' });
});
test('toggleTask flips the completed flag for an owned task', async () => {
    const req = {
        params: { id: '5' },
        user: { userId: 7, email: 'ana@test.com' },
    };
    const res = createMockResponse();
    const originalFindFirst = prisma.task.findFirst;
    const originalUpdate = prisma.task.update;
    prisma.task.findFirst = async () => ({ id: 5, userId: 7, completed: false });
    prisma.task.update = async (data) => ({
        id: 5,
        completed: data.data.completed,
        tags: [],
    });
    try {
        await toggleTask(req, res);
    }
    finally {
        prisma.task.findFirst = originalFindFirst;
        prisma.task.update = originalUpdate;
    }
    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.completed, true);
});
//# sourceMappingURL=task.controller.test.js.map