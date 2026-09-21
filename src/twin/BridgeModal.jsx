import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Radio, X, LogIn, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

const INPUT =
  'w-full px-3 py-2 min-h-[44px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 ' +
  'text-base sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500'; // 16px on phones: smaller text makes iOS zoom in
const PRIMARY =
  'px-4 py-2 min-h-[44px] rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer disabled:opacity-50';
const SECONDARY =
  'px-4 py-2 min-h-[44px] rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 ' +
  'hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer';

function Notice({ tone, icon: Icon, children }) {
  const tones = {
    warn: 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300',
    bad: 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300',
    good: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300',
  };
  return (
    <div className={`p-3 rounded-xl border flex items-start gap-2 text-xs ${tones[tone]}`}>
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

function SignInForm({ error, onSubmit }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(email, password); }}
      className="space-y-3"
    >
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Publishing writes to the dashboard's database, so it needs a team login (the same one used for the operator dashboard).
      </p>
      {error && <Notice tone="bad" icon={AlertTriangle}>{error}</Notice>}
      <div>
        <label htmlFor="bridge-email" className="block text-xs font-medium mb-1">Email</label>
        <input id="bridge-email" type="email" required autoComplete="email" value={email}
          onChange={(e) => setEmail(e.target.value)} className={INPUT} />
      </div>
      <div>
        <label htmlFor="bridge-password" className="block text-xs font-medium mb-1">Password</label>
        <input id="bridge-password" type="password" required autoComplete="current-password" value={password}
          onChange={(e) => setPassword(e.target.value)} className={INPUT} />
      </div>
      <button type="submit" className={`${PRIMARY} inline-flex items-center gap-1.5`}>
        <LogIn className="w-3.5 h-3.5" /> Sign in &amp; connect
      </button>
    </form>
  );
}

/**
 * Connect / disconnect the twin from the operator dashboard.
 * @param {{ open: boolean, onClose: () => void, bridge: ReturnType<import('./useFirebaseBridge.js').useFirebaseBridge> }} props
 */
export default function BridgeModal({ open, onClose, bridge }) {
  const [clearPrevious, setClearPrevious] = useState(false);
  if (!open) return null;

  const { status, connect, signIn, takeOver, disconnect } = bridge;
  const busy = ['loading', 'connecting'].includes(status.state);

  let body;
  switch (status.state) {
    case 'live':
      body = (
        <>
          <Notice tone="good" icon={CheckCircle2}>
            <strong>Connected.</strong> The operator dashboard is now showing this twin's readings, alerts and pump
            history, and its Auto/Manual and Start/Stop controls drive this twin.
            {status.lastPublishAt && (
              <span className="block mt-1 opacity-80">
                Last update sent {new Date(status.lastPublishAt).toLocaleTimeString()}.
              </span>
            )}
          </Notice>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Keep this tab open and visible: the dashboard shows the twin as offline if it stops sending. The dashboard
            labels the data as simulated while the twin is connected.
          </p>
          <button onClick={disconnect} className={SECONDARY}>Disconnect</button>
        </>
      );
      break;
    case 'signin':
      body = <SignInForm error={status.error} onSubmit={signIn} />;
      break;
    case 'locked':
      body = (
        <>
          <Notice tone="warn" icon={AlertTriangle}>
            Another twin is already publishing ({status.lockedBy}). Only one can publish at a time, otherwise they
            overwrite each other.
          </Notice>
          <div className="flex gap-2">
            <button onClick={takeOver} className={PRIMARY}>Take over</button>
            <button onClick={disconnect} className={SECONDARY}>Cancel</button>
          </div>
        </>
      );
      break;
    case 'displaced':
      body = (
        <>
          <Notice tone="warn" icon={AlertTriangle}>
            {status.lockedBy} took over publishing, so this twin has stopped sending data to the dashboard.
          </Notice>
          <button onClick={() => connect({ clearPrevious: false })} className={SECONDARY}>Reconnect</button>
        </>
      );
      break;
    case 'error':
      body = (
        <>
          <Notice tone="bad" icon={AlertTriangle}>{status.message}</Notice>
          <button onClick={() => connect({ clearPrevious })} className={SECONDARY}>Try again</button>
        </>
      );
      break;
    default:
      body = busy ? (
        <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" /> Connecting…
        </p>
      ) : (
        <>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Makes the twin act as the device (the ESP32 stand-in): it sends its sensor readings, status, alerts and
            pump history to Firebase, and obeys the dashboard's mode and pump commands. Firebase is only loaded if you
            connect.
          </p>
          <label className="flex items-start gap-3 min-h-[44px] text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
            <input type="checkbox" checked={clearPrevious} onChange={(e) => setClearPrevious(e.target.checked)}
              className="mt-0.5 w-5 h-5 flex-shrink-0" />
            <span>Start with a clean slate: clear the dashboard's existing alerts and pump history.</span>
          </label>
          <button onClick={() => connect({ clearPrevious })} className={PRIMARY}>Connect</button>
        </>
      );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
      <div
        role="dialog" aria-modal="true" aria-label="Dashboard link"
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-sm">Dashboard link</span>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-10 h-10 -m-2 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {body}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <Link to="/login" className="inline-flex items-center min-h-[40px] text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
              Open the operator dashboard &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
