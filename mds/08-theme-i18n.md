# 08 — Theme & Internationalization

This app has **two separate theming systems** and **two separate i18n layers**:

| Layer | What it is | Where |
|---|---|---|
| **NativeWind theme** (authoritative) | CSS variables in `global.css` mapped to Tailwind color names in `tailwind.config.js`. **This is what all real screens use.** | `global.css`, `tailwind.config.js` |
| **Legacy `Colors`/`Fonts`** | Old shadcn-style constants. Only used by `components/ui/collapsible.tsx` and the `useThemeColor` hook. Mostly dead code. | `constants/theme.ts` |
| **App i18n (authoritative)** | Nested per-screen dictionaries in 5 languages, consumed via `LanguageProvider` + `useLanguage()` hook (`t` function). | `constants/content.ts`, `constants/languages/` |
| **Weather conditions i18n** | WMO condition strings per language inside `types/weather.ts` (`WmoEntry.condition`, `CurrentWeather.condition`). | `types/weather.ts`, used by `components/WeatherIcon.tsx` |

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

## 3. App i18n (`constants/content.ts` + `constants/languages/`)

### Structure

```ts
// constants/content.ts
import { en } from "./languages/en";
import { hi } from "./languages/hi";
import { mr } from "./languages/mr";
import { ta } from "./languages/ta";
import { gu } from "./languages/gu";

export const content = { en, hi, mr, ta, gu };
export type LanguageCode = keyof typeof content;        // "en" | "hi" | "mr" | "ta" | "gu"
export type TranslationType = typeof content.en;        // structural type: en is the source of truth
```

### Languages

| Code | Language | File |
|---|---|---|
| `en` | English | `constants/languages/en.ts` |
| `hi` | Hindi | `constants/languages/hi.ts` |
| `mr` | Marathi | `constants/languages/mr.ts` |
| `ta` | Tamil | `constants/languages/ta.ts` |
| `gu` | Gujarati | `constants/languages/gu.ts` |

**`en` is the schema.** `TranslationType = typeof content.en` means every other language must match English's shape exactly (TypeScript enforces this at compile time — a missing key in `hi.ts` is a type error).

### Dictionary shape (nested per screen)

The `en` dictionary has these top-level sections:

| Section | Covers |
|---|---|
| `title`, `description`, `hero*`, `version` | App identity + landing hero |
| `nav` | Navigation labels (dashboard, sign in/out...) |
| `sidebar` | Sidebar labels (scaffolding) |
| `landing` | Landing page copy (pipeline steps, CTA, footer) |
| `dashboard` | **The main screen**: weather conditions, risk levels, soil moisture bands, AI advisory strings, crop names, loading/error text |
| `profile` | Profile form labels |
| `problem` | Problem/landing section with metrics + links |
| `solution` | Solution pillars + stats |
| `choice` | Free vs Personalized pricing blocks |
| `locationSearchBar` | Search/map screen strings (village search, GPS, map) |
| `auth` | Sign in/register forms + validation errors |

Note: some strings contain `{placeholder}` template slots (e.g. `heroHeading: "Farmers face climate {Uncertainty} almost every day"`, `landing.coverageDesc`). Check call sites — some are formatted with a small helper or inline `replace()`, some are displayed as-is.

### Consumption

- `providers/LanguageProvider.tsx` stores the current `LanguageCode` in AsyncStorage (`farmrisk-language`) and provides `t` — a typed accessor like `t("dashboard.rainChance")` (or similar — see `03-providers.md`).
- `hooks/useLanguage.ts` re-exports the context (`language`, `setLanguage`, `t`).
- Screens pass `t("...")` strings to components; components themselves are not language-aware.

### How to add a string

1. Add the key to `constants/languages/en.ts` in the right section (or create a section).
2. Add the same key to `hi.ts`, `mr.ts`, `ta.ts`, `gu.ts` — TypeScript will error until all five match.
3. Use it in the UI via `t("section.key")`.
4. Never change `en`'s shape without updating all four other files in the same change.

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
| Change UI text | `constants/languages/*.ts` (all 5) |
| Add a language | new file in `constants/languages/` + register in `constants/content.ts` |
| Localize a weather condition | API/backend + `WmoEntry` in `types/weather.ts` |
| Legacy blue/white Colors | `constants/theme.ts` (avoid for new work) |
