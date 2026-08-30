// Web implementation backed by the Screen Wake Lock API.
// This file is also the fallback for any non-native platform; every entry
// point degrades to a no-op when the API is unavailable.

type WakeLockSentinelLike = {
  release(): Promise<void>;
  addEventListener(type: 'release', listener: () => void): void;
};

const nav: any = (globalThis as any).navigator;
const doc: any = (globalThis as any).document;

let sentinel: WakeLockSentinelLike | null = null;
let wantActive = false;
let requestGeneration = 0;
let releaseHandler: (() => void) | null = null;
let warned = false;

export function isAvailable(): boolean {
  return nav != null && 'wakeLock' in nav;
}

async function acquire(): Promise<void> {
  const generation = ++requestGeneration;
  try {
    const lock: WakeLockSentinelLike = await nav.wakeLock.request('screen');
    if (!wantActive || generation !== requestGeneration) {
      // Deactivated (or re-requested) while the request was in flight.
      lock.release().catch(() => {});
      return;
    }
    sentinel = lock;
    lock.addEventListener('release', () => {
      if (sentinel === lock) {
        sentinel = null;
      }
      // Only surface releases the caller didn't ask for (tab hidden,
      // battery saver, etc.). Re-acquisition happens on visibilitychange.
      if (wantActive) {
        releaseHandler?.();
      }
    });
  } catch {
    // NotAllowedError: page not visible, battery saver, or permissions
    // policy. Stay in "want active" state and retry on visibilitychange.
    if (wantActive && generation === requestGeneration) {
      releaseHandler?.();
    }
  }
}

function onVisibilityChange(): void {
  if (wantActive && sentinel == null && doc?.visibilityState === 'visible') {
    acquire();
  }
}

export function activate(): void {
  if (!isAvailable()) {
    if (!warned && typeof console !== 'undefined') {
      warned = true;
      console.warn(
        'react-native-stay-awake: the Screen Wake Lock API is not available ' +
          'in this environment; keep-awake calls are no-ops.'
      );
    }
    return;
  }
  if (wantActive) {
    return;
  }
  wantActive = true;
  doc?.addEventListener('visibilitychange', onVisibilityChange);
  acquire();
}

export function deactivate(): void {
  if (!wantActive) {
    return;
  }
  wantActive = false;
  requestGeneration++;
  doc?.removeEventListener('visibilitychange', onVisibilityChange);
  sentinel?.release().catch(() => {});
  sentinel = null;
}

export function setReleaseHandler(handler: (() => void) | null): void {
  releaseHandler = handler;
}
