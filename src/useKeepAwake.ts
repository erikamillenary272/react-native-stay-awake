import { useEffect, useId } from 'react';
import { activateKeepAwake, deactivateKeepAwake } from './core';

export interface UseKeepAwakeOptions {
  /**
   * When false, the hook does nothing. Lets you toggle keep-awake without
   * conditionally calling the hook.
   * @default true
   */
  enabled?: boolean;
}

/**
 * Keep the screen awake while the calling component is mounted.
 *
 * Each hook instance gets its own reference-counted tag by default, so
 * multiple components can use it independently — the screen sleeps again
 * only after the last one unmounts.
 */
export function useKeepAwake(
  tag?: string,
  options?: UseKeepAwakeOptions
): void {
  const autoTag = useId();
  const resolvedTag = tag ?? `useKeepAwake${autoTag}`;
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!enabled) {
      return;
    }
    activateKeepAwake(resolvedTag);
    return () => {
      deactivateKeepAwake(resolvedTag);
    };
  }, [resolvedTag, enabled]);
}
