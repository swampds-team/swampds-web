import { test } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_CONFIG as CFG } from './config.js';
import { createInitialState, step, setValve, setMode, setManualCommand } from './engine.js';
import { createBridge } from './bridge.js';
import { createFakeDb } from './fakeDb.js';
import { LOCK_TTL_MS, DATA_SOURCE } from './contract.js';

/** One simulated browser tab running a twin + bridge against a shared fake database. */
function makeTab(fake, { clientId = 'tab-A', email = 'a@team.test', clock } = {}) {
  const connection = fake.client();                  // each tab has its own connection
  const tab = {
    connection,
    sim: createInitialState(),
    statuses: [],
    intents: [],
    interval: null,
    advance(ticks = 1) { for (let i = 0; i < ticks; i++) tab.sim = step(tab.sim, CFG, CFG.tickSec, () => 0.5); },
  };
  tab.bridge = createBridge({
    api: connection.api, db: connection.db, clientId, identity: { uid: `uid-${clientId}`, email },
    getSim: () => tab.sim,
    getConfig: () => CFG,
    applyIntent: (intent) => {
      tab.intents.push(intent);
      tab.sim = intent.type === 'mode'
        ? setMode(tab.sim, intent.value, 'dashboard')
        : setManualCommand(tab.sim, intent.value, 'dashboard');
    },
    onStatus: (s) => tab.statuses.push(s),
    now: () => clock.t,
    setIntervalFn: (fn) => { tab.interval = fn; return 1; },
    clearIntervalFn: () => { tab.interval = null; },
  });
  tab.last = () => tab.statuses[tab.statuses.length - 1];
  return tab;
}

const values = (obj) => Object.values(obj ?? {});

test('connecting takes the lock, reports its mode, and publishes the contract', async () => {
  const fake = createFakeDb({ sensors: { flow1: 4, flow2: 4.6, flow3: 3 }, status: { controlMode: 'manual' } });
  const clock = { t: 5_000 };
  const tab = makeTab(fake, { clock });
  tab.advance(4);

  assert.equal(await tab.bridge.start(), true);
  assert.equal(tab.last().state, 'live');

  const sensors = fake.get('sensors');
  assert.equal(sensors.flow1, tab.sim.flows.f1);
  assert.equal(sensors.lastUpdated, 5_000);
  assert.equal(fake.get('system/source'), DATA_SOURCE);
  assert.equal(fake.get('system/status'), 'NORMAL');
  assert.equal(fake.get('system/pumpState'), 'ON');
  assert.equal(fake.get('status/controlMode'), 'auto', 'twin reports its own mode over the stale hand-typed one');
  assert.equal(fake.get('twinLock/clientId'), 'tab-A');
  assert.equal(fake.get('twinLock/email'), 'a@team.test');

  clock.t += 1000; tab.advance(2);
  await tab.interval();
  assert.equal(fake.get('sensors/lastUpdated'), 6_000, 'heartbeat advances on every publish');
  assert.equal(fake.get('twinLock/heartbeat'), 6_000);
});

test('a leak reaches the dashboard: status, segment, alert and a pump-history row', async () => {
  const fake = createFakeDb();
  const clock = { t: Date.UTC(2026, 8, 8, 9, 0, 0) };
  const tab = makeTab(fake, { clock });
  await tab.bridge.start();

  const tick = async () => { clock.t += 700; tab.advance(); await tab.bridge.publishNow(); };
  for (let i = 0; i < 4; i++) await tick();                       // pump starts
  tab.sim = setValve(tab.sim, 'A', 100);                          // operator action on the twin
  for (let i = 0; i < 12; i++) await tick();                      // leak confirmed, pump cut

  assert.equal(fake.get('system/status'), 'LEAK');
  assert.equal(fake.get('system/leakSegments'), 'A');
  assert.equal(fake.get('system/pumpState'), 'OFF');

  const alerts = values(fake.get('alerts'));
  assert.ok(alerts.some((a) => a.severity === 'critical' && a.message.includes('LEAK CONFIRMED')));
  assert.ok(alerts.some((a) => a.message.includes('Pump started')), 'system pump events are published');
  assert.ok(!alerts.some((a) => a.message.includes('opened Valve')), 'operator clicks on the twin are not');
  assert.ok(alerts.every((a) => a.source === DATA_SOURCE && typeof a.timestamp === 'number' && /^\d{1,2}:\d{2} [AP]M$/.test(a.time)));

  const history = values(fake.get('pumpHistory'));
  assert.equal(history.length, 1);
  assert.match(history[0].duration, /^\d+m \d+s$/);
});

test('events from before connecting are not replayed to the dashboard', async () => {
  const fake = createFakeDb();
  const clock = { t: 1000 };
  const tab = makeTab(fake, { clock });
  tab.advance(4); tab.sim = setValve(tab.sim, 'B', 30);           // history already in the log
  await tab.bridge.start();
  assert.deepEqual(values(fake.get('alerts')), []);
});

test('restarting the twin keeps publishing its new events', async () => {
  const fake = createFakeDb();
  const clock = { t: 1000 };
  const tab = makeTab(fake, { clock });
  tab.advance(4);
  await tab.bridge.start();

  tab.sim = createInitialState();                                  // "Restart simulation": event ids begin again
  clock.t += 1000;
  await tab.bridge.publishNow();
  assert.ok(values(fake.get('alerts')).some((a) => a.message === 'Digital twin started.'));
});

