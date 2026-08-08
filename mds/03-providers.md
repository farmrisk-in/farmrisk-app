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

i18n provider for 5 languages: **en, hi, mr, ta, gu** (loaded from `constants/languages/*` via `constants/content.ts`).

```ts
interface LanguageContextProps {
  language: LanguageCode;                    // "en" | "hi" | "mr" | "ta" | "gu"
  setLanguage: (lang: LanguageCode) => void; // persists to AsyncStorage "farmrisk-language"
  t: TranslationType;                        // the dictionary object (content[language])
}
```

**Behavior:**
- On mount reads AsyncStorage key `farmrisk-language`; defaults to `"en"`.
- `setLanguage` writes through to AsyncStorage.
- **Returns `null` while loading** — the entire app below this provider doesn't render until language is hydrated.
- Access via `useLanguage()` (throws if used outside provider).

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
3. **GPS fallback** — else `requestCurrentLocation()`:
   - Requests `expo-location` foreground permission; if granted uses `Location.getCurrentPositionAsync({ accuracy: Balanced })`.
   - Falls back to browser `navigator.geolocation` (web).
   - Reverse-geocodes via `reverseGeocode(lat, lng)` from `lib/api.ts` to build `SelectedLocation` (name = `district` → `state` → first part of displayName).

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

## Consumer Hook Summary

| Context | Hook | File |
|---|---|---|
| Auth | `useAuth()` | `hooks/useAuth.ts` (safe default) |
| Language | `useLanguage()` | `hooks/useLanguage.ts` (throws outside provider) |
| Location | `useLocationContext()` | `providers/LocationProvider.tsx` (safe default) |
| Crop | `useCropContext()` | `providers/CropProvider.tsx` (default context) |
| Query | `useQueryClient()` | TanStack Query |

> **Gotcha:** `useLocationContext()` is defined **inside** `LocationProvider.tsx` (unlike the others which live in `hooks/`). Import it from `@/providers/LocationProvider`.
