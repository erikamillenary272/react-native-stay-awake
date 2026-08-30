import * as impl from './impl';

const DEFAULT_TAG = 'default';

const activeTags = new Set<string>();
const releaseListeners = new Set<() => void>();

impl.setReleaseHandler(() => {
  for (const listener of releaseListeners) {
    listener();
  }
});

/**
 * Keep the screen awake. Activations are reference-counted by `tag`:
 * the screen is allowed to sleep again only once every tag has been
 * deactivated, so independent components can't stomp on each other.
 */
export function activateKeepAwake(tag: string = DEFAULT_TAG): void {
  const wasIdle = activeTags.size === 0;
  activeTags.add(tag);
  if (wasIdle) {
    impl.activate();
  }
}

/**
 * Release one tag's hold on the screen. The screen sleeps normally again
 * once no tags remain active.
 */
export function deactivateKeepAwake(tag: string = DEFAULT_TAG): void {
  activeTags.delete(tag);
  if (activeTags.size === 0) {
    impl.deactivate();
  }
}

/** Release every tag at once. */
export function deactivateAllKeepAwake(): void {
  activeTags.clear();
  impl.deactivate();
}

/**
 * Whether keep-awake is currently active — for the given tag, or for
 * any tag when called without arguments.
 */
export function isKeepAwakeActive(tag?: string): boolean {
  return tag == null ? activeTags.size > 0 : activeTags.has(tag);
}

/** The tags currently holding the screen awake. */
export function getActiveKeepAwakeTags(): string[] {
  return [...activeTags];
}

/**
 * Whether the platform can keep the screen awake. Always true on iOS and
 * Android; true on web only when the Screen Wake Lock API exists.
 */
export function isKeepAwakeAvailable(): boolean {
  return impl.isAvailable();
}

/**
 * Subscribe to wake locks being released by the platform rather than by
 * you (web only — e.g. battery saver or the tab being hidden). The lock is
 * re-acquired automatically when the page becomes visible again.
 */
export function addKeepAwakeReleasedListener(listener: () => void): {
  remove: () => void;
} {
  releaseListeners.add(listener);
  return {
    remove: () => {
      releaseListeners.delete(listener);
    },
  };
}
