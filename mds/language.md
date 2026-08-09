# Language / Internationalization (i18n)

> **Status: LIVE.** The app runs on **i18next + react-i18next**. The legacy
> `constants/content.ts` + `constants/languages/*.ts` dictionaries are **dead
> code** kept only as a migration source for `scripts/convert-legacy-locales.ts`.

---

## 1. Supported languages

| Code | Language | Own-script name |
|---|---|---|
| `en` | English | English |
| `hi` | Hindi | हिन्दी |
| `mr` | Marathi | मराठी |
| `ta` | Tamil | தமிழ் |
| `gu` | Gujarati | ગુજરાતી |

The list lives in exactly **one place**: `SUPPORTED_LANGUAGES` in
`i18n/index.ts`. `LanguageCode` is derived from it, so adding a language means
touching that array (see the checklist at the bottom).

---

## 2. Architecture overview

```
i18n/
├── index.ts            # Engine: init, storage, device detection, changeAppLanguage
├── resources.ts        # Static import of every language × namespace JSON
├── keys.d.ts           # Strict TypeScript: t() autocomplete + compile-time key checks
├── locales/
    ├── en/             # ← SOURCE OF TRUTH for key shape
    │   ├── common.json     # Navigation, tab titles, generic buttons, errors
    │   ├── dashboard.json  # Dashboard copy, headers, risk/hazard labels
    │   ├── weather.json    # Weather telemetry, conditions, soil-moisture bands
    │   ├── search.json     # Location/village search + map screen
    │   ├── profile.json    # Profile screen (incl. language + crop + my farms picker)
    │   ├── auth.json       # Sign in / register forms + validation errors
    │   ├── calendar.json   # Crop calendar phases
    │   ├── landing.json    # Landing hero + nav (legacy content)
    │   ├── onboarding.json # 5-step onboarding flow (welcome, auth, location-perm)
    │   └── fields.json     # Farm/field selection, save dialog, farm list
    ├── hi/             # Same 10 files, Hindi
    ├── mr/             # Same 10 files, Marathi
    ├── ta/             # Same 10 files, Tamil
    └── gu/             # Same 10 files, Gujarati
```

The namespaces are **domain-based, not screen-positional** — keys describe
*what* the string is (`actions.submit`, `riskAlert.title`), never *where* it
sits on screen. That keeps translations reusable and the typing strict.

### Namespaces

| Namespace | `defaultNS`? | Covers | Used by |
|---|---|---|---|
| `common` | ✅ (default) | Tab titles, greetings, generic buttons, errors, `chooseLanguage` | Tab layout, headers, selectors |
| `dashboard` | | Dashboard sections, risk/hazard labels, tools/alerts copy | `(tabs)/index`, `forecast`, `tools`, `alerts`, dashboard sections |
| `weather` | | Weather conditions, metrics grid, lightning risk, soil-moisture bands | Weather sections, weather-table, soil-detail |
| `search` | | Village search, GPS, map screen, recents | `app/search.tsx`, `app/map.tsx` |
| `profile` | | Profile form, theme/crop/language rows, My Farms link | `app/profile.tsx` |
| `auth` | | Login/register forms + validation messages | `app/profile.tsx` (auth card) |
| `calendar` | | Crop calendar phase names | `CropCalendarSection` |
| `landing` | | Legacy landing/hero copy | (legacy — rarely rendered) |
| `onboarding` | | Welcome/auth/location-permission/farm-select copy for the 5-step flow | `app/onboarding/*` |
| `fields` | | Farm selection, drawing, save dialog, farm list, onboarding farm prompt | `app/farm-select.tsx`, `app/my-farms.tsx`, `components/farms/*`, `app/onboarding/farm-select.tsx` |

---

## 3. Key files & how they work

### `i18n/index.ts` — the engine

**Language resolution on first launch** (in order):

1. **AsyncStorage override** — key `farmrisk-language` (`LANGUAGE_STORAGE_KEY`).
   If present and supported, it wins.
2. **Device language** — `expo-localization` `getLocales()[0].languageCode`.
   Used only when no override is stored.
