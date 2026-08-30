# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`react-native-stay-awake` — a keep-screen-awake library for React Native, built as a New Architecture TurboModule (module name `StayAwake`, codegen spec `StayAwakeSpec`). It is a maintained replacement for the deprecated `corbt/react-native-keep-awake`; the README's comparison and "Lessons from the deprecated package" tables cite specific upstream issues and must stay accurate — don't edit claims there without verifying against the linked issues or competitor source.

## Commands

Yarn 4 via Corepack (`packageManager` in package.json). Never commit a `.yarn/` folder.

```sh
yarn                  # install (workspace root + example)
yarn test             # jest unit tests for the JS core
yarn jest -t "idempotent"   # run a single test by name
yarn typecheck        # tsc (includes tests and web impl)
yarn lint --fix       # eslint + prettier
yarn prepare          # builder-bob build to lib/ (esm + types)
yarn example ios      # run example app (also: android, start, web)
```

Validate codegen after changing `src/NativeStayAwake.ts` without a full native build:

```sh
node example/node_modules/react-native/scripts/generate-codegen-artifacts.js -p example -t all -o /tmp/codegen-out
```

To compile the Android library alone: `cd example/android && ./gradlew :react-native-stay-awake:compileDebugKotlin`.

### Releasing

Published to npm as `react-native-stay-awake` (unscoped, public; first release 1.0.0). The flow:

1. `npm version <x.y.z> --no-git-tag-version`, commit (`chore: release x.y.z`), push.
2. Wait for CI to go green (`gh run watch`) — pushes cancel in-progress runs, so always check the run for the latest commit.
3. `npm publish` — the account has 2FA, so the user must supply `--otp=<code>`; the `prepare` script rebuilds `lib/` automatically. Verify with `npm view react-native-stay-awake version`.
4. `git tag v<x.y.z> && git push origin v<x.y.z>`, then `gh release create v<x.y.z>` with notes.

CI runs Yarn 4 via a `corepack enable` step in `.github/actions/setup/action.yml` — required because `.yarn/` is not committed.

### iOS pod install gotcha

This checkout lives under a path containing a space (`Open Source/`), which breaks RN 0.85's prebuilt-tarball resolution (`URI::File.build` in `scripts/cocoapods/rncore.rb` and `rndependencies.rb` inside `example/node_modules/react-native`). After any reinstall of node_modules, `pod install` fails until those four `URI::File.build(path: destinationDebug)` call sites are wrapped with `URI::DEFAULT_PARSER.escape(...)`. CI is unaffected (no spaces in runner paths).

## Architecture

The core invariant: **all state lives in JS; the native modules are stateless on/off switches.** This keeps behavior identical across iOS/Android/web and makes the reference counting unit-testable.

Layering in `src/` (dependency order):

1. `NativeStayAwake.ts` — codegen spec. One method: `setActivated(boolean)`. Changing it requires updating BOTH `ios/StayAwake.mm`/`ios/StayAwakeImpl.swift` and `android/.../StayAwakeModule.kt`, then re-validating codegen.
2. `impl.native.ts` / `impl.ts` — platform switch via Metro's `.native.ts` resolution. `impl.ts` is the web/default branch (Screen Wake Lock API with auto re-acquire on `visibilitychange`; safe no-op when unsupported). Both export the same four functions (`isAvailable`, `activate`, `deactivate`, `setReleaseHandler`); keep them in lockstep.
3. `core.ts` — tag-based reference counting over the impl. Calls the impl only on empty↔non-empty transitions of the tag set. Deactivating an unknown tag must never release other holders (tested).
4. `useKeepAwake.ts`, `KeepAwake.tsx`, `index.tsx` — public surface. Each hook instance defaults to a unique `useId()`-based tag. `KeepAwake` carries `activate`/`deactivate` statics for drop-in compat with the deprecated package and is the default export.

`jest/mock.js` is a standalone CommonJS re-implementation of the public API (consumed by users via `moduleNameMapper` → `react-native-stay-awake/jest`). It is not generated — any public API change must be mirrored there by hand.

Native details that exist for specific historical bugs (see README table before "simplifying" them away):

- **Android** (`StayAwakeModule.kt`): null `currentActivity` defers rather than drops — the desired state is stored and re-applied in `onHostResume`, which also covers activity recreation (`FLAG_KEEP_SCREEN_ON` is per-window). Flag changes always run on the UI thread. `invalidate()` clears the flag so reloads don't leak.
- **iOS**: logic lives in Swift (`StayAwakeImpl.swift`); `StayAwake.mm` is only the ObjC++ shim required because codegen'd TurboModule specs are C++ — don't move logic into it. Always dispatches to the main queue; `invalidate()` resets `isIdleTimerDisabled`.

The example app (`example/src/App.tsx`) doubles as the manual test for reference counting (two independent holds; screen sleeps only when both release).
