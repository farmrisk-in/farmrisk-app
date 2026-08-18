import { getApiUrl } from "@/lib/api";
import { AIAdvisoryRequestPayload } from "@/types/ai";
import { PestDiseaseCardResponse } from "@/types/pestDisease";

export * from "@/types/pestDisease";

export async function getPestDiseaseCard(
  payload: AIAdvisoryRequestPayload
): Promise<PestDiseaseCardResponse> {
  const baseUrl = getApiUrl();
  const res = await fetch(`${baseUrl}/api/ai/pest-disease`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Pest & Disease card request failed: ${res.statusText}`);
  }

  return res.json();
}
