# 09 — Configuration & Build System

This file documents every root-level config file, the environment variables, EAS build profiles, CI/CD workflows, and how to build the app locally.

---

## Environment variables

| Variable | Used by | Purpose | Default/fallback |
|---|---|---|---|
| `EXPO_PUBLIC_API_URL` | `lib/api.ts` | FarmRisk backend base URL | `https://farmrisk.vercel.app` |
| `EXPO_PUBLIC_SUPABASE_URL` | `lib/supabase.ts` | Supabase project URL | `https://meaqfipbbrlqfautkaan.supabase.co` (hardcoded) |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `lib/supabase.ts` | Supabase publishable key | `sb_publishable_jCYy_8ivOndk6MRLJ3nzNw_vT9_R8el` (hardcoded) |
| `NODE_ENV` | EAS builds | Production-mode React | set to `production` in eas.json build profiles |

**Key rules:**

- `EXPO_PUBLIC_*` vars are inlined at bundle time by Expo — they must be present when the JS is bundled (Expo Go, local dev server, or EAS build). Renaming them requires touching `lib/`, `eas.json`, and any CI.
- The Supabase URL/key are **committed as fallbacks** in `lib/supabase.ts` and duplicated in `eas.json` preview + production profiles. Keep all three copies in sync.
- `EXPO_PUBLIC_API_URL` has an Android-emulator rewrite: `localhost` → `10.0.2.2` (see `06-api.md`).
- There is no `.env` file tracked in the repo — check `bun run android` / CI if new env vars are needed.

---

## Root config files

### `package.json`

- `name`: `farmrisk`, `version`: `1.0.0`, `private: true`
- `main`: `expo-router/entry` — the app entry is Expo Router.
- Scripts (all use `--go`, i.e. **Expo Go**):

```bash
bun start       # expo start --go
bun run android # expo start --android --go
bun run ios     # expo start --ios --go
bun run web     # expo start --web
bun run lint    # expo lint (ESLint flat config)
```

- **Package manager is Bun** (CI uses `oven-sh/setup-bun`). A `package-lock.json` also exists in the repo but Bun is the source of truth.
- Notable deps: `expo ~54.0.36`, `react-native 0.81.5`, `react 19.1.0`, `expo-router ~6.0.23`, `nativewind ^4.2.6`, `@tanstack/react-query ^5.101.4`, `@supabase/supabase-js ^2.110.5`, `react-native-paper ^5.15.3`, `victory-native ^37.3.6`, `@hugeicons/react-native ^1.0.15`, `expo-location ~19.0.8`, `expo-haptics ~15.0.8`, `expo-image ~3.0.11`, `react-native-reanimated ~4.1.1`, `react-native-worklets 0.5.1`, `tailwindcss 3`.
- Dev deps: `typescript ~5.9.2`, `eslint ^9.25.0`, `eslint-config-expo ~10.0.0`, `react-native-svg-transformer ^1.5.3`, `@types/react ~19.1.0`.

### `app.json` (Expo config)

| Key | Value | Notes |
|---|---|---|
| `name` / `slug` | `farmrisk` | |
| `version` | `1.0.0` | |
| `orientation` | `portrait` | |
| `icon` | `./assets/images/icon.png` | |
| `scheme` | `farmrisk` | Deep links: `farmrisk://` |
| `userInterfaceStyle` | `automatic` | Dark mode follows OS |
| `newArchEnabled` | `true` | New Architecture (Fabric) |
| `ios.bundleIdentifier` | `in.farmrisk.app` | |
| `ios.supportsTablet` | `true` | |
| `ios.infoPlist.ITSAppUsesNonExemptEncryption` | `false` | |
| `android.package` | `in.farmrisk.app` | |
| `android.edgeToEdgeEnabled` | `true` | |
| `android.predictiveBackGestureEnabled` | `false` | |
| `android.adaptiveIcon` | background/foreground/backgroundImage/monochrome PNGs | |
| `web.output` | `static` | Static web export |
| `plugins` | `expo-router`, `expo-splash-screen` (image `./assets/images/splash-icon.png`, width 200, contain; light bg `#ffffff`, dark bg `#000000`) | |
| `experiments.typedRoutes` | `true` | Typed route strings (`Href`) |
| `experiments.reactCompiler` | `true` | React Compiler enabled |
| `extra.eas.projectId` | `4d53853d-d902-4e2f-98a3-d73ac9b66fa3` | |
| `owner` | `farmrisk` | |

### `eas.json` (EAS Build profiles)

```json
{
  "cli": { "version": ">= 21.0.0", "appVersionSource": "remote" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": {
      "distribution": "internal",
      "env": { "NODE_ENV": "production", "EXPO_PUBLIC_SUPABASE_URL": "...", "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY": "...", "EXPO_PUBLIC_API_URL": "https://farmrisk.vercel.app" },
      "android": { "buildType": "apk" }
    },
    "production": {
      "autoIncrement": true,
      "env": { /* same env as preview */ },
      "android": { "buildType": "app-bundle" }
    }
  },
  "submit": {
    "production": { "android": { "track": "internal" } }
  }
}
```

