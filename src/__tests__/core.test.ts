// No initializer: the mock factory below assigns this during module import,
// which runs before this line would execute.
let mockReleaseHandler: (() => void) | null | undefined;

jest.mock('../impl', () => ({
  isAvailable: jest.fn(() => true),
  activate: jest.fn(),
  deactivate: jest.fn(),
  setReleaseHandler: jest.fn((handler: (() => void) | null) => {
    mockReleaseHandler = handler;
  }),
}));

import * as impl from '../impl';
import {
  activateKeepAwake,
  addKeepAwakeReleasedListener,
  deactivateAllKeepAwake,
  deactivateKeepAwake,
  getActiveKeepAwakeTags,
  isKeepAwakeActive,
} from '../core';

const mockImpl = impl as jest.Mocked<typeof impl>;

afterEach(() => {
  deactivateAllKeepAwake();
  jest.clearAllMocks();
});

describe('reference counting', () => {
  it('activates the platform impl only on the first tag', () => {
    activateKeepAwake('a');
    activateKeepAwake('b');
    expect(mockImpl.activate).toHaveBeenCalledTimes(1);
  });

  it('deactivates only when the last tag is released', () => {
    activateKeepAwake('a');
    activateKeepAwake('b');
    deactivateKeepAwake('a');
    expect(mockImpl.deactivate).not.toHaveBeenCalled();
    deactivateKeepAwake('b');
    expect(mockImpl.deactivate).toHaveBeenCalledTimes(1);
  });

  it('is idempotent per tag', () => {
    activateKeepAwake('a');
    activateKeepAwake('a');
    deactivateKeepAwake('a');
    expect(mockImpl.deactivate).toHaveBeenCalledTimes(1);
  });

  it('uses a default tag when none is given', () => {
    activateKeepAwake();
    expect(isKeepAwakeActive()).toBe(true);
    deactivateKeepAwake();
    expect(isKeepAwakeActive()).toBe(false);
  });

  it('deactivating an unknown tag does not release other holders', () => {
    activateKeepAwake('a');
    deactivateKeepAwake('never-activated');
    expect(mockImpl.deactivate).not.toHaveBeenCalled();
    expect(isKeepAwakeActive('a')).toBe(true);
  });
});

describe('state queries', () => {
  it('reports per-tag and global activity', () => {
    activateKeepAwake('video');
    expect(isKeepAwakeActive('video')).toBe(true);
    expect(isKeepAwakeActive('other')).toBe(false);
    expect(isKeepAwakeActive()).toBe(true);
    expect(getActiveKeepAwakeTags()).toEqual(['video']);
  });

  it('deactivateAllKeepAwake clears every tag', () => {
    activateKeepAwake('a');
    activateKeepAwake('b');
    deactivateAllKeepAwake();
    expect(getActiveKeepAwakeTags()).toEqual([]);
    expect(mockImpl.deactivate).toHaveBeenCalled();
  });
});

describe('release listeners', () => {
  it('notifies subscribers when the platform releases the lock', () => {
    expect(mockReleaseHandler).toBeInstanceOf(Function);

    const listener = jest.fn();
    const subscription = addKeepAwakeReleasedListener(listener);
    mockReleaseHandler?.();
    expect(listener).toHaveBeenCalledTimes(1);

    subscription.remove();
    mockReleaseHandler?.();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
