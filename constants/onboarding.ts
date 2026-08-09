/**
 * Onboarding state machine.
 *
 * Steps (SPLASH → WELCOME → AUTH → LOCATION_PERM → COMPLETE) are backed by
 * Expo Router screens under `app/onboarding/`. COMPLETE is not a screen — it
 * persists `has_onboarded` and navigates to the dashboard.
 */

export type OnboardingStep =
  | "SPLASH"
  | "WELCOME"
  | "AUTH"
  | "LOCATION_PERM"
  | "FARM_SELECT"
  | "COMPLETE";

/** Route for each step (COMPLETE uses the root "/"). */
export const ONBOARDING_STEP_ROUTES: Record<OnboardingStep, string> = {
  SPLASH: "/onboarding",
  WELCOME: "/onboarding/welcome",
  AUTH: "/onboarding/auth",
  LOCATION_PERM: "/onboarding/location-perm",
  FARM_SELECT: "/onboarding/farm-select",
  COMPLETE: "/",
};

/** AsyncStorage flag set to "true" once onboarding finishes. */
export const HAS_ONBOARDED_KEY = "has_onboarded";

/** Duration (ms) the splash screen is shown before advancing. */
export const SPLASH_DURATION_MS = 1800;

/** Transitions allowed by the state machine. */
export const ONBOARDING_TRANSITIONS: Record<OnboardingStep, OnboardingStep[]> = {
  SPLASH: ["WELCOME"],
  WELCOME: ["AUTH"],
  AUTH: ["LOCATION_PERM"],
  LOCATION_PERM: ["FARM_SELECT"],
  FARM_SELECT: ["COMPLETE"],
  COMPLETE: [],
};

export function canTransition(from: OnboardingStep, to: OnboardingStep): boolean {
  return ONBOARDING_TRANSITIONS[from].includes(to);
}
