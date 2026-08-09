# Providers (React Context)

All providers live in `providers/` and are mounted in `app/_layout.tsx` (see the provider tree in `01-architecture.md`).

---

## 1. `QueryProvider` — `providers/QueryProvider.tsx`

Wraps the app with TanStack Query.

```tsx
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,  // 10 minutes
    },
  },
});
```

**Notes:**
- `queryClient` is exported for direct use (`useQueryClient()` inside hooks like `useRefreshDashboard`).
- Individual data hooks usually override `staleTime` to 1 hour.

---

## 2. `AuthProvider` — `providers/AuthProvider.tsx`

Supabase authentication state.

```ts
interface AuthContextType {
  user: User | null;        // Supabase User
  session: Session | null;  // Supabase Session
  loading: boolean;
  signOut: () => Promise<void>;
}
```

**Behavior:**
- On mount: `supabase.auth.getSession()` → sets `session`/`user`.
- Subscribes to `supabase.auth.onAuthStateChange` → updates state reactively on sign-in/out/token refresh.
- `signOut()` sets `loading = true`, calls `supabase.auth.signOut()`, clears state.
- Access via `useAuth()` (see `hooks/useAuth.ts`), which falls back to a default context if not wrapped.

---

## 3. `LanguageProvider` — `providers/LanguageProvider.tsx`

Bootstraps the **i18next** engine (5 languages × 9 namespaces) and hydrates the user's language choice before rendering the app.

```ts
interface LanguageContextProps {
  language: LanguageCode;                    // "en" | "hi" | "mr" | "ta" | "gu"
  setLanguage: (lang: LanguageCode) => void; // changeAppLanguage: persists + switches instantly
  t: AppTFunction;                           // typed t() over ALL namespaces
  ready: boolean;
}
```

**Behavior:**
- On mount calls `initI18n()` from `i18n/index.ts`, which resolves language in this order: **AsyncStorage** (`farmrisk-language`) → **device language** (expo-localization) → fallback `en`.
- **Returns `null` while loading** — the entire app below this provider doesn't render until language hydration completes (no wrong-language flash).
- Subscribes with `useTranslation([...ALL_NAMESPACES])` so the context value (`language`, `t`) stays fresh on every switch.
- `setLanguage` = `changeAppLanguage(lang)` → writes AsyncStorage + calls `i18n.changeLanguage()`; every `useTranslation()` consumer re-renders instantly, no app reload.
- Access via `useLanguage()` (throws if used outside provider).
- All translation content lives in `i18n/locales/<lang>/*.json` (see `mds/language.md`).

---

## 4. `LocationProvider` — `providers/LocationProvider.tsx`

The most important provider — it owns the active coordinates everything else depends on.

```ts
export type SelectedLocation = {
  lat: number;
  lng: number;
  name: string;         // short name (district/state or first part of displayName)
  displayName: string;  // full geocoded display name
};

interface LocationContextValue {
  location: SelectedLocation | null;
  setLocation: (location: SelectedLocation) => void;   // persists to AsyncStorage
  isResolving: boolean;                                // true while resolving/initializing
  locationError: boolean;                              // true when resolution finished w/o location
  requestCurrentLocation: () => Promise<SelectedLocation | null>; // GPS → reverse geocode
  retryLocationInit: () => void;                       // re-runs full init sequence
}
```

**AsyncStorage keys:**
- `farmrisk:active_location` — currently active location (set by `setLocation`).
- `farmrisk:recent_locations` — recent locations list (used by init fallback + search screen).

**Initialization sequence (on mount & on `retryLocationInit`):**
1. **Stored active location** — if `farmrisk:active_location` exists and has lat/lng, use it.
2. **Most recent location** — else read `farmrisk:recent_locations` and use `recents[0]`.
3. **GPS fallback** — *only when onboarding is complete*: if `has_onboarded === "true"`, call `requestCurrentLocation()`:
   - Requests `expo-location` foreground permission; if granted uses `Location.getCurrentPositionAsync({ accuracy: Balanced })`.
   - Falls back to browser `navigator.geolocation` (web).
   - Reverse-geocodes via `reverseGeocode(lat, lng)` from `lib/api.ts` to build `SelectedLocation` (name = `district` → `state` → first part of displayName).

