import { activateKeepAwake, deactivateKeepAwake } from './core';
import { useKeepAwake } from './useKeepAwake';

export interface KeepAwakeProps {
  /** Reference-counting tag; defaults to a unique tag per instance. */
  tag?: string;
  /** Set false to let the screen sleep without unmounting. @default true */
  enabled?: boolean;
}

/**
 * Keeps the screen awake while mounted. Renders nothing.
 *
 * Also carries `KeepAwake.activate()` / `KeepAwake.deactivate()` statics as a
 * drop-in replacement for the deprecated `react-native-keep-awake` package.
 */
export function KeepAwake({ tag, enabled = true }: KeepAwakeProps): null {
  useKeepAwake(tag, { enabled });
  return null;
}

KeepAwake.activate = activateKeepAwake;
KeepAwake.deactivate = deactivateKeepAwake;
