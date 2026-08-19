import { getApiUrl } from "@/lib/api";
import { AIAdvisoryRequestPayload } from "@/types/ai";

/** Stable category key the frontend uses to pick icons/colors. */
export type WhatToDoCategory = "pest" | "irrigation" | "weather";

/** One "What To Do Today" recommendation (at most two are returned). */
export interface WhatToDoRecommendation {
  /** pest | irrigation | weather — stable, never parsed from the title text. */
  category: WhatToDoCategory;
  /** Source-native severity word (pest band / irrigation action / weather band). */
  severity: string;
  /** Short actionable title. */
  title: string;
  /** One short supporting hint. */
  hint: string;
}

export interface WhatToDoResponse {
  success?: boolean;
  crop_id?: string;
  crop_name?: string;
  is_general?: boolean;
  /** Language the returned recommendations were translated into. */
  language?: string;
  recommendations: WhatToDoRecommendation[];
}

export async function getWhatToDo(
  payload: AIAdvisoryRequestPayload
): Promise<WhatToDoResponse> {
  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}/api/ai/what-to-do`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`What To Do request failed: ${res.statusText}`);
  }

  return res.json();
}
