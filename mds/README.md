# FarmRisk Mobile App — AI Index & Reference

> **Purpose:** This directory is a complete, human- and AI-readable index of the FarmRisk React Native (Expo) app. Use it to understand the project before writing code, or paste these files into an AI assistant to give it full context about the codebase.

---

## Quick Facts

| Key | Value |
|---|---|
| **App** | FarmRisk — village-level agricultural micro-climate intelligence |
| **Framework** | Expo SDK 54 (React Native 0.81.5, React 19.1.0) |
| **Navigation** | Expo Router v6 (file-based) |
| **Styling** | NativeWind v4 (Tailwind CSS for RN) |
| **Data fetching** | TanStack Query v5 (`@tanstack/react-query`) |
| **Auth / backend DB** | Supabase (`@supabase/supabase-js`) |
| **Backend API** | Remote Next.js API at `https://farmrisk.vercel.app` (or `EXPO_PUBLIC_API_URL`) |
| **Charts** | Victory Native |
| **Icons** | Hugeicons (`@hugeicons/react-native` + `@hugeicons/core-free-icons`) |
| **Language** | TypeScript (strict mode) |
| **Package manager** | Bun (also has `package-lock.json` present) |

---

## Documentation Index

| File | Contents |
|---|---|
| [`01-architecture.md`](./01-architecture.md) | Tech stack, folder structure, provider tree, module roles |
| [`02-routing.md`](./02-routing.md) | All routes & screens (tabs, modals, full-screen) |
| [`03-providers.md`](./03-providers.md) | The 5 React Context providers (Auth, Language, Location, Crop, Query) |
| [`04-hooks.md`](./04-hooks.md) | Every hook: signatures, return shapes, query keys, caching |
| [`05-components.md`](./05-components.md) | Every UI component, dashboard section, and helpers |
| [`06-api.md`](./06-api.md) | Backend API endpoints, request/response shapes, `lib/` helpers |
| [`07-types.md`](./07-types.md) | All TypeScript interfaces and types |
| [`08-theme-i18n.md`](./08-theme-i18n.md) | Design tokens, dark mode, i18n (en/hi/mr/ta/gu) |
| [`language.md`](./language.md) | **i18next setup, how translations work, checklists for adding a component / a language** |
| [`09-config-build.md`](./09-config-build.md) | Config files, env vars, EAS builds, CI/CD, deployment |
| [`10-data-flow.md`](./10-data-flow.md) | End-to-end data flow, screen-by-screen behavior |

---

## 30-Second Summary

1. **Location is the core.** `LocationProvider` resolves the user's village (stored location → recents → GPS), and every data hook reads `location` from context.
2. **Hooks are the API.** Context-based hooks (`useWeather`, `useForecast`, `useSoilMoisture`, `useCrops`, `useCalendar`, `useAI`, `useRiskScore`, `useWeatherSummary`) wrap TanStack Query and are used directly by screens/components.
3. **First launch runs a 5-step onboarding flow** (`app/onboarding/`): Splash → Welcome → Auth (or Guest) → Location permission → Dashboard. `has_onboarded` in AsyncStorage skips it on later launches. The flow is fully localized (all 5 languages).
4. **Everything talks to one backend.** `lib/api.ts` defines 10 fetch functions hitting the Next.js API (`/api/weather`, `/api/forecast`, `/api/soil-moisture`, `/api/ai`, `/api/risk`, `/api/crops`, `/api/calender`, `/api/locations`, etc.).
5. **The UI is section-based.** The Dashboard (`app/(tabs)/index.tsx`) composes reusable section components from `components/dashboard/`.
6. **Auth is optional.** Supabase session presence unlocks "Pro" (paid dashboard) views; login uses a 10-digit Indian phone number converted to `<phone>@farmrisk.app`.

---

## Path Aliases

`@/*` → project root (see `tsconfig.json`). All imports use `@/`:

```ts
import { useWeather } from "@/hooks/useWeather";
import { supabase } from "@/lib/supabase";
import { Icon } from "@/components/ui/Icon";
import { useLocationContext } from "@/providers/LocationProvider";
```

## Commands

```bash
bun install          # install dependencies
bun start            # expo start --go
bun run android      # expo start --android --go
bun run ios          # expo start --ios --go
bun run web          # expo start --web
bun run lint         # expo lint (ESLint flat config)
```
