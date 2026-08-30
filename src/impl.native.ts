import NativeStayAwake from './NativeStayAwake';

export function isAvailable(): boolean {
  return true;
}

export function activate(): void {
  NativeStayAwake.setActivated(true);
}

export function deactivate(): void {
  NativeStayAwake.setActivated(false);
}

// Native platforms never release the wake lock on their own,
// so there is nothing to report.
export function setReleaseHandler(_handler: (() => void) | null): void {}
