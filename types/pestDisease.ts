import { AIAdvisoryRequestPayload } from "@/types/ai";

/** A single RAG source that backs a pest/disease name or an action. */
export interface PestDiseaseSource {
  source: string;
  page: number | string;
  crop?: string;
  season?: string;
  score?: number;
}

export interface PestDiseaseAction {
  title: string;
  detail: string;
  sources?: PestDiseaseSource[];
}

/**
 * Structured response of the crop-specific Pest & Disease card.
 * The `risk` band and `score` are decided deterministically by the backend;
 * everything else is LLM-phrased and grounded in the retrieved ICAR chunks.
 */
export interface PestDiseaseCardResponse {
  success?: boolean;
  /** Deterministic band: HIGH / MEDIUM / LOW / EXTREME / MINIMAL. */
  risk: string;
  /** Crop-specific "why" narrative. */
  summary: string;
  /** Named potential pests/diseases, grounded in RAG (or broad categories). */
  potential: string[];
  /** 2-3 crop-specific actions with optional per-action citations. */
  actions: PestDiseaseAction[];
  /** Sources backing the named pests/diseases. */
  potential_sources?: PestDiseaseSource[];
  /** Deduped union of every cited RAG chunk. */
  sources?: PestDiseaseSource[];
  /** Machine-readable pest index (0-100). */
  score: number;
  /** Main deterministic driver description. */
  driver?: string;
  /** True when the card is the generic crop-agnostic advisory. */
  is_general?: boolean;
  /** Crop identity resolved by the backend (for display). */
  crop_name?: string;
  crop_stage?: string;
  season?: string;
  crop_id?: string;
}
