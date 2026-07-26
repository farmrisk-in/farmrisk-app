# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

---

## Project Navigation & Architecture (Expo Router v6 / SDK 54)

### 1. File-Based Routing System (`app/` directory)
This project uses **Expo Router** (file-based routing for React Native):
- `app/_layout.tsx`: Root layout component wrapping providers (`AuthProvider`, `LanguageProvider`, `LocationProvider`) and main `<Stack>` router.
- `app/(tabs)/`: Group folder containing bottom tab navigation screens.
  - `app/(tabs)/_layout.tsx`: Defines the `<Tabs>` bar, screen titles, icons, and tab item routes.
  - `app/(tabs)/index.tsx`: Main Dashboard tab (`/` or `index`).
  - `app/(tabs)/profile.tsx`: Profile tab screen (`/profile`).
  - `app/modal.tsx`: Modal route loaded over the stack router.

### 2. How to Add or Edit Tabs
- **To add a new tab**:
  1. Create a new file in `app/(tabs)/<name>.tsx` (e.g. `app/(tabs)/settings.tsx`).
  2. Register it in `app/(tabs)/_layout.tsx` using `<Tabs.Screen name="<name>" options={{ title: '...', tabBarIcon: ... }} />`.
- **To edit tab bar styling & icons**:
  - Open `app/(tabs)/_layout.tsx`.
  - Update `screenOptions` (active tint color, header visibility, haptics) or individual screen options (`tabBarIcon`, `title`, `headerShown`).

### 3. Component & State Directory Layout
- `components/`: UI components and widgets (e.g., `components/haptic-tab.tsx`, `components/ui/`).
- `providers/`: React Context providers wrapped around the app:
  - `AuthProvider.tsx`: Supabase authentication state (`user`, `session`, `signOut`).
  - `LanguageProvider.tsx`: i18n & multi-language dictionary context (`language`, `setLanguage`, `t`).
  - `LocationProvider.tsx`: Active user coordinates & geolocation context (`location`, `setLocation`).
- `lib/`: Core helpers and API integrations:
  - `lib/supabase.ts`: Supabase client instance with AsyncStorage auth persistence and environment variable fallbacks.
  - `lib/api.ts`: Backend API endpoints (`getWeather`, `getForecast`, `getSoilMoisture`, `getAIAdvisory`, etc.).
- `constants/`: Global constants, color themes (`constants/theme.ts`), and translation dictionaries (`constants/content.ts`).
- `hooks/`: Custom React hooks (`useColorScheme`, `useLanguage`, `usePro`).

### 4. EAS Build & Environment Rules
- Environment variables must be specified in `eas.json` under `env` for release builds (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_API_URL`, `NODE_ENV`).
- Local Android builds require JDK 17 (`JAVA_HOME`) and Android SDK (`ANDROID_HOME`).
- For Expo Go development, run `npm run android` (`expo start --android --go`).
