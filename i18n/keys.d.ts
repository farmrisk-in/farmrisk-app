/**
 * Strict TypeScript integration for react-i18next.
 *
 * Augments i18next's `CustomTypeOptions` with the English resources, so:
 *  - `t("common:nav.signIn")` autocompletes in the editor
 *  - Misspelled / non-existent keys fail at compile time (tsc)
 *  - Interpolation variables (e.g. `{{temp}}`) are type-checked
 *
 * `en` is the source of truth — add any new key to en/*.json first.
 */
import "i18next";
import common from "./locales/en/common.json";
import dashboard from "./locales/en/dashboard.json";
import weather from "./locales/en/weather.json";
import search from "./locales/en/search.json";
import profile from "./locales/en/profile.json";
import auth from "./locales/en/auth.json";
import calendar from "./locales/en/calendar.json";
import landing from "./locales/en/landing.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof common;
      dashboard: typeof dashboard;
      weather: typeof weather;
      search: typeof search;
      profile: typeof profile;
      auth: typeof auth;
      calendar: typeof calendar;
      landing: typeof landing;
    };
  }
}
