# 08 — Theme & Internationalization

This app has **two separate theming systems** and **two separate i18n layers**:

| Layer | What it is | Where |
|---|---|---|
| **NativeWind theme** (authoritative) | CSS variables in `global.css` mapped to Tailwind color names in `tailwind.config.js`. **This is what all real screens use.** | `global.css`, `tailwind.config.js` |
| **Legacy `Colors`/`Fonts`** | Old shadcn-style constants. Only used by `components/ui/collapsible.tsx` and the `useThemeColor` hook. Mostly dead code. | `constants/theme.ts` |
| **App i18n (authoritative)** | **i18next + react-i18next** engine with 5 languages × 9 domain namespaces, JSON files under `i18n/locales/`. Consumed via `useTranslation()` / `useLanguage()`. Full guide + checklists in [`language.md`](./language.md). | `i18n/` |
| **Weather conditions i18n** | WMO condition strings per language inside `types/weather.ts` (`WmoEntry.condition`, `CurrentWeather.condition`). Separate from the i18next dictionary — translated per record. | `types/weather.ts`, used by `components/WeatherIcon.tsx` |

---

## 1. NativeWind theme (`global.css` + `tailwind.config.js`)

### How it works

1. `global.css` declares CSS custom properties (design tokens) on `:root` (light) and inside `@media (prefers-color-scheme: dark)` (dark). This means **dark mode is automatic** based on the OS setting (`userInterfaceStyle: "automatic"` in `app.json`).
2. `tailwind.config.js` maps Tailwind utility color names to those variables:

```js
colors: {
  background: "var(--background)",
  foreground: "var(--foreground)",
  card: "var(--card)",
  "card-foreground": "var(--card-foreground)",
  popover: "var(--popover)",
  "popover-foreground": "var(--popover-foreground)",
  primary: "var(--primary)",
  "primary-foreground": "var(--primary-foreground)",
  secondary: "var(--secondary)",
  "secondary-foreground": "var(--secondary-foreground)",
  muted: "var(--muted)",
  "muted-foreground": "var(--muted-foreground)",
  accent: "var(--accent)",
  "accent-foreground": "var(--accent-foreground)",
  destructive: "var(--destructive)",
  "destructive-foreground": "var(--destructive-foreground)",
  border: "var(--border)",
  input: "var(--input)",
  ring: "var(--ring)",
}
```

3. So components use utilities like `bg-background`, `text-foreground`, `bg-card`, `text-muted-foreground`, `bg-primary`, `border-border`.

### Design tokens — Light mode

| Token | Value | Role |
|---|---|---|
| `--background` | `#ffffff` | Page background |
| `--foreground` | `#09090b` | Primary text |
| `--card` | `#fbfbfb` | Card surface |
| `--card-foreground` | `#09090b` | Text on cards |
| `--popover` | `#ffffff` | Overlays |
| `--popover-foreground` | `#09090b` | |
| `--primary` | `#007a55` | **Brand green** (buttons, accents, active states) |
| `--primary-foreground` | `#ecfdf5` | Text on primary |
| `--secondary` / `--muted` / `--accent` | `#f4f4f5` | Subtle fills |
| `--secondary-foreground` / `--accent-foreground` | `#18181b` | |
| `--muted-foreground` | `#71717b` | Secondary text |
| `--destructive` | `#e7000b` | Errors/danger |
| `--border` / `--input` | `#e4e4e7` | Borders |
| `--ring` | `#9f9fa9` | Focus rings |

### Design tokens — Dark mode

| Token | Value | Role |
|---|---|---|
| `--background` | `#09090b` | Page background |
| `--foreground` | `#fcfcfc` | Primary text |
| `--card` / `--popover` | `#18181b` | Card surface |
| `--primary` | `#006045` | **Brand green (dark)** |
| `--primary-foreground` | `#ecfdf5` | |
| `--secondary` / `--muted` / `--accent` | `#27272a` | Subtle fills |
| `--muted-foreground` | `#9f9fa9` | |
| `--destructive` | `#ff6467` | |
| `--border` | `rgba(255, 255, 255, 0.1)` | (was `oklch(1 0 0 / 10%)` per comment) |
| `--input` | `rgba(255, 255, 255, 0.15)` | |
| `--ring` | `#71717b` | |

### Chart palette (both modes)

`--chart-1` → `--chart-5`: `#5ee9b5`, `#00bc7d`, `#009966`, `#007a55`, `#006045` — a green ramp used by victory-native charts.

### Sidebar tokens

`--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, `--sidebar-ring` also exist (light: `#fcfcfc` family; dark: `#18181b` family) but there is no sidebar UI in the current app — they're scaffolding.

### Base layer

```css
@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
  html { @apply font-sans; }
}
```

---

## 2. Legacy `constants/theme.ts` (`Colors` + `Fonts`)

