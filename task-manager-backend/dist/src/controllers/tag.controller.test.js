import test from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../lib/prisma';
import { createTag, deleteTag, readTags, updateTag } from './tag.controller';
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
test('createTag creates a tag', async () => {
    const req = { body: { name: 'Work' } };
    const res = createMockResponse();
    const originalCreate = prisma.tag.create;
    prisma.tag.create = async (data) => ({ id: 1, name: data.data.name });
    try {
        await createTag(req, res);
    }
    finally {
        prisma.tag.create = originalCreate;
    }
    assert.equal(res.statusCode, 201);
    assert.deepEqual(res.payload, { id: 1, name: 'Work' });
});
test('readTags returns the tag list', async () => {
    const req = {};
    const res = createMockResponse();
    const originalFindMany = prisma.tag.findMany;
    prisma.tag.findMany = async () => ([{ id: 1, name: 'work' }]);
    try {
        await readTags(req, res);
    }
    finally {
        prisma.tag.findMany = originalFindMany;
    }
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.payload, [{ id: 1, name: 'work' }]);
});
test('updateTag returns 404 when the tag does not exist', async () => {
    const req = { params: { id: '9' }, body: { name: 'Updated' } };
    const res = createMockResponse();
    const originalFindUnique = prisma.tag.findUnique;
    prisma.tag.findUnique = async () => null;
    try {
        await updateTag(req, res);
    }
    finally {
        prisma.tag.findUnique = originalFindUnique;
    }
    assert.equal(res.statusCode, 404);
    assert.deepEqual(res.payload, { message: 'Tag not found' });
});
test('deleteTag removes an existing tag', async () => {
    const req = { params: { id: '3' } };
    const res = createMockResponse();
    const originalFindUnique = prisma.tag.findUnique;
    const originalDelete = prisma.tag.delete;
    let deleted = false;
    prisma.tag.findUnique = async () => ({ id: 3, name: 'work' });
    prisma.tag.delete = async () => {
        deleted = true;
        return { id: 3 };
    };
    try {
        await deleteTag(req, res);
    }
    finally {
        prisma.tag.findUnique = originalFindUnique;
        prisma.tag.delete = originalDelete;
    }
    assert.equal(res.statusCode, 200);
    assert.equal(deleted, true);
    assert.deepEqual(res.payload, { id: 3, name: 'work' });
});
//# sourceMappingURL=tag.controller.test.js.map