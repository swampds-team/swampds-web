# SWAMPDS

Smart Water Management & Pipeline Leak Detection System — a web dashboard plus a browser-based **digital twin** that stands in for the physical prototype (ESP32, three inline flow sensors, relay, pump).

Water path: `SOURCE TANK → PUMP → F1 → VALVE A → F2 → VALVE B → F3 → DELIVERY TANK`. A leak is declared when the flow difference between neighbouring sensors stays above a tolerance for a set time (compare-and-persist), which also identifies the affected segment and cuts the pump.

## Two ways to use it

| | Route | Login | Firebase |
|---|---|---|---|
| **Digital twin** (simulation) | `/twin` | none (public) | not loaded unless you click *Dashboard link → Connect* |
| **Operator dashboard** | `/dashboard` and the other pages | required | reads and writes live data |

### Linking the twin to the dashboard

On `/twin`, *Dashboard link → Connect* (needs a team login) makes the twin act as the device:

- it publishes sensor readings, status, alerts and pump history to Firebase about once a second;
- it obeys the dashboard's Auto/Manual and Start/Stop controls;
- only one twin can publish at a time (a lock); *Take over* is available if another is stuck;
- the dashboard shows a **Simulated data** banner while the twin is connected, and an **offline** banner if it stops sending.

Keep the twin tab open and visible while linked — browsers slow down background tabs.

## Firebase data layout

Defined in [`src/twin/contract.js`](src/twin/contract.js). Real hardware should follow the same layout.

| Path | Written by | Value |
|---|---|---|
| `sensors/flow1`, `flow2`, `flow3` | device | L/min |
| `sensors/waterLevelPercent`, `waterLevelCm` | device | delivery tank level |
| `sensors/lastUpdated` | device | ms epoch; **changes on every update** (heartbeat) |
| `system/status` | device | `NORMAL` \| `WARNING` \| `LEAK` |
| `system/pumpState` | device | `ON` \| `OFF` |
| `system/pumpMode` | device | mirror of `status/controlMode` |
| `system/source` | device | e.g. `digital-twin` — dashboard warns if it is the twin |
| `system/online` | device | `true`; set to `false` on clean disconnect |
| `system/leakSegments` | device | `A`, `B` or `A,B` (absent when no leak) |
| `alerts/<id>` | device | `{ time, severity, message, timestamp }` |
| `pumpHistory/<id>` | device | `{ date, start, end, duration, startTimestamp }` |
| `status/controlMode` | dashboard | `auto` \| `manual` |
| `control/pumpCommand` | dashboard | `on` \| `off` (manual mode only) |
| `twinLock` | twin | single-publisher lock |

## Develop

```bash
npm install
npm run dev        # http://localhost:5173  (twin: /twin)
npm test           # simulation engine, data contract and Firebase bridge tests
npm run build
```

Create `.env.local` with your Firebase web-app settings (never commit it):

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

`/twin` works without any of these; only the dashboard and *Dashboard link* need them.

## Layout

- `src/twin/engine.js` — pure simulation (physics, detection, pump control)
- `src/twin/config.js` — every threshold; **tolerance and persistence are placeholders** until the project spec's values are confirmed
- `src/twin/contract.js`, `bridge.js` — the Firebase data contract and the twin↔Firebase link
- `src/twin/*.jsx` — the `/twin` page
- `src/data/swampdsData.js` — the dashboard's data layer

## Firebase setup checklist

- Realtime Database rules: reads may be public, but writes should require `auth != null`.
- Authentication → Settings → User actions: turn off **Enable create (sign-up)**; accounts are created manually in the console.
- Authentication → Sign-in method: keep **Anonymous** disabled (it would satisfy `auth != null`).

## Deploy

Vercel (SPA rewrite in `vercel.json`). Set the `VITE_FIREBASE_*` variables in the project settings.