3. **Fallback** — `"en"` (any unsupported device language lands here).

**Public API:**

| Export | Type | Purpose |
|---|---|---|
| `i18n` | `i18next` instance | Current language, `changeLanguage`, etc. |
| `SUPPORTED_LANGUAGES` | `readonly ["en","hi","mr","ta","gu"]` | The one source of truth for language list |
| `LanguageCode` | union type | `"en" \| "hi" \| "mr" \| "ta" \| "gu"` |
| `LANGUAGE_NAMES` | `Record<LanguageCode, string>` | Display names in own script (for the selector UI) |
| `LANGUAGE_STORAGE_KEY` | `"farmrisk-language"` | AsyncStorage key |
| `isSupportedLanguage(code)` | guard | Narrow `string` → `LanguageCode` |
| `getDeviceLanguage()` | fn | Device language via expo-localization (guarded) |
| `getStoredLanguage()` | async fn | AsyncStorage override (guarded) |
| `initI18n()` | async fn | One-time init (idempotent — memoized promise) |
| `changeAppLanguage(lang)` | async fn | Persist override + switch instantly |

**`initI18n()`** is called once by `LanguageProvider` and returns a memoized
promise, so it's safe to call from anywhere. It configures:

- `fallbackLng: "en"` — a missing key in any language silently falls back to English.
- `defaultNS: "common"` — `t("title")` (no prefix) resolves against `common` first.
- `interpolation.escapeValue: false` — React Native renders text; no HTML escaping needed.
- `returnNull: false`, `useSuspense: false` — the provider gates rendering instead of suspense.

**`changeAppLanguage(lang)`**:
1. Validates against `SUPPORTED_LANGUAGES`.
2. Writes the override to AsyncStorage (fire-and-forget, guarded).
3. Calls `i18n.changeLanguage(lang)`.

Because every component consumes translations through `useTranslation()`
(react-i18next), the **entire tree re-renders instantly** — no reload, no
navigation reset.

### `i18n/resources.ts` — static resource map

Metro requires **static imports** (no dynamic `require`), so every
language × namespace JSON is imported eagerly and assembled into the `resources`
object passed to i18next. If you add a language or a namespace file, you must
add its imports here too (checklist below).

### `i18n/keys.d.ts` — strict typing

Augments i18next's `CustomTypeOptions` with the **English** resources:

```ts
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: { common: typeof common; dashboard: typeof dashboard; /* … */ };
  }
}
```

This gives you:

- `t("common:nav.signIn")` and `t("dashboard:riskHigh")` — **autocomplete** in the editor.
- Misspelled / nonexistent keys → **compile-time error** (`tsc`).
- **Interpolation variables type-checked** — `t("weather:feelsLike", { temp: 32 })` must supply `temp`; missing/extra vars error.

`en` is the source of truth: **add every new key to `en/*.json` first**, then to
the other four languages.

### `providers/LanguageProvider.tsx` — hydration gate

- On mount calls `initI18n()`, then sets `ready = true`.
- **Returns `null` until ready** → the app below never flashes the wrong language.
- Subscribes with `useTranslation([...all namespaces])` so the context value
  (`language`, `t`) stays fresh across switches.
- Provides `{ language, setLanguage, t, ready }` via `LanguageContext`.
- All 10 namespaces (`ALL_NAMESPACES`) are registered in the `useTranslation` list.

### `hooks/useLanguage.ts` — context accessor

```ts
const { language, setLanguage, t } = useLanguage(); // throws outside provider
```

> Note: **prefer `useTranslation()` from `react-i18next`** inside components.
> `useLanguage()` exists for (a) non-component code paths and (b) the old
> `t`-from-context API. Both re-render on language change.

---

## 4. How to use translations in a component

### The two accessors

| Hook | From | Returns | Use when |
|---|---|---|---|
| `useTranslation(["dashboard"])` | `react-i18next` | `{ t, i18n }` | Most components — typed `t`, re-renders on change |
| `useLanguage()` | `@/hooks/useLanguage` | `{ language, setLanguage, t, ready }` | Need the code + setter (e.g. profile picker) |