test('the dashboard controls the twin: mode, then pump command', async () => {
  const fake = createFakeDb();
  const clock = { t: 1000 };
  const tab = makeTab(fake, { clock });
  tab.advance(4);
  await tab.bridge.start();

  fake.write('control/pumpCommand', 'off');                        // ignored: twin is in auto
  assert.equal(tab.sim.mode, 'auto');
  assert.deepEqual(tab.intents, []);

  fake.write('status/controlMode', 'manual');                      // dashboard toggles to manual
  assert.deepEqual(tab.intents, [{ type: 'mode', value: 'manual' }]);
  assert.equal(tab.sim.mode, 'manual');
  assert.equal(tab.sim.manualCommand, 'on', 'bumpless: the running pump keeps running');
  assert.ok(tab.sim.events[0].message.includes('(from dashboard)'));

  tab.bridge.syncControlOut();                                     // effect after the mode change
  assert.equal(fake.get('control/pumpCommand'), 'on', 'twin republishes its command instead of obeying the stale "off"');

  fake.write('control/pumpCommand', 'off');                        // now a real command
  assert.equal(tab.sim.manualCommand, 'off');
  tab.advance(2);
  assert.equal(tab.sim.pumpOn, false);
});

test('changes made on the twin are mirrored to the dashboard without ping-pong', async () => {
  const fake = createFakeDb();
  const clock = { t: 1000 };
  const tab = makeTab(fake, { clock });
  tab.advance(4);
  await tab.bridge.start();

  tab.sim = setMode(tab.sim, 'manual');
  tab.bridge.syncControlOut();
  assert.equal(fake.get('status/controlMode'), 'manual');
  assert.equal(fake.get('control/pumpCommand'), 'on');

  tab.sim = setManualCommand(tab.sim, 'off');
  tab.bridge.syncControlOut();
  assert.equal(fake.get('control/pumpCommand'), 'off');
  assert.deepEqual(tab.intents, [], 'the twin never re-applied its own writes');
});

test('only one twin publishes: a fresh lock blocks, a stale one is taken, force takes over', async () => {
  const fake = createFakeDb();
  const clock = { t: 100_000 };
  const a = makeTab(fake, { clientId: 'tab-A', email: 'alice@team.test', clock });
  const b = makeTab(fake, { clientId: 'tab-B', email: 'bob@team.test', clock });
  await a.bridge.start();

  clock.t += 2000;
  assert.equal(await b.bridge.start(), false);
  assert.equal(b.last().state, 'locked');
  assert.equal(b.last().lockedBy, 'alice@team.test');
  assert.equal(fake.get('twinLock/clientId'), 'tab-A');

  assert.equal(await b.bridge.start({ force: true }), true, 'takeover');
  assert.equal(b.last().state, 'live');
  assert.equal(fake.get('twinLock/clientId'), 'tab-B');
  assert.equal(a.bridge.isRunning(), false, 'the displaced twin stops itself');
  assert.equal(a.statuses.some((s) => s.state === 'displaced'), true);

  // a crashed publisher: heartbeat goes stale, so anyone can take over without force
  const c = makeTab(fake, { clientId: 'tab-C', email: 'carol@team.test', clock });
  clock.t += LOCK_TTL_MS + 1;
  assert.equal(await c.bridge.start(), true);
});

test('disconnecting releases the lock and marks the data source offline', async () => {
  const fake = createFakeDb();
  const clock = { t: 1000 };
  const tab = makeTab(fake, { clock });
  await tab.bridge.start();
  assert.equal(fake.get('system/online'), true);

  await tab.bridge.stop();
  assert.equal(fake.get('twinLock'), null);
  assert.equal(fake.get('system/online'), false);
  assert.equal(tab.interval, null);
  assert.equal(tab.last().state, 'off');
});

test('closing the tab (connection drop) marks the source offline', async () => {
  const fake = createFakeDb();
  const tab = makeTab(fake, { clock: { t: 1000 } });
  await tab.bridge.start();
  assert.equal(fake.get('system/online'), true);
  tab.connection.disconnect();
  assert.equal(fake.get('system/online'), false);
});

test('a displaced twin cannot mark the new owner offline when its own tab closes', async () => {
  const fake = createFakeDb();
  const clock = { t: 1000 };
  const a = makeTab(fake, { clientId: 'tab-A', clock });
  const b = makeTab(fake, { clientId: 'tab-B', clock });
  await a.bridge.start();
  await b.bridge.start({ force: true });
  await b.bridge.publishNow();
  assert.equal(fake.get('system/online'), true);
  assert.equal(a.connection.pendingDisconnects(), 0, 'the displaced twin cancelled its handler');

  a.connection.disconnect();                       // the old tab now closes
  assert.equal(fake.get('system/online'), true, 'the new owner is still online');
  b.connection.disconnect();                       // the real owner closing does mark it offline
  assert.equal(fake.get('system/online'), false);
});

test('"clear previous data" empties alerts and pump history; otherwise they are kept', async () => {
  const seed = { alerts: { x: { message: 'old' } }, pumpHistory: { y: { date: 'old' } } };

  const keep = createFakeDb(seed);
  await makeTab(keep, { clock: { t: 1 } }).bridge.start();
  assert.ok(keep.get('alerts/x') && keep.get('pumpHistory/y'));

  const wipe = createFakeDb(seed);
  await makeTab(wipe, { clock: { t: 1 } }).bridge.start({ clearPrevious: true });
  assert.equal(wipe.get('alerts/x'), null);
  assert.equal(wipe.get('pumpHistory/y'), null);
});

test('a database error stops publishing and is reported, not swallowed', async () => {
  const fake = createFakeDb();
  const clock = { t: 1000 };
  const tab = makeTab(fake, { clock });
  await tab.bridge.start();

  fake.failWrites(new Error('PERMISSION_DENIED'));
  tab.interval();                                                  // the interval handler reports failures via status
  fake.failWrites(null);

  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(tab.last().state, 'error');
  assert.match(tab.last().message, /PERMISSION_DENIED/);
  assert.equal(tab.bridge.isRunning(), false);
});
