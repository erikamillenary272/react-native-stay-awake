# react-native-stay-awake

[![npm version](https://img.shields.io/npm/v/react-native-stay-awake.svg)](https://www.npmjs.com/package/react-native-stay-awake)
[![npm downloads](https://img.shields.io/npm/dm/react-native-stay-awake.svg)](https://www.npmjs.com/package/react-native-stay-awake)
[![CI](https://github.com/intellij-Shivam/react-native-stay-awake/actions/workflows/ci.yml/badge.svg)](https://github.com/intellij-Shivam/react-native-stay-awake/actions/workflows/ci.yml)
[![types](https://img.shields.io/npm/types/react-native-stay-awake.svg)](https://www.npmjs.com/package/react-native-stay-awake)
[![license](https://img.shields.io/npm/l/react-native-stay-awake.svg)](LICENSE)

**Keep the screen awake / keep the screen on in React Native** — prevent the screen from sleeping, dimming, or timing out while your app shows video, navigation, downloads, recipes, or a workout. Built for the **New Architecture** (TurboModule) with a hooks-first API, **tag-based reference counting**, and **web support** via the Screen Wake Lock API. Works on **iOS, Android, Web, tvOS, and visionOS** — with no Expo dependency.

A modern replacement for the deprecated [`react-native-keep-awake`](https://github.com/corbt/react-native-keep-awake), and an [`expo-keep-awake`](https://docs.expo.dev/versions/latest/sdk/keep-awake/) alternative for bare React Native apps that don't want `expo-modules-core`.

## Why this library?

| | `react-native-stay-awake` | `react-native-keep-awake` (deprecated) | `expo-keep-awake` | `@sayem314/react-native-keep-awake` |
| --- | :---: | :---: | :---: | :---: |
| New Architecture (TurboModule) | ✅ | ❌ | ✅ | ✅ |
| Works without Expo modules | ✅ | ✅ | ❌ (needs `expo-modules-core`) | ✅ |
| Reference counting (tags) | ✅ | ❌ | ✅ | ❌ (components cancel each other) |
| `useKeepAwake()` hook | ✅ | ❌ | ✅ | ✅ |
| Unique auto-tag per hook instance | ✅ | — | ✅ | ❌ |
| Web (Screen Wake Lock API) | ✅ | ❌ | ✅ | ❌ (empty stub) |
| Auto re-acquire wake lock on tab focus (web) | ✅ | — | ❌ | — |
| Query active state / tags from JS | ✅ | ❌ | ❌ (native-only, unexported) | ❌ |
| Survives Android activity recreation | ✅ | ❌ | ❌ (tag set survives, flag doesn't) | ❌ |
| Safe when Android activity is null | ✅ | ❌ (crashes) | ✅ (since 55.0.7) | ✅ |
| Idempotent deactivate everywhere | ✅ | ❌ | ❌ (web throws on unknown tag) | ✅ |
| Cleans up on JS reload | ✅ | ❌ (state leaks) | ✅ | ❌ |
| Shipped Jest mock | ✅ | ❌ | ❌ | ❌ |
| TypeScript | ✅ | ❌ (types never published) | ✅ | ✅ |
| tvOS / visionOS podspec support | ✅ / ✅ | ❌ (removed) | ✅ / ❌ | ❌ |

## Installation

```sh
npm install react-native-stay-awake
# or
yarn add react-native-stay-awake
```

Then rebuild your app (`cd ios && pod install` for bare iOS projects). Autolinking does the rest — no manual linking, no `MainApplication` edits.

> Requires React Native 0.76+ (New Architecture). No Expo dependency, but works fine inside Expo dev clients too.

## Usage

### Hook (recommended)

```tsx
import { useKeepAwake } from 'react-native-stay-awake';

function VideoPlayer() {
  useKeepAwake(); // screen stays awake while this component is mounted
  return <Video />;
}
```

Each hook instance gets its own reference-counted tag, so multiple components can keep the screen awake independently — the screen is allowed to sleep only after the **last** one unmounts. No more "component A unmounted and turned off the wake lock that component B still needed".

Toggle without unmounting:

```tsx
useKeepAwake('player', { enabled: isPlaying });
```

### Imperative API

```ts
import {
  activateKeepAwake,
  deactivateKeepAwake,
  deactivateAllKeepAwake,
  isKeepAwakeActive,
  getActiveKeepAwakeTags,
  isKeepAwakeAvailable,
} from 'react-native-stay-awake';

activateKeepAwake('download');       // hold with a tag
activateKeepAwake('navigation');     // independent hold
deactivateKeepAwake('download');     // screen still awake — 'navigation' holds it
deactivateKeepAwake('navigation');   // now the screen can sleep

isKeepAwakeActive();                 // true if any tag is active
isKeepAwakeActive('download');       // per-tag query
getActiveKeepAwakeTags();            // ['navigation', ...] — great for debugging
deactivateAllKeepAwake();            // nuke every hold
isKeepAwakeAvailable();              // false only on web without the Wake Lock API
```

Calling `activateKeepAwake()` with no tag uses a shared `'default'` tag, matching the old `react-native-keep-awake` behavior.

### Component (drop-in for the deprecated package)

```tsx
import KeepAwake from 'react-native-stay-awake';

// declarative
<KeepAwake />
<KeepAwake tag="player" enabled={isPlaying} />

// old-style statics still work
KeepAwake.activate();
KeepAwake.deactivate();
```

### Web

On web the library uses the [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API). The browser releases wake locks when the tab is hidden; this library **re-acquires the lock automatically** when the tab becomes visible again, so you don't have to handle `visibilitychange` yourself.

You can observe OS/browser-initiated releases (battery saver, tab hidden):

```ts
import { addKeepAwakeReleasedListener } from 'react-native-stay-awake';

const sub = addKeepAwakeReleasedListener(() => {
  console.log('wake lock was released by the platform');
});
sub.remove();
```

In unsupported browsers every call is a safe no-op (`isKeepAwakeAvailable()` returns `false`).

## API reference

| Export | Description |
| --- | --- |
| `useKeepAwake(tag?, { enabled? })` | Keep the screen awake while the component is mounted. |
| `<KeepAwake tag? enabled? />` | Component version; renders nothing. Default export. |
| `activateKeepAwake(tag?)` | Add a hold for `tag` (default `'default'`). |
| `deactivateKeepAwake(tag?)` | Release the hold for `tag`. Screen sleeps when no holds remain. |
| `deactivateAllKeepAwake()` | Release every hold. |
| `isKeepAwakeActive(tag?)` | Whether any hold (or a specific tag) is active. |
| `getActiveKeepAwakeTags()` | List of active tags. |
| `isKeepAwakeAvailable()` | Whether the platform can keep the screen awake. |
| `addKeepAwakeReleasedListener(cb)` | Web only: platform released the lock. Returns `{ remove() }`. |

## Migrating

**From `react-native-keep-awake` (deprecated):** the default export is a drop-in — `<KeepAwake />`, `KeepAwake.activate()`, and `KeepAwake.deactivate()` all work unchanged. Just swap the import:

```diff
- import KeepAwake from 'react-native-keep-awake';
+ import KeepAwake from 'react-native-stay-awake';
```

**From `expo-keep-awake`:** same tag model, but the API is synchronous — no promises to await, and deactivating an unknown tag is a safe no-op instead of a thrown error:

```diff
- import { useKeepAwake, activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
+ import { useKeepAwake, activateKeepAwake, deactivateKeepAwake } from 'react-native-stay-awake';

  useKeepAwake();                 // unchanged
- await activateKeepAwakeAsync('tag');
+ activateKeepAwake('tag');
```

## Testing with Jest

A standalone mock ships with the package ([old package's #33](https://github.com/corbt/react-native-keep-awake/issues/33)). It mirrors the real reference-counting logic in memory, so `isKeepAwakeActive()` assertions work in tests:

```json
{
  "jest": {
    "moduleNameMapper": {
      "^react-native-stay-awake$": "react-native-stay-awake/jest/mock"
    }
  }
}
```

## How it works

- **iOS / tvOS / visionOS** — `UIApplication.isIdleTimerDisabled`, always set on the main thread. The logic is written in Swift (`StayAwakeImpl.swift`); a thin ObjC++ shim conforms to the codegen'd TurboModule spec and forwards to it. Reset automatically when the React instance reloads, so a Fast Refresh never leaves your screen pinned awake.
- **Android** — `FLAG_KEEP_SCREEN_ON` on the current activity's window, applied on the UI thread. Null-activity safe (no startup crashes), and the flag is re-applied on `onHostResume`, so it survives activity recreation and multi-activity apps. No `WAKE_LOCK` permission needed — the window flag is permission-free.
- **Web** — `navigator.wakeLock.request('screen')` with automatic re-acquisition on `visibilitychange`.
- **Reference counting** lives in JS and is shared across all platforms, so behavior is identical everywhere; the native side is a dumb, stateless on/off switch that also cleans up after itself on reload (`invalidate`).

## Lessons from the deprecated package

This library was designed around the actual issue history of `react-native-keep-awake`:

| Old issue | Fixed here by |
| --- | --- |
| [#81](https://github.com/corbt/react-native-keep-awake/issues/81) New Architecture support | TurboModule with codegen |
| [#44](https://github.com/corbt/react-native-keep-awake/pull/44) Multiple `<KeepAwake />` components fight each other | Tag-based reference counting |
| [#42](https://github.com/corbt/react-native-keep-awake/issues/42) No way to query activity status | `isKeepAwakeActive()`, `getActiveKeepAwakeTags()` |
| [#68](https://github.com/corbt/react-native-keep-awake/issues/68), [#34](https://github.com/corbt/react-native-keep-awake/issues/34) iOS crash: UI API called from background thread | Always dispatched to the main thread |
| [#15](https://github.com/corbt/react-native-keep-awake/issues/15), [#62](https://github.com/corbt/react-native-keep-awake/issues/62) Android state lost after backgrounding / activity recreation | Flag re-applied on `onHostResume` |
| [#63](https://github.com/corbt/react-native-keep-awake/issues/63) Idempotency undocumented | Documented tag semantics + tests |
| [#71](https://github.com/corbt/react-native-keep-awake/issues/71), [#67](https://github.com/corbt/react-native-keep-awake/pull/67) Missing/broken TypeScript types | Written in TypeScript |
| [#52](https://github.com/corbt/react-native-keep-awake/pull/52) StrictMode-unsafe lifecycle | Hooks (`useEffect`) throughout |
| [#66](https://github.com/corbt/react-native-keep-awake/issues/66) iOS idle timer leaks across reloads ("always active") | Native `invalidate()` resets state on every reload |
| [#33](https://github.com/corbt/react-native-keep-awake/issues/33) Jest mock support | `react-native-stay-awake/jest` mock |
| [#21](https://github.com/corbt/react-native-keep-awake/issues/21)–[#23](https://github.com/corbt/react-native-keep-awake/pull/23) tvOS link failures, manual linking pain | Autolinking; tvOS/visionOS in the podspec |

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
