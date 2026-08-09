/**
 * Farm field storage — routes to Supabase (authenticated) or
 * AsyncStorage (guest / offline).
 *
 * The web app writes directly to `saved_fields` via the Supabase JS client.
 * In the RN app we also support local-only storage for guests who have no
 * Supabase user_id.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import type { SavedField, NewFieldRecord } from "@/types/fields";
import { generateFieldId } from "@/lib/drawField";

const LOCAL_FIELDS_KEY = "farmrisk:local_fields";

/* ── Helpers ─────────────────────────────────────────────────────────── */

function asJson(value: Record<string, unknown>) {
  return value as unknown as Record<string, unknown>;
}

function mapRowToField(row: Record<string, unknown>): SavedField {
  return {
    id: row.id as string,
    fieldId: (row.field_id as string) ?? "",
    source: (row.source as "manual" | "detected") ?? "manual",
    year: (row.year as string) ?? "",
    countryCode: (row.country_code as string) ?? undefined,
    areaM2: (row.area_m2 as number) ?? null,
    confidence: (row.confidence as number) ?? null,
    geometry: asJson(row.geometry as Record<string, unknown>) ?? {},
    properties: asJson(row.properties as Record<string, unknown>) ?? {},
    savedAt: row.created_at as string,
    name: (row.field_name as string) ?? undefined,
    centerLat: (row.center_lat as number) ?? null,
    centerLng: (row.center_lng as number) ?? null,
    crops: (row.crops as string[]) ?? [],
    season: (row.season as string) ?? undefined,
    cropStage: (row.crop_stage as string) ?? undefined,
  };
}

function fieldToRow(
  userId: string,
  input: NewFieldRecord,
): Record<string, unknown> {
  return {
    user_id: userId,
    field_id: input.fieldId,
    field_name: input.fieldName,
    source: input.source,
    year: input.year,
    country_code: input.countryCode ?? null,
    area_m2: input.areaM2 ?? null,
    confidence: input.confidence ?? null,
    geometry: asJson(input.geometry),
    properties: asJson(input.properties),
    center_lat: input.centerLat ?? null,
    center_lng: input.centerLng ?? null,
    crops: input.crops ?? [],
    season: input.season ?? null,
    crop_stage: input.cropStage ?? null,
  };
}

/* ── AsyncStorage helpers (guests) ───────────────────────────────────── */

async function readLocalFields(): Promise<SavedField[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_FIELDS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeLocalFields(fields: SavedField[]): Promise<void> {
  await AsyncStorage.setItem(LOCAL_FIELDS_KEY, JSON.stringify(fields));
}

/* ── Public API ──────────────────────────────────────────────────────── */

export async function listFields(
  userId: string | null | undefined,
): Promise<SavedField[]> {
  if (userId) {
    const { data, error } = await supabase
      .from("saved_fields" as never)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapRowToField);
  }
  return readLocalFields();
}

export async function saveField(
  userId: string | null | undefined,
  input: NewFieldRecord,
): Promise<SavedField> {
  if (userId) {
    const row = fieldToRow(userId, input);
    const { data, error } = await supabase
      .from("saved_fields" as never)
      .insert(row)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapRowToField(data);
  }

  // Guest — persist locally
  const id = generateFieldId();
  const field: SavedField = {
    id,
    fieldId: input.fieldId,
    source: input.source,
    year: input.year,
    countryCode: input.countryCode,
    areaM2: input.areaM2,
    confidence: input.confidence,
    geometry: input.geometry,
    properties: input.properties,
    savedAt: new Date().toISOString(),
    name: input.fieldName,
    centerLat: input.centerLat,
    centerLng: input.centerLng,
    crops: input.crops,
    season: input.season,
    cropStage: input.cropStage,
  };
  const existing = await readLocalFields();
  existing.push(field);
  await writeLocalFields(existing);
  return field;
}

export async function deleteField(
  userId: string | null | undefined,
  id: string,
): Promise<void> {
  if (userId) {
    const { error } = await supabase
      .from("saved_fields" as never)
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return;
  }
  const fields = (await readLocalFields()).filter((f) => f.id !== id);
  await writeLocalFields(fields);
}
