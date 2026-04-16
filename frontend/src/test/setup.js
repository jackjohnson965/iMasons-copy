import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './server.js';
import { resetStores } from './handlers.js';

// Vitest 4 ships its own localStorage shim that is missing getItem/setItem/
// clear. Replace it with a minimal in-memory Storage-compatible impl before
// any test imports RoleContext (which calls localStorage.setItem at module
// evaluation time through React state initializers).
class MemStorage {
  constructor() {
    this._data = {};
  }
  getItem(k) {
    return Object.prototype.hasOwnProperty.call(this._data, k) ? this._data[k] : null;
  }
  setItem(k, v) {
    this._data[k] = String(v);
  }
  removeItem(k) {
    delete this._data[k];
  }
  clear() {
    this._data = {};
  }
  key(i) {
    return Object.keys(this._data)[i] ?? null;
  }
  get length() {
    return Object.keys(this._data).length;
  }
}

const mem = new MemStorage();
Object.defineProperty(globalThis, 'localStorage', {
  value: mem,
  writable: true,
  configurable: true,
});
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: mem,
    writable: true,
    configurable: true,
  });
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  resetStores();
  mem.clear();
});
afterAll(() => server.close());
