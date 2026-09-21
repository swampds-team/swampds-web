/**
 * @fileoverview A tiny in-memory stand-in for the parts of firebase/database that the
 * bridge uses. Used by tests only. Like the real SDK, local writes notify listeners
 * immediately, and each client (browser tab) has its own connection with its own
 * onDisconnect handlers.
 */

const clone = (v) => (v === undefined ? null : JSON.parse(JSON.stringify(v)));
const segs = (path) => path.split('/').filter(Boolean);
const isEmpty = (v) => v && typeof v === 'object' && Object.keys(v).length === 0;
const join = (base, child) => [base, child].filter(Boolean).join('/');

export function createFakeDb(initial = {}) {
  let data = clone(initial) ?? {};
  let pushCount = 0;
  let writeError = null; // when set, update() rejects with it (e.g. PERMISSION_DENIED)
  const listeners = new Set();

  const getAt = (path) => {
    let cur = data;
    for (const key of segs(path)) {
      if (cur === null || typeof cur !== 'object') return null;
      cur = cur[key];
    }
    return cur === undefined || isEmpty(cur) ? null : clone(cur);
  };

  const setAt = (path, value) => {
    const keys = segs(path);
    if (keys.length === 0) { data = clone(value) ?? {}; return; }
    let cur = data;
    for (const key of keys.slice(0, -1)) {
      if (cur[key] === null || typeof cur[key] !== 'object') cur[key] = {};
      cur = cur[key];
    }
    const last = keys[keys.length - 1];
    if (value === null || value === undefined) delete cur[last];
    else cur[last] = clone(value);
  };

  const notify = () => {
    for (const l of [...listeners]) {
      const value = getAt(l.path);
      const serial = JSON.stringify(value);
      if (serial !== l.last) {
        l.last = serial;
        l.callback({ val: () => clone(value) });
      }
    }
  };

  /** One browser tab's connection: shared data, private onDisconnect handlers. */
  function makeClient() {
    const disconnects = new Map(); // path -> action

    const api = {
      ref: (_db, path = '') => ({ path }),
      async update(r, values) {
        if (writeError) throw writeError;
        for (const [key, value] of Object.entries(values)) setAt(join(r.path, key), value);
        notify();
      },
      async set(r, value) { setAt(r.path, value); notify(); },
      async remove(r) { setAt(r.path, null); notify(); },
      push(r, value) {
        const key = `-k${String(++pushCount).padStart(4, '0')}`;
        setAt(join(r.path, key), value);
        notify();
        return Promise.resolve({ key });
      },
      onValue(r, callback) {
        const l = { path: r.path, callback, last: undefined };
        listeners.add(l);
        const value = getAt(r.path);
        l.last = JSON.stringify(value);
        callback({ val: () => clone(value) });
        return () => listeners.delete(l);
      },
      async runTransaction(r, updateFn) {
        const current = getAt(r.path);
        const next = updateFn(current);
        if (next === undefined) return { committed: false, snapshot: { val: () => current } };
        setAt(r.path, next);
        notify();
        return { committed: true, snapshot: { val: () => clone(next) } };
      },
      onDisconnect(r) {
        return {
          async set(value) { disconnects.set(r.path, { type: 'set', value }); },
          async remove() { disconnects.set(r.path, { type: 'remove' }); },
          async cancel() { disconnects.delete(r.path); },
        };
      },
    };

    return {
      api,
      db: {},
      /** How many onDisconnect handlers this connection has registered. */
      pendingDisconnects: () => disconnects.size,
      /** Simulate this tab closing: run its onDisconnect actions. */
      disconnect() {
        for (const [path, action] of disconnects) setAt(path, action.type === 'set' ? action.value : null);
        disconnects.clear();
        notify();
      },
    };
  }

  return {
    ...makeClient(),          // a default connection: fake.api / fake.db / fake.disconnect()
    client: makeClient,       // extra connections, one per simulated tab
    /** Read a path (as an outside observer, e.g. the dashboard). */
    get: (path) => getAt(path),
    /** Write a path from outside (e.g. the dashboard's operator). */
    write: (path, value) => { setAt(path, value); notify(); },
    /** Make every following update() fail (pass null to stop failing). */
    failWrites: (error) => { writeError = error; },
  };
}
