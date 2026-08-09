/**
 * Static i18next resources — one entry per language × namespace.
 * Imported eagerly (Metro needs static imports; no dynamic require).
 *
 * NOTE: `en` is the source of truth for key shapes. The keys.d.ts
 * module augmentation types `t()` against the en resources.
 */
import commonEn from "./locales/en/common.json";
import dashboardEn from "./locales/en/dashboard.json";
import weatherEn from "./locales/en/weather.json";
import searchEn from "./locales/en/search.json";
import profileEn from "./locales/en/profile.json";
import authEn from "./locales/en/auth.json";
import calendarEn from "./locales/en/calendar.json";
import landingEn from "./locales/en/landing.json";
import onboardingEn from "./locales/en/onboarding.json";

import commonHi from "./locales/hi/common.json";
import dashboardHi from "./locales/hi/dashboard.json";
import weatherHi from "./locales/hi/weather.json";
import searchHi from "./locales/hi/search.json";
import profileHi from "./locales/hi/profile.json";
import authHi from "./locales/hi/auth.json";
import calendarHi from "./locales/hi/calendar.json";
import landingHi from "./locales/hi/landing.json";
import onboardingHi from "./locales/hi/onboarding.json";

import commonMr from "./locales/mr/common.json";
import dashboardMr from "./locales/mr/dashboard.json";
import weatherMr from "./locales/mr/weather.json";
import searchMr from "./locales/mr/search.json";
import profileMr from "./locales/mr/profile.json";
import authMr from "./locales/mr/auth.json";
import calendarMr from "./locales/mr/calendar.json";
import landingMr from "./locales/mr/landing.json";
import onboardingMr from "./locales/mr/onboarding.json";

import commonTa from "./locales/ta/common.json";
import dashboardTa from "./locales/ta/dashboard.json";
import weatherTa from "./locales/ta/weather.json";
import searchTa from "./locales/ta/search.json";
import profileTa from "./locales/ta/profile.json";
import authTa from "./locales/ta/auth.json";
import calendarTa from "./locales/ta/calendar.json";
import landingTa from "./locales/ta/landing.json";
import onboardingTa from "./locales/ta/onboarding.json";

import commonGu from "./locales/gu/common.json";
import dashboardGu from "./locales/gu/dashboard.json";
import weatherGu from "./locales/gu/weather.json";
import searchGu from "./locales/gu/search.json";
import profileGu from "./locales/gu/profile.json";
import authGu from "./locales/gu/auth.json";
import calendarGu from "./locales/gu/calendar.json";
import landingGu from "./locales/gu/landing.json";
import onboardingGu from "./locales/gu/onboarding.json";

export const resources = {
  en: {
    common: commonEn,
    dashboard: dashboardEn,
    weather: weatherEn,
    search: searchEn,
    profile: profileEn,
    auth: authEn,
    calendar: calendarEn,
    landing: landingEn,
    onboarding: onboardingEn,
  },
  hi: {
    common: commonHi,
    dashboard: dashboardHi,
    weather: weatherHi,
    search: searchHi,
    profile: profileHi,
    auth: authHi,
    calendar: calendarHi,
    landing: landingHi,
    onboarding: onboardingHi,
  },
  mr: {
    common: commonMr,
    dashboard: dashboardMr,
    weather: weatherMr,
    search: searchMr,
    profile: profileMr,
    auth: authMr,
    calendar: calendarMr,
    landing: landingMr,
    onboarding: onboardingMr,
  },
  ta: {
    common: commonTa,
    dashboard: dashboardTa,
    weather: weatherTa,
    search: searchTa,
    profile: profileTa,
    auth: authTa,
    calendar: calendarTa,
    landing: landingTa,
    onboarding: onboardingTa,
  },
  gu: {
    common: commonGu,
    dashboard: dashboardGu,
    weather: weatherGu,
    search: searchGu,
    profile: profileGu,
    auth: authGu,
    calendar: calendarGu,
    landing: landingGu,
    onboarding: onboardingGu,
  },
} as const;
