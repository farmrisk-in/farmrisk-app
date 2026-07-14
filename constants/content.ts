import { en } from "./languages/en";
import { hi } from "./languages/hi";
import { mr } from "./languages/mr";
import { ta } from "./languages/ta";
import { gu } from "./languages/gu";

export const content = {
  en,
  hi,
  mr,
  ta,
  gu,
};

export type LanguageCode = keyof typeof content;
export type TranslationType = typeof content.en;
