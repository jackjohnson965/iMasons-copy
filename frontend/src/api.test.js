import { describe, it, expect, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { apiFetch, api } from './api.js';
import { server } from './test/server.js';

describe('apiFetch', () => {
  beforeEach(() => localStorage.clear());

  it('hits /api-prefixed URLs and returns parsed JSON', async () => {
    server.use(
      http.get('/api/ping', () => HttpResponse.json({ pong: true })),
    );
    await expect(apiFetch('/ping')).resolves.toEqual({ pong: true });
  });

  it('injects Authorization header when token is present', async () => {
    localStorage.setItem('token', 'tok-123');
    let seen;
    server.use(
      http.get('/api/whoami', ({ request }) => {
        seen = request.headers.get('authorization');
        return HttpResponse.json({});
      }),
    );
    await apiFetch('/whoami');
    expect(seen).toBe('Bearer tok-123');
  });

  it('does not inject Authorization header when token is absent', async () => {
    let seen;
    server.use(
      http.get('/api/whoami', ({ request }) => {
        seen = request.headers.get('authorization');
        return HttpResponse.json({});
      }),
    );
    await apiFetch('/whoami');
    expect(seen).toBeNull();
  });

  it('throws an error with status + data on non-2xx', async () => {
    server.use(
      http.get('/api/bad', () =>
        HttpResponse.json({ detail: 'Boom' }, { status: 400 }),
      ),
    );
    try {
      await apiFetch('/bad');
      throw new Error('should have thrown');
    } catch (err) {
      expect(err.status).toBe(400);
      expect(err.data).toEqual({ detail: 'Boom' });
    }
  });

  it('handles non-JSON error bodies gracefully', async () => {
    server.use(
      http.get('/api/html-error', () =>
        new HttpResponse('<html>oops</html>', { status: 500 }),
      ),
    );
    try {
      await apiFetch('/html-error');
      throw new Error('should have thrown');
    } catch (err) {
      expect(err.status).toBe(500);
      expect(err.data).toBeNull();
    }
  });
});

describe('api helpers', () => {
  it('api.get sends GET', async () => {
    let method;
    server.use(
      http.get('/api/things', ({ request }) => {
        method = request.method;
        return HttpResponse.json([]);
      }),
    );
    await api.get('/things');
    expect(method).toBe('GET');
  });

  it('api.post sends POST with JSON body', async () => {
    let body;
    server.use(
      http.post('/api/things', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ ok: true }, { status: 201 });
      }),
    );
    await api.post('/things', { name: 'widget' });
    expect(body).toEqual({ name: 'widget' });
  });

  it('api.put sends PUT with JSON body', async () => {
    let method, body;
    server.use(
      http.put('/api/things/1', async ({ request }) => {
        method = request.method;
        body = await request.json();
        return HttpResponse.json({});
      }),
    );
    await api.put('/things/1', { name: 'updated' });
    expect(method).toBe('PUT');
    expect(body).toEqual({ name: 'updated' });
  });

  it('api.delete sends DELETE', async () => {
    let method;
    server.use(
      http.delete('/api/things/1', ({ request }) => {
        method = request.method;
        return HttpResponse.json({});
      }),
    );
    await api.delete('/things/1');
    expect(method).toBe('DELETE');
  });
});
