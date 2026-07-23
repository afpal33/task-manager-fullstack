import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import app from '../app';
async function startServer() {
    const server = createServer(app);
    await new Promise((resolve) => {
        server.listen(0, resolve);
    });
    const address = server.address();
    if (typeof address !== 'object' || address === null) {
        server.close();
        throw new Error('Server did not start on a port');
    }
    return {
        server,
        baseUrl: `http://127.0.0.1:${address.port}`,
    };
}
test('GET /api/health responds with a healthy status', async () => {
    const { server, baseUrl } = await startServer();
    try {
        const response = await fetch(`${baseUrl}/api/health`);
        const body = await response.json();
        assert.equal(response.status, 200);
        assert.deepEqual(body, {
            success: true,
            message: 'Server is healthy',
        });
    }
    finally {
        server.close();
    }
});
test('unknown routes return 404', async () => {
    const { server, baseUrl } = await startServer();
    try {
        const response = await fetch(`${baseUrl}/api/unknown-route`);
        const body = await response.json();
        assert.equal(response.status, 404);
        assert.deepEqual(body, {
            success: false,
            message: '404: Endpoint Not Found',
        });
    }
    finally {
        server.close();
    }
});
//# sourceMappingURL=app.test.js.map