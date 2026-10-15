import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface MandiRow {
  s: string; // state
  d: string; // district
  m: string; // market
  c: string; // commodity
  v: string; // variety
  t: string; // arrival_date
  a: number; // min_price
  b: number; // max_price
  p: number; // modal_price
}

async function fetchMandiData(stateName: string): Promise<MandiRow[]> {
  if (!stateName) return [];

  // 1. Check the latest available arrival_date for this state
  const { data: latestRow } = await supabase
    .from("mandi_prices")
    .select("arrival_date")
    .eq("state", stateName)
    .order("arrival_date", { ascending: false })
    .limit(1);

  let cutoff: string;
  if (latestRow && latestRow.length > 0 && latestRow[0].arrival_date) {
    const d = new Date(latestRow[0].arrival_date);
    d.setDate(d.getDate() - 15);
    cutoff = d.toISOString().split("T")[0];
  } else {
    const d = new Date();
    d.setDate(d.getDate() - 15);
    cutoff = d.toISOString().split("T")[0];
  }

  // 2. Query market records within the 15-day reporting snapshot
  const { data: result, error: dbError } = await supabase
    .from("mandi_prices")
    .select("*")
    .eq("state", stateName)
    .gte("arrival_date", cutoff)
    .limit(10000);

  if (dbError) throw dbError;

  return (result || []).map((r: any) => ({
    s: r.state || "",
    d: r.district || "",
    m: r.market || "",
    c: r.commodity || "",
    v: r.variety || "",
    t: r.arrival_date || "",
    a: Number(r.min_price) || 0,
    b: Number(r.max_price) || 0,
    p: Number(r.modal_price) || 0,
  }));
}

export function useMandiData(stateName: string) {
  const query = useQuery<MandiRow[], Error>({
    queryKey: ["mandi-prices", stateName],
    queryFn: () => fetchMandiData(stateName),
    enabled: Boolean(stateName),
    staleTime: 1000 * 60 * 30, // 30 mins
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
  });

  return {
    data: query.data || [],
    loading: query.isLoading && !query.data,
    isFetching: query.isFetching,
    error: query.error ? query.error.message : null,
    refetch: query.refetch,
  };
}
