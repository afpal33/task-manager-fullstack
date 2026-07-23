import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import app from '../app';
import { prisma } from '../lib/prisma';

async function startServer() {
  const server = createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, resolve);
  });

  const address = server.address();

  if (typeof address !== 'object' || address === null) {
    server.close();
    throw new Error('Server did not start on a port');
  }

  return {
    server,
    baseUrl: `http://127.0.0.1:${(address as AddressInfo).port}`,
  };
}

async function resetDatabase() {
  await prisma.task.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();
}

test('backend happy path persists data through real PostgreSQL routes', async () => {
  const originalJwtSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'integration-secret';

  const { server, baseUrl } = await startServer();

  try {
    await resetDatabase();

    const registerResponse = await fetch(`${baseUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Integration User',
        email: 'integration@test.com',
        password: '123456',
      }),
    });
    assert.equal(registerResponse.status, 201);

    const loginResponse = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'integration@test.com',
        password: '123456',
      }),
    });
    assert.equal(loginResponse.status, 200);

    const loginBody = await loginResponse.json() as { token: string };
    assert.ok(loginBody.token);

    const createTagResponse = await fetch(`${baseUrl}/api/v1/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'work' }),
    });
    assert.equal(createTagResponse.status, 201);

    const createTaskResponse = await fetch(`${baseUrl}/api/v1/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginBody.token}`,
      },
      body: JSON.stringify({
        title: 'Prepare release notes',
        description: 'Write the release notes for the next deploy',
        tags: ['Work', 'Release'],
      }),
    });
    assert.equal(createTaskResponse.status, 201);

    const createdTask = await createTaskResponse.json() as { id: number; title: string; completed: boolean; tags: Array<{ name: string }> };
    assert.equal(createdTask.title, 'Prepare release notes');
    assert.equal(createdTask.completed, false);
    assert.deepEqual(createdTask.tags.map((tag) => tag.name).sort(), ['release', 'work']);

    const listTasksResponse = await fetch(`${baseUrl}/api/v1/tasks`, {
      headers: {
        Authorization: `Bearer ${loginBody.token}`,
      },
    });
    assert.equal(listTasksResponse.status, 200);

    const tasks = await listTasksResponse.json() as Array<{ id: number; title: string; completed: boolean; tags: Array<{ name: string }> }>;
    assert.equal(tasks.length, 1);
    assert.ok(tasks[0]);
    assert.equal(tasks[0].title, 'Prepare release notes');

    const updateTaskResponse = await fetch(`${baseUrl}/api/v1/tasks/${createdTask.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginBody.token}`,
      },
      body: JSON.stringify({
        title: 'Prepare release notes v2',
        description: 'Updated release notes',
        completed: true,
      }),
    });
    assert.equal(updateTaskResponse.status, 200);

    const updatedTask = await updateTaskResponse.json() as { title: string; completed: boolean };
    assert.equal(updatedTask.title, 'Prepare release notes v2');
    assert.equal(updatedTask.completed, true);

    const toggleTaskResponse = await fetch(`${baseUrl}/api/v1/tasks/${createdTask.id}/toggle`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${loginBody.token}`,
      },
    });
    assert.equal(toggleTaskResponse.status, 200);

    const toggledTask = await toggleTaskResponse.json() as { completed: boolean };
    assert.equal(toggledTask.completed, false);

    const deleteTaskResponse = await fetch(`${baseUrl}/api/v1/tasks/${createdTask.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${loginBody.token}`,
      },
    });
    assert.equal(deleteTaskResponse.status, 200);

    const listTagsResponse = await fetch(`${baseUrl}/api/v1/tags`);
    assert.equal(listTagsResponse.status, 200);

    const tags = await listTagsResponse.json() as Array<{ name: string }>;
    assert.deepEqual(tags.map((tag) => tag.name).sort(), ['release', 'work']);
  } finally {
    await resetDatabase();
    server.close();
    process.env.JWT_SECRET = originalJwtSecret;
  }
});