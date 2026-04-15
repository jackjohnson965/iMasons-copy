import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useFetch } from './useFetch.js';
import { server } from '../test/server.js';

describe('useFetch', () => {
  it('starts in loading state then resolves data', async () => {
    server.use(http.get('/api/thing', () => HttpResponse.json({ id: 1 })));
    const { result } = renderHook(() => useFetch('/thing'));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ id: 1 });
    expect(result.current.error).toBeNull();
  });

  it('captures errors from failed requests', async () => {
    server.use(
      http.get('/api/broken', () => new HttpResponse(null, { status: 500 })),
    );
    const { result } = renderHook(() => useFetch('/broken'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeNull();
  });

  it('skips fetching when path is falsy', async () => {
    const { result } = renderHook(() => useFetch(null));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeNull();
  });

  it('refetch clears error and reloads', async () => {
    let calls = 0;
    server.use(
      http.get('/api/flaky', () => {
        calls += 1;
        if (calls === 1) return new HttpResponse(null, { status: 500 });
        return HttpResponse.json({ ok: true });
      }),
    );
    const { result } = renderHook(() => useFetch('/flaky'));
    await waitFor(() => expect(result.current.error).toBeTruthy());
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual({ ok: true });
  });
});