```ts
export const Colors = {
  light: { text: '#11181C', background: '#fff', tint: '#0a7ea4', icon: '#687076', tabIconDefault: '#687076', tabIconSelected: '#0a7ea4' },
  dark:  { text: '#ECEDEE', background: '#151718', tint: '#fff',   icon: '#9BA1A6', tabIconDefault: '#9BA1A6', tabIconSelected: '#fff' },
};

export const Fonts = Platform.select({ ios: {...}, default: {...}, web: {...} });
```

**Status: mostly legacy.** The real theme is the NativeWind one above. `Colors` is only consumed by:

- `components/ui/collapsible.tsx`
- `hooks/use-theme-color.ts` (`useThemeColor(colorName)` helper)

The default tint (`#0a7ea4` blue) does **not** match the app's green brand — evidence this file predates the NativeWind theme. Don't extend it for new screens; use Tailwind utilities instead.

---

## 3. App i18n (i18next — `i18n/` directory)

> **Full guide + step-by-step checklists: [`language.md`](./language.md).** This section is the quick overview.

### Stack

- **i18next** + **react-i18next** — translation engine & React binding.
- **expo-localization** — auto-detects the device's native language on first launch.
- **@react-native-async-storage/async-storage** — persists the user's choice across restarts.

### Languages & namespaces

| Code | Language | Own-script name |
|---|---|---|
| `en` | English | English |
| `hi` | Hindi | हिन्दी |
| `mr` | Marathi | मराठी |
| `ta` | Tamil | தமிழ் |
| `gu` | Gujarati | ગુજરાતી |

Each language has **9 domain namespaces** as JSON files under `i18n/locales/<code>/`:

| Namespace | Covers |
|---|---|
| `common` (defaultNS) | Tab titles, greetings, generic buttons, errors, `chooseLanguage` |
| `dashboard` | Dashboard sections, risk/hazard labels, tools/alerts copy |
| `weather` | Weather conditions, metrics grid, lightning risk, soil-moisture bands |
| `search` | Village search, GPS, map screen, recents |
| `profile` | Profile form, theme/crop/language rows |
| `auth` | Sign in/register forms + validation errors |
| `calendar` | Crop calendar phase names |
| `landing` | Legacy landing/hero copy |
| `onboarding` | 5-step onboarding flow: welcome, auth, location-permission copy |

### Resolution order (first launch)

1. **AsyncStorage** override (`farmrisk-language`) → 2. **device language** via expo-localization (if supported) → 3. fallback `en`.

### Consumption

```tsx
import { useTranslation } from "react-i18next";
const { t } = useTranslation(["dashboard"]); // typed against en resources
// …
<Text>{t("riskHigh")}</Text>
```

- Components use `useTranslation()`; the whole tree re-renders instantly on switch (no reload).
- `useLanguage()` (`hooks/useLanguage.ts`) exposes `{ language, setLanguage, t, ready }` for code that needs the code + setter (e.g. the profile picker).
- Switching is done by `changeAppLanguage(code)` (`i18n/index.ts`) — persists to AsyncStorage and calls `i18n.changeLanguage()`.
- **Typing:** `i18n/keys.d.ts` augments `CustomTypeOptions` with the English resources — `t("…")` autocompletes, misspelled keys and missing interpolation vars fail `tsc`.

### How to add a string

1. Add the key to `i18n/locales/en/<namespace>.json` (English is the source of truth).
2. Add the same key to the matching file in `hi`, `mr`, `ta`, `gu` — missing keys silently fall back to English, so complete all five.
3. Use it via `t("<namespace>:key")` or, for `common`, plain `t("key")`.
4. Use `{{var}}` syntax for interpolation: `t("weather:feelsLike", { temp: 32 })`.

---

## 4. Weather-condition i18n (`types/weather.ts` + `WeatherIcon.tsx`)

Weather conditions are translated **per record**, not via the dictionary:

```ts
type WmoEntry = { condition: { en, hi, mr, ta, gu }, icon: { day: string, night?: string } };
```

- The API returns `CurrentWeather.condition` (and hourly `icon` keys) already localized.
- `components/WeatherIcon.tsx` maps `weather_code` → `WmoEntry` → the right SVG from `assets/images/weathericons/` (24 icons) plus the translated condition string.

---

## Quick reference — which file do I touch?

| Goal | File |
|---|---|
| Change a color used by screens | `global.css` (+ keep `tailwind.config.js` mapping) |
| Add a new Tailwind color name | `tailwind.config.js` + `global.css` variable |
| Change UI text | `i18n/locales/<lang>/<namespace>.json` (all 5 languages) — see [`language.md`](./language.md) |
| Add a language | new `i18n/locales/<code>/` + register in `i18n/index.ts` + `i18n/resources.ts` — checklist in [`language.md`](./language.md) |
| Add a namespace | new `i18n/locales/en/<ns>.json` (×5 langs) + register in `resources.ts`, `index.ts`, `keys.d.ts`, `LanguageProvider.tsx` |
| Change the language picker | `components/ui/LanguageSelector.tsx` |
| Localize a weather condition | API/backend + `WmoEntry` in `types/weather.ts` (per-record, not via dictionary) |
| Legacy blue/white Colors | `constants/theme.ts` (avoid for new work) |