> **Onboarding gate:** during the first-launch flow (`has_onboarded` unset), the GPS auto-prompt is **skipped** so the permission dialog never pops up over the splash/welcome screens. The onboarding Step 4 (location-perm) is the deliberate permission moment, and the search/map screens work without GPS.

**Error handling:**
- On failure, `locationError = true` and `location` stays `null` → screens render `<LocationRequired />`.
- `requestCurrentLocation` returns `null` on failure and sets `locationError`.

**Access:** `useLocationContext()` (returns a safe default object if no provider).

---

## 5. `CropProvider` — `providers/CropProvider.tsx`

Persists the user's selected active crop across the app.

```ts
type CropContextType = {
  selectedCrop: string;                       // crop id, "" = general/default
  setSelectedCrop: (crop: string) => void;    // persists to AsyncStorage
};
```

- AsyncStorage key: `farmrisk_selected_crop`.
- Loads stored value on mount.
- Access via `useCropContext()`. Used by:
  - `app/(tabs)/forecast.tsx` — passes crop to SoilMoistureSection + CropCalendarSection.
  - `app/(tabs)/tools.tsx` — passes crop to AIAdvisorySection.
  - `app/profile.tsx` — crop picker modal sets it.

---

## 6. `FarmProvider` — `providers/FarmProvider.tsx`

Tracks the user's **selected farm** and keeps it in sync with the active location. Sits between `CropProvider` and `ThemeProvider` in the tree.

```ts
interface FarmContextValue {
  selectedFarm: SavedField | null;             // currently active farm, null = GPS mode
  isLoading: boolean;                          // true while restoring from AsyncStorage
  selectFarm: (farm: SavedField) => Promise<void>; // activates farm + updates location
  clearFarm: () => Promise<void>;              // clears farm, re-resolves GPS
}
```

**AsyncStorage key:** `farmrisk:selected_farm` (JSON-serialized `SavedField`).

**Behavior:**
- On mount reads `farmrisk:selected_farm` from AsyncStorage. If present, `selectedFarm` is set and the app's active `location` (via `setLocation`) is updated to `farm.centerLat/centerLng` — so all data hooks query the farm centroid rather than the user's GPS.
- `selectFarm(farm)` — saves to AsyncStorage, sets `selectedFarm`, and calls `LocationProvider.setLocation(...)` with `{ lat: farm.centerLat, lng: farm.centerLng, name: farm.name, displayName: farm.name }`.
- `clearFarm()` — sets `selectedFarm = null`, removes AsyncStorage key, and calls `requestCurrentLocation()` to restore GPS coordinates.

**Consumed by:**
- `components/dashboard/SearchSection.tsx` — shows the active farm name + "Farm" badge when a farm is selected; GPS button calls `clearFarm()` to switch back to GPS mode.
- `app/farm-select.tsx` — `selectFarm()` when user taps a saved farm on the map.
- `app/my-farms.tsx` — `selectFarm()` when user taps a farm in the list.
- `app/onboarding/farm-select.tsx` — reads `selectedFarm` to show the "Ready to go!" state.

---

## Consumer Hook Summary

| Context | Hook | File |
|---|---|---|
| Auth | `useAuth()` | `hooks/useAuth.ts` (safe default) |
| Language | `useLanguage()` | `hooks/useLanguage.ts` (throws outside provider) |
| Location | `useLocationContext()` | `providers/LocationProvider.tsx` (safe default) |
| Crop | `useCropContext()` | `providers/CropProvider.tsx` (default context) |
| Farm | `useFarmContext()` | `providers/FarmProvider.tsx` (safe default) |
| Query | `useQueryClient()` | TanStack Query |

> **Gotcha:** `useLocationContext()` is defined **inside** `LocationProvider.tsx` (unlike the others which live in `hooks/`). Import it from `@/providers/LocationProvider`.