| Profile | Android output | Distribution | Version |
|---|---|---|---|
| `development` | dev client | internal | remote |
| `preview` | **APK** | internal | remote |
| `production` | **AAB** (Play Store) | — | **auto-increment** |

- The `env` block in `preview`/`production` is **mandatory** for release builds — without it the `EXPO_PUBLIC_*` fallbacks still work (they're hardcoded), but the values here are the official ones.
- `appVersionSource: "remote"` + `autoIncrement: true` means version codes come from EAS servers.

### `babel.config.js`

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

- `jsxImportSource: "nativewind"` makes JSX compile through NativeWind's JSX runtime (required for v4 className support).
- `nativewind/babel` preset handles the rest of the Tailwind pipeline.

### `metro.config.js`

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: "./global.css" });
```

- Wires Metro to NativeWind with `global.css` as the entry stylesheet. If you rename `global.css`, update this.

### `tsconfig.json`

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": { "strict": true, "paths": { "@/*": ["./*"] } },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts", "nativewind-env.d.ts"]
}
```

- **`strict: true`** — all new code must be type-safe.
- `@/*` → project root (this is the import alias used everywhere).
- Includes `.expo/types` (generated typed routes) and `nativewind-env.d.ts`.

### `eslint.config.js`

```js
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
module.exports = defineConfig([expoConfig, { ignores: ['dist/*'] }]);
```

- Flat config with `eslint-config-expo`. Run via `bun run lint`.

### `global.css`

Tailwind entry + design tokens (light/dark CSS variables). Full token table in `08-theme-i18n.md`. Critical for NativeWind — it must remain the file referenced by `metro.config.js`.

### Root type declaration files

- `nativewind-env.d.ts` — `/// <reference types="nativewind/types" />` (generated, do not edit).
- `types/svg.d.ts` — `*.svg` module declaration (see `07-types.md`).

---

## CI/CD (`.github/workflows/`)

Both workflows trigger on **push of tags `v*`** (e.g. `v1.0.0`) and `workflow_dispatch`. Both do local EAS builds to avoid EAS cloud queue/limits.

### `build-and-release.yml` — APK + GitHub Release

1. Checkout (`actions/checkout@v4`)
2. Java 17 (Zulu) + Android SDK (`android-actions/setup-android@v3`)
3. Bun latest (`oven-sh/setup-bun@v2`), `bun install`
4. Expo + EAS CLI via `expo/expo-github-action@v8` (needs `secrets.EXPO_TOKEN`)
5. **Local APK build:** `eas build --platform android --profile preview --local --non-interactive --output=app-release.apk`
6. `softprops/action-gh-release@v2` publishes the APK as a GitHub Release (`app-release.apk`) with install instructions.

### `play-store-release.yml` — AAB + Play Store submit

1–4. Same setup as above.
5. **Local AAB build:** `eas build --platform android --profile production --local --non-interactive --output=app-release.aab`
6. **Submit:** `eas submit --platform android --profile production --path=app-release.aab --non-interactive` → internal track (per `eas.json` submit config). Play Store credentials must be configured via `eas credentials` on the Expo dashboard.

**Secrets required:** `EXPO_TOKEN` (both), `GITHUB_TOKEN` (automatic).

**Version bump flow:** bump the tag (`v1.0.1`) and EAS `autoIncrement` handles the Android versionCode. `app.json` version stays `1.0.0` unless manually bumped.

---

## Local development & builds

### Expo Go (fastest)

```bash
bun install
bun run android   # expo start --android --go
bun run ios       # expo start --ios --go
bun run web       # expo start --web
```

- Requires the Expo Go app on a device/simulator on the same network.
- `EXPO_PUBLIC_*` vars can be set in the shell before starting.

### Native Android build (APK/AAB)

Per project rules: **JDK 17** (`JAVA_HOME`) and **Android SDK** (`ANDROID_HOME`) are required for local Android builds.

```bash
eas build --platform android --profile preview --local     # APK
eas build --platform android --profile production --local  # AAB
```

- Add `--output=...` to name the artifact.
- For EAS cloud builds, run without `--local` (requires `EXPO_TOKEN` login).

### Type checking & lint

```bash
bunx tsc --noEmit   # type check (strict)
bun run lint        # expo lint
```

---

## Common pitfalls

1. **Env vars missing in release builds** → always check `eas.json` `env` blocks AND the hardcoded fallbacks in `lib/supabase.ts`.
2. **New native module** → Expo Go won't load it; you'll need a dev client (`eas build --profile development`) or a custom build.
3. **`global.css` rename** → breaks Metro (`metro.config.js`) and every `bun start`/build.
4. **React Compiler is enabled** (`experiments.reactCompiler: true`) — memoization rules apply; don't write patterns that violate Rules of React.
5. **Typed routes are on** — `router.push()` accepts typed `Href`; invalid route strings are compile errors.
6. **Bun vs npm** — install with `bun install` (CI uses Bun). Mixing lockfiles can cause drift.
