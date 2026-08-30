/**
 * Standalone Jest mock for react-native-stay-awake.
 *
 * Usage — in your Jest config:
 *   "moduleNameMapper": {
 *     "^react-native-stay-awake$": "react-native-stay-awake/jest/mock"
 *   }
 *
 * or in a test/setup file:
 *   jest.mock('react-native-stay-awake', () =>
 *     require('react-native-stay-awake/jest/mock')
 *   );
 *
 * Mirrors the real reference-counting behavior in memory, without touching
 * any native module, so assertions like isKeepAwakeActive() work in tests.
 */
const { useEffect, useId } = require('react');

const DEFAULT_TAG = 'default';
const activeTags = new Set();

function activateKeepAwake(tag = DEFAULT_TAG) {
  activeTags.add(tag);
}

function deactivateKeepAwake(tag = DEFAULT_TAG) {
  activeTags.delete(tag);
}

function deactivateAllKeepAwake() {
  activeTags.clear();
}

function isKeepAwakeActive(tag) {
  return tag == null ? activeTags.size > 0 : activeTags.has(tag);
}

function getActiveKeepAwakeTags() {
  return [...activeTags];
}

function isKeepAwakeAvailable() {
  return true;
}

function addKeepAwakeReleasedListener() {
  return { remove: () => {} };
}

function useKeepAwake(tag, options) {
  const autoTag = useId();
  const resolvedTag = tag != null ? tag : `useKeepAwake${autoTag}`;
  const enabled = options && options.enabled != null ? options.enabled : true;
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    activateKeepAwake(resolvedTag);
    return () => deactivateKeepAwake(resolvedTag);
  }, [resolvedTag, enabled]);
}

function KeepAwake(props) {
  useKeepAwake(props && props.tag, {
    enabled: !props || props.enabled !== false,
  });
  return null;
}
KeepAwake.activate = activateKeepAwake;
KeepAwake.deactivate = deactivateKeepAwake;

module.exports = {
  __esModule: true,
  activateKeepAwake,
  deactivateKeepAwake,
  deactivateAllKeepAwake,
  isKeepAwakeActive,
  getActiveKeepAwakeTags,
  isKeepAwakeAvailable,
  addKeepAwakeReleasedListener,
  useKeepAwake,
  KeepAwake,
  default: KeepAwake,
};