### Key format

- **Unprefixed** `t("riskHigh")` → resolved against `defaultNS` (`common`).
- **Namespace-prefixed** `t("dashboard:riskHigh")` → explicit namespace.
- **Nested keys** — the JSON files are flat, but i18next supports dotted paths
  into nested objects (e.g. `t("nav.signIn")` where `nav` is an object).
- **Interpolation** — `{{var}}` in the JSON: `t("weather:feelsLike", { temp: 32 })`.
- **Pluralization** — i18next `_one`/`_other` suffixes work normally.

### Example

```tsx
import { useTranslation } from "react-i18next";

export function MySection() {
  const { t } = useTranslation(["dashboard"]); // typed against en resources
  return <Text>{t("riskHigh")}</Text>;
}
```

---

## 5. The `LanguageSelector` component

File: `components/ui/LanguageSelector.tsx` — a bottom-sheet `Modal`.

- Props: `{ visible: boolean; onClose: () => void }`.
- Renders one row per `SUPPORTED_LANGUAGES` entry using `LANGUAGE_NAMES[code]`
  (each language's name in its own script — always readable by the user).
- Marks the active language (`i18n.language`) with a tick.
- On press → `await changeAppLanguage(code)` then `onClose()`.
- Mounted from **two places**: `app/profile.tsx` (Profile → "Language" row → `languageModalVisible`) and `app/onboarding/welcome.tsx` (top-right globe button), so users can pick a language *before* creating an account.

**Text-length safety (en → hi/mr/ta/gu):** Devanagari/Tamil/Gujarati strings are
often ~20–40% longer than English. The dashboard is built with `flex` layouts,
`flex-wrap`, `flex-1` + `numberOfLines` on constrained labels, and
`shrink-0` only on fixed-size elements (icons, badges). When adding a new
component, verify it at the **largest supported language** (typically Hindi or
Tamil) and at the **smallest screen** you support, not just in English.

---

## 6. Wiring the AI features to language

The AI backend returns localized text when told which language to use:

```ts
// components/dashboard/CurrentWeatherSection.tsx
useWeatherSummary(i18n.language);

// components/dashboard/AIAdvisorySection.tsx
useAI(crop, i18n.language);
```

Both hooks default to `"en"` but pass `i18n.language` at the call site so the
AI advisory and weather summary follow the app language. When building a new
component that calls an AI endpoint, pass the current language the same way.

---

## Checklist — adding a NEW COMPONENT (i18n-ready)

Every new component that renders user-facing text **must** be language-aware.
Tick every box:

- [ ] **1. No hardcoded user-facing strings.** Literal text belongs in JSON, not JSX.
- [ ] **2. Create the namespace file** `i18n/locales/en/<domain>.json` (or add keys to an existing one). Group by domain (e.g. `settings.json`), not by screen position.
- [ ] **3. Add the same keys to `hi`, `mr`, `ta`, `gu`** in the matching `<domain>.json`. English-first: add to `en` before the others. If you skip a language, the app falls back to English silently — complete all five to avoid that.
- [ ] **4. Register the namespace in 4 places:**
      - [ ] `i18n/resources.ts` — import the `en` file + 4 other languages, add to the `resources` object for all 5 languages.
      - [ ] `i18n/index.ts` — add the namespace to the `ns: [...]` array passed to `i18n.init`.
      - [ ] `i18n/keys.d.ts` — import the `en` file and add it to the `resources` map in the module augmentation.
      - [ ] `providers/LanguageProvider.tsx` — add it to `ALL_NAMESPACES` and the `useTranslation([...])` list (so `useLanguage().t` can reach it).
- [ ] **5. Consume via `useTranslation`:** `const { t } = useTranslation(["<domain>"])` and use `t("yourKey")` (or `t("<domain>:yourKey")`).
- [ ] **6. Interpolation:** if the string has variables, use `{{var}}` syntax in JSON and pass the value: `t("key", { var: value })`. TypeScript will verify the variable exists.
- [ ] **7. Dynamic server text (AI/API responses):** if the component calls the AI/weather-summary API, pass `i18n.language` so the backend returns localized text.
- [ ] **8. Layout check:** verify the component at the longest language (Hindi/Tamil) and shortest supported screen — no clipping, no overflow, `flex-wrap`/`numberOfLines` where needed.
- [ ] **9. Run typecheck** — `npx tsc --noEmit` (or the editor diagnostics): a typo'd or missing key is a compile error, so a clean typecheck means the keys line up.
- [ ] **10. Add the component to the docs:** one line in `mds/05-components.md` so the AI index stays current.

---

## Checklist — adding a NEW LANGUAGE

Add e.g. Bengali (`bn`):

- [ ] **1. Create the folder** `i18n/locales/bn/` and **copy all 10 JSON files** from `i18n/locales/en/` as a starting scaffold (common, dashboard, weather, search, profile, auth, calendar, landing, onboarding, fields).
- [ ] **2. Translate every key** in `bn/*.json` (all 10 files). Keep the JSON **structure identical** to `en` — same keys, same nesting, same `{{var}}` placeholders. Missing keys silently fall back to English, so an incomplete file still runs — but translate all keys for a real rollout.
- [ ] **3. Register in `i18n/index.ts`:**
      - Add `"bn"` to `SUPPORTED_LANGUAGES`.
      - Add `bn: "বাংলা"` to `LANGUAGE_NAMES`.
      - (`LanguageCode` and `isSupportedLanguage` update automatically.)
- [ ] **4. Register in `i18n/resources.ts`:** import all 10 `bn` JSON files and add a `bn: { common, dashboard, weather, search, profile, auth, calendar, landing, onboarding, fields }` entry to `resources`.
- [ ] **5. Add device-language detection support** if needed: `getDeviceLanguage()` already uses `isSupportedLanguage`, so `bn`-locale devices are detected automatically — nothing else to do. If the locale code differs (e.g. `pt-BR`), consider normalizing in `getDeviceLanguage`.
- [ ] **6. Verify with `npx tsc --noEmit`** — `keys.d.ts` types `t()` against `en` only, so this won't catch missing keys in `bn`; instead spot-check by switching to the language in the app and scanning screens.
- [ ] **7. Update the docs:**
      - Language table in this file (`mds/language.md` §1).
      - `mds/08-theme-i18n.md` language table.
      - `mds/README.md` Quick Facts row if it mentions the language count.
- [ ] **8. Test runtime switching** on device: Profile → Language → pick `bn` → verify instant re-render across tabs, no app reload, and that the choice survives an app restart (AsyncStorage).
- [ ] **9. (Optional) Extend `scripts/convert-legacy-locales.ts`** if you still need legacy-dictionary fallbacks for the new language.

---

## Quick reference — which file do I touch?

| Goal | File |
|---|---|
| Add/change a UI string | `i18n/locales/<lang>/<domain>.json` (all 5 languages) |
| Change the language list | `i18n/index.ts` (`SUPPORTED_LANGUAGES` + `LANGUAGE_NAMES`) |
| Add a language | new `i18n/locales/<code>/` + `i18n/resources.ts` + `i18n/index.ts` |
| Add a namespace | `i18n/locales/en/<domain>.json` (×5 langs) + register in `resources.ts`, `index.ts`, `keys.d.ts`, `LanguageProvider.tsx` |
| Add a namespace | `i18n/locales/en/<domain>.json` (×5 langs) + register in `resources.ts`, `index.ts`, `keys.d.ts`, `LanguageProvider.tsx` |
| Change persistence key | `LANGUAGE_STORAGE_KEY` in `i18n/index.ts` |
| Change the picker UI | `components/ui/LanguageSelector.tsx` |
| Get `language`/`setLanguage` in code | `useLanguage()` (`hooks/useLanguage.ts`) |
| Get `t` in a component | `useTranslation(["<domain>"])` from `react-i18next` |
| Localize AI output | pass `i18n.language` to `useAI` / `useWeatherSummary` |
| Rebuild JSON from legacy TS dicts | `bun run scripts/convert-legacy-locales.ts` (migration tool only) |
