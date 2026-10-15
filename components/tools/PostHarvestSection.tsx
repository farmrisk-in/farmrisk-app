import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Share,
} from "react-native";
import Svg, {
  Path,
  Circle,
  Line,
  Text as SvgText,
  G,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { useColorScheme } from "nativewind";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import {
  Store01Icon,
  Money01Icon,
  Alert02Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Download01Icon,
  Tick02Icon,
  AnalyticsUpIcon,
  ChartLineData01Icon,
  Building01Icon,
} from "@hugeicons/core-free-icons";
import { useMandiData, MandiRow } from "@/hooks/useMandiData";
import { useLocationContext } from "@/providers/LocationProvider";
import { useLocked } from "@/hooks/useLocked";
import { LockedCard } from "@/components/ui/LockedCard";
import { NoLocationCard } from "@/components/ui/NoLocationCard";
import { NearestKVKSection } from "@/components/tools/NearestKVKSection";

const STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chattisgarh",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Meghalaya",
  "NCT of Delhi",
  "Nagaland",
  "Odisha",
  "Pondicherry",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

function rupee(n: number | null | undefined): string {
  if (n === null || n === undefined || !isFinite(n)) return "₹—";
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

function median(a: number[]): number | null {
  const s = a.filter((v) => isFinite(v)).sort((x, y) => x - y);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function human(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getResolvedData(
  rows: MandiRow[],
  dist: string,
  crop: string,
  day: string
) {
  let relaxed: any = null;
  const byCrop = rows.filter((r) => !crop || r.c === crop);
  const byBoth = byCrop.filter((r) => !dist || r.d === dist);

  const hit = byBoth.filter((r) => r.t === day);
  if (hit.length) return { view: hit, relaxed, resolvedDay: day };

  const days = Array.from(new Set(byBoth.map((r) => r.t))).sort();
  if (days.length) {
    const last = days[days.length - 1];
    relaxed = { kind: "day", from: day, to: last };
    return {
      view: byBoth.filter((r) => r.t === last),
      relaxed,
      resolvedDay: last,
    };
  }

  if (dist) {
    const wideDays = Array.from(new Set(byCrop.map((r) => r.t))).sort();
    if (wideDays.length) {
      const d2 = wideDays[wideDays.length - 1];
      relaxed = { kind: "district", from: dist, to: d2 };
      return {
        view: byCrop.filter((r) => r.t === d2),
        relaxed,
        resolvedDay: d2,
      };
    }
  }

  return { view: [], relaxed: null, resolvedDay: day };
}

// -------------------------------------------------------------
// SELECT DROPDOWN COMPONENT (High z-index, non-shifting overlay)
// -------------------------------------------------------------
interface SelectDropdownProps {
  label: string;
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (val: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function SelectDropdown({
  label,
  options,
  selected,
  onSelect,
  isOpen,
  onToggle,
  disabled = false,
}: SelectDropdownProps) {
  const currentLabel =
    options.find((o) => o.value === selected)?.label || selected || "Select";

  return (
    <View style={{ zIndex: isOpen ? 50 : 1 }} className="relative flex-1 min-w-[140px]">
      <Text className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
        {label}
      </Text>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onToggle}
        disabled={disabled}
        className={`flex-row items-center justify-between px-3 py-2.5 rounded-xl border border-border bg-card shadow-sm ${
          disabled ? "opacity-50" : ""
        }`}
      >
        <Text
          numberOfLines={1}
          className="text-xs font-semibold text-foreground flex-1 pr-1.5"
        >
          {currentLabel}
        </Text>
        <Icon
          icon={isOpen ? ChevronUpIcon : ChevronDownIcon}
          size={14}
          className="text-muted-foreground"
        />
      </TouchableOpacity>

      {isOpen && (
        <View
          style={{
            position: "absolute",
            top: 56,
            left: 0,
            right: 0,
            zIndex: 100,
            elevation: 25,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
          }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: 200 }}
            contentContainerStyle={{ paddingVertical: 4 }}
          >
            {options.map((item) => {
              const isSelected = selected === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  activeOpacity={0.7}
                  onPress={() => {
                    onSelect(item.value);
                    onToggle();
                  }}
                  className={`flex-row items-center justify-between px-3.5 py-2.5 border-b border-border last:border-b-0 ${
                    isSelected ? "bg-muted" : ""
                  }`}
                >
                  <Text
                    className={`text-xs flex-1 pr-2 ${
                      isSelected
                        ? "font-bold text-emerald-600 dark:text-emerald-400"
                        : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </Text>
                  {isSelected && (
                    <Icon
                      icon={Tick02Icon}
                      size={14}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// -------------------------------------------------------------
// MAIN POST-HARVEST SECTION COMPONENT
// -------------------------------------------------------------
export function PostHarvestSection() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { isLocked } = useLocked();
  const { location, isResolving } = useLocationContext();

  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedCommodity, setSelectedCommodity] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [sort, setSort] = useState<{ key: keyof MandiRow; dir: number }>({
    key: "p",
    dir: -1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12;

  // 1. Auto-resolve State from location
  useEffect(() => {
    if (!selectedState && location) {
      const locText = (
        (location.displayName || "") +
        " " +
        (location.name || "")
      ).toLowerCase();
      const s = STATES.find((st) => locText.includes(st.toLowerCase()));
      if (s) {
        setSelectedState(s);
      } else {
        setSelectedState("Gujarat");
      }
    } else if (!selectedState && !location && !isResolving) {
      setSelectedState("Gujarat");
    }
  }, [location, selectedState, isResolving]);

  // 2. Fetch mandi rows from Supabase (cached via TanStack Query)
  const { data: rows, loading: isLoading } = useMandiData(selectedState);

  // 3. Derive options
  const districts = useMemo(
    () => Array.from(new Set(rows.map((r) => r.d))).filter(Boolean).sort(),
    [rows]
  );
  const commodities = useMemo(
    () => Array.from(new Set(rows.map((r) => r.c))).filter(Boolean).sort(),
    [rows]
  );
  const days = useMemo(
    () => Array.from(new Set(rows.map((r) => r.t))).sort().reverse(),
    [rows]
  );

  // Auto-select latest day if not set
  useEffect(() => {
    if (days.length > 0 && (!selectedDay || !days.includes(selectedDay))) {
      setSelectedDay(days[0]);
    }
  }, [days, selectedDay]);

  // Reset pagination on filter or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedState, selectedDistrict, selectedCommodity, selectedDay, sort]);

  // 4. Resolve relaxed data view
  const { view, relaxed, resolvedDay } = useMemo(() => {
    return getResolvedData(
      rows,
      selectedDistrict,
      selectedCommodity,
      selectedDay
    );
  }, [rows, selectedDistrict, selectedCommodity, selectedDay]);

  // Sorting
  const sortedView = useMemo(() => {
    return [...view].sort((a, b) => {
      const x = a[sort.key];
      const y = b[sort.key];
      if (["a", "b", "p"].includes(sort.key)) {
        return (
          (((y as number) || 0) - ((x as number) || 0)) *
          (sort.dir === 1 ? -1 : 1)
        );
      }
      return String(x).localeCompare(String(y)) * (sort.dir === 1 ? 1 : -1);
    });
  }, [view, sort]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedView.length / rowsPerPage));
  const paginatedView = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedView.slice(start, start + rowsPerPage);
  }, [sortedView, currentPage, rowsPerPage]);

  const bestRow = sortedView.reduce((a, b) => {
    if (!a) return b;
    return (b.p || 0) > (a.p || 0) ? b : a;
  }, sortedView[0] as MandiRow | undefined);

  const handleSort = (k: keyof MandiRow) => {
    if (sort.key === k) setSort({ key: k, dir: -sort.dir });
    else setSort({ key: k, dir: -1 });
  };

  // Stats calculation
  const modal = median(view.map((r) => r.p));
  const mins = view.map((r) => r.a).filter(isFinite);
  const maxs = view.map((r) => r.b).filter(isFinite);
  const minVal = mins.length ? Math.min(...mins) : null;
  const maxVal = maxs.length ? Math.max(...maxs) : null;
  const loRow = view.find((r) => r.a === minVal);
  const hiRow = view.find((r) => r.b === maxVal);
  const mktCount = new Set(view.map((r) => r.m)).size;
  const cCount = new Set(view.map((r) => r.c)).size;

  let deltaStr = "";
  let isUp = true;
  if (selectedCommodity && modal) {
    const pool = rows.filter(
      (r) =>
        r.c === selectedCommodity &&
        (!selectedDistrict || relaxed ? true : r.d === selectedDistrict)
    );
    const dDays = Array.from(new Set(pool.map((r) => r.t))).sort();
    const idx = dDays.indexOf(resolvedDay);
    if (idx > 0) {
      const prev = median(
        pool.filter((r) => r.t === dDays[idx - 1]).map((r) => r.p)
      );
      if (prev) {
        const pc = ((modal - prev) / prev) * 100;
        if (Math.abs(pc) >= 0.5) {
          isUp = pc > 0;
          deltaStr = `${isUp ? "▲" : "▼"}${Math.abs(pc).toFixed(1)}%`;
        }
      }
    }
  }

  // Trend chart points
  const trendPoints = useMemo(() => {
    if (!selectedCommodity) return [];
    const pool = rows.filter(
      (r) =>
        r.c === selectedCommodity &&
        (!selectedDistrict || relaxed ? true : r.d === selectedDistrict)
    );
    const dList = Array.from(new Set(pool.map((r) => r.t))).sort();
    if (dList.length < 3) return [];

    return dList
      .map((d) => {
        const dayRows = pool.filter((r) => r.t === d).map((r) => r.p);
        return { t: d, v: median(dayRows) };
      })
      .filter((p) => p.v !== null) as { t: string; v: number }[];
  }, [rows, selectedCommodity, selectedDistrict, relaxed]);

  // Top markets list
  const topMarkets = useMemo(() => {
    return [...view].sort((a, b) => (b.p || 0) - (a.p || 0)).slice(0, 10);
  }, [view]);

  // Overall bounds for top markets range bars
  const { topMinBound, topMaxBound } = useMemo(() => {
    if (!topMarkets.length) return { topMinBound: 0, topMaxBound: 1 };
    const lo = Math.min(...topMarkets.map((r) => r.a || r.p));
    let hi = Math.max(...topMarkets.map((r) => r.b || r.p));
    if (!(hi > lo)) hi = lo + 1;
    return { topMinBound: lo, topMaxBound: hi };
  }, [topMarkets]);

  // CSV Share action
  const handleShareCSV = async () => {
    if (!view.length) return;
    const head = [
      "District",
      "Market",
      "Commodity",
      "Variety",
      "Arrival_Date",
      "Min_Price",
      "Max_Price",
      "Modal_Price",
    ];
    const lines = [head.join(",")].concat(
      view.map((r) =>
        [r.d, r.m, r.c, r.v, r.t, r.a, r.b, r.p]
          .map(
            (v) =>
              '"' + String(v === null ? "" : v).replace(/"/g, '""') + '"'
          )
          .join(",")
      )
    );
    const csvContent = lines.join("\n");
    try {
      await Share.share({
        title: `mandi-${selectedState}-${resolvedDay || selectedDay}.csv`,
        message: csvContent,
      });
    } catch (e) {
      console.warn("Share CSV failed:", e);
    }
  };

  const handleStateChange = (val: string) => {
    setSelectedState(val);
    setSelectedDistrict("");
    setSelectedCommodity("");
    setSelectedDay("");
  };

  if (isLocked) {
    return (
      <View className="mt-4">
        <LockedCard
          title="Post-Harvest Intelligence"
          description="APMC mandi rates, wholesale market arrivals, commodity price trends, and storage analytics are exclusive to registered accounts. Please sign in to access."
        />
      </View>
    );
  }

  if (!location && !isResolving) {
    return (
      <View className="mt-4">
        <NoLocationCard message="Select a location to view APMC mandi prices and post-harvest market data." />
      </View>
    );
  }

  return (
    <View className="mt-4 pb-12">
      {/* Dismiss backdrop when a dropdown is open */}
      {openDropdown !== null && (
        <TouchableWithoutFeedback onPress={() => setOpenDropdown(null)}>
          <View
            style={{
              position: "absolute",
              top: -50,
              left: -30,
              right: -30,
              bottom: -50,
              zIndex: 35,
            }}
          />
        </TouchableWithoutFeedback>
      )}

      {/* ============================================================== */}
      {/* 1ST SECTION: MANDI PRICE TRACKER & INPUTS (SINGLE BOX) */}
      {/* ============================================================== */}
      <View
        style={{ zIndex: openDropdown ? 50 : 1 }}
        className="bg-card border border-border rounded-3xl p-5 shadow-sm mb-6"
      >
          {/* Card Header with CSV button */}
          <View className="flex-row items-center justify-between pb-4 border-b border-border">
            <View className="flex-row items-center gap-3 flex-1 pr-2">
              <View
                style={{
                  backgroundColor: isDark
                    ? "rgba(16, 185, 129, 0.15)"
                    : "rgba(16, 185, 129, 0.12)",
                }}
                className="w-10 h-10 rounded-2xl items-center justify-center"
              >
                <Icon
                  icon={Store01Icon}
                  size={22}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-foreground">
                  Mandi Price Tracker
                </Text>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  Wholesale APMC market arrivals & trading rates
                </Text>
              </View>
            </View>

            {/* CSV Share Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleShareCSV}
              disabled={!view.length}
              style={{
                backgroundColor: isDark
                  ? "rgba(16, 185, 129, 0.15)"
                  : "rgba(16, 185, 129, 0.1)",
                borderColor: isDark
                  ? "rgba(16, 185, 129, 0.3)"
                  : "rgba(16, 185, 129, 0.25)",
              }}
              className="px-3 py-1.5 rounded-xl border flex-row items-center gap-1.5"
            >
              <Icon
                icon={Download01Icon}
                size={14}
                className="text-emerald-600 dark:text-emerald-400"
              />
              <Text className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                CSV
              </Text>
            </TouchableOpacity>
          </View>

          {/* 4 Dropdown Filter Controls */}
          <View className="pt-4 pb-2">
            <View className="flex-row gap-2.5 mb-3">
              {/* 1. State */}
              <SelectDropdown
                label="State"
                options={STATES.map((s) => ({ value: s, label: s }))}
                selected={selectedState}
                onSelect={handleStateChange}
                isOpen={openDropdown === "state"}
                onToggle={() =>
                  setOpenDropdown((prev) => (prev === "state" ? null : "state"))
                }
              />

              {/* 2. District */}
              <SelectDropdown
                label="District"
                options={[
                  { value: "", label: "All Districts" },
                  ...districts.map((d) => ({ value: d, label: d })),
                ]}
                selected={selectedDistrict}
                onSelect={setSelectedDistrict}
                isOpen={openDropdown === "district"}
                onToggle={() =>
                  setOpenDropdown((prev) =>
                    prev === "district" ? null : "district"
                  )
                }
                disabled={!selectedState || isLoading}
              />
            </View>

            <View className="flex-row gap-2.5">
              {/* 3. Commodity */}
              <SelectDropdown
                label="Commodity"
                options={[
                  { value: "", label: "All Commodities" },
                  ...commodities.map((c) => ({ value: c, label: c })),
                ]}
                selected={selectedCommodity}
                onSelect={setSelectedCommodity}
                isOpen={openDropdown === "commodity"}
                onToggle={() =>
                  setOpenDropdown((prev) =>
                    prev === "commodity" ? null : "commodity"
                  )
                }
                disabled={!selectedState || isLoading}
              />

              {/* 4. Reporting Day */}
              <SelectDropdown
                label="Reporting Day"
                options={days.map((d) => ({ value: d, label: human(d) }))}
                selected={resolvedDay || selectedDay}
                onSelect={setSelectedDay}
                isOpen={openDropdown === "day"}
                onToggle={() =>
                  setOpenDropdown((prev) => (prev === "day" ? null : "day"))
                }
                disabled={!selectedState || isLoading}
              />
            </View>
          </View>

          {/* Relaxed Data Notice */}
          {relaxed && (
            <View
              style={{
                backgroundColor: isDark
                  ? "rgba(245, 158, 11, 0.15)"
                  : "rgba(245, 158, 11, 0.1)",
                borderColor: isDark
                  ? "rgba(245, 158, 11, 0.3)"
                  : "rgba(245, 158, 11, 0.25)",
              }}
              className="mt-3 p-3 rounded-2xl border flex-row items-start gap-2.5"
            >
              <Icon
                icon={Alert02Icon}
                size={16}
                className="text-amber-600 dark:text-amber-400 mt-0.5"
              />
              <Text className="text-xs text-amber-800 dark:text-amber-200 flex-1 leading-5 font-medium">
                {relaxed.kind === "day" ? (
                  <>
                    <Text className="font-bold">
                      No returns filed for {human(relaxed.from)}.{" "}
                    </Text>
                    Showing {human(relaxed.to)}, the most recent day these
                    markets reported.
                  </>
                ) : (
                  <>
                    <Text className="font-bold">
                      {relaxed.from} filed nothing in this window.{" "}
                    </Text>
                    Showing the nearest reporting markets across {selectedState}{" "}
                    for {human(relaxed.to)}.
                  </>
                )}
              </Text>
            </View>
          )}

          {/* Loading Indicator inside Card 1 */}
          {isLoading && (
            <View className="pt-6 pb-2 items-center justify-center gap-2.5">
              <ActivityIndicator size="small" color="#10b981" />
              <Text className="text-xs text-muted-foreground font-medium">
                Fetching APMC market prices from Supabase...
              </Text>
            </View>
          )}

          {/* Empty State inside Card 1 */}
          {!isLoading && !view.length && (
            <View className="py-8 px-4 text-center items-center justify-center rounded-2xl border border-dashed border-border bg-muted mt-3">
              <Text className="font-bold text-sm text-foreground text-center mb-1">
                No market filed this crop in the stored window
              </Text>
              <Text className="text-xs text-muted-foreground text-center max-w-xs leading-relaxed">
                Kharif crops only appear once harvest arrivals start. Widen the
                district or pick another commodity.
              </Text>
            </View>
          )}
        </View>

        {/* If we have data and not loading, render the remaining standalone sections */}
        {!isLoading && Boolean(view.length) && (
          <>
            {/* ============================================================== */}
            {/* 2ND SECTION: 4 SEPARATE STAT BOXES (2x2 GRID, NOT IN A BIG BOX) */}
            {/* ============================================================== */}
            <View className="mb-6">
              <View className="flex-row gap-3 mb-3">
                {/* Stat 1: Modal Price */}
                <View
                  style={{
                    backgroundColor: isDark
                      ? "rgba(16, 185, 129, 0.12)"
                      : "rgba(16, 185, 129, 0.08)",
                    borderColor: isDark
                      ? "rgba(16, 185, 129, 0.25)"
                      : "rgba(16, 185, 129, 0.2)",
                  }}
                  className="flex-1 p-4 rounded-3xl border shadow-sm flex-col justify-between"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Modal Price
                    </Text>
                    <Icon
                      icon={Money01Icon}
                      size={15}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                  </View>
                  <View className="flex-row items-baseline gap-1.5 my-1.5">
                    <Text className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {rupee(modal)}
                    </Text>
                    {deltaStr !== "" && (
                      <Text
                        className={`text-xs font-bold ${
                          isUp
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {deltaStr}
                      </Text>
                    )}
                  </View>
                  <Text className="text-[11px] text-muted-foreground font-medium">
                    Median of {view.length} listings
                  </Text>
                </View>

                {/* Stat 2: Lowest Bid */}
                <View className="flex-1 p-4 rounded-3xl border border-border bg-card shadow-sm flex-col justify-between">
                  <Text className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Lowest Bid
                  </Text>
                  <Text className="text-2xl font-bold text-foreground font-mono my-1.5">
                    {rupee(minVal)}
                  </Text>
                  <Text
                    numberOfLines={2}
                    className="text-[11px] text-muted-foreground font-medium"
                  >
                    {loRow?.m || "Per quintal"}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                {/* Stat 3: Highest Bid */}
                <View className="flex-1 p-4 rounded-3xl border border-border bg-card shadow-sm flex-col justify-between">
                  <Text className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Highest Bid
                  </Text>
                  <Text className="text-2xl font-bold text-foreground font-mono my-1.5">
                    {rupee(maxVal)}
                  </Text>
                  <Text
                    numberOfLines={2}
                    className="text-[11px] text-muted-foreground font-medium"
                  >
                    {hiRow?.m || "Per quintal"}
                  </Text>
                </View>

                {/* Stat 4: Markets Reporting */}
                <View className="flex-1 p-4 rounded-3xl border border-border bg-card shadow-sm flex-col justify-between">
                  <Text className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Reporting
                  </Text>
                  <Text className="text-2xl font-bold text-foreground my-1.5">
                    {mktCount} Markets
                  </Text>
                  <Text className="text-[11px] text-muted-foreground font-medium">
                    {cCount} commodities listed
                  </Text>
                </View>
              </View>
            </View>

            {/* ============================================================== */}
            {/* 3RD SECTION: TOP MARKETS BY RATE (DEDICATED BOX & HEADER) */}
            {/* ============================================================== */}
            {topMarkets.length >= 2 && (
              <View className="mb-6">
                <SectionHeader
                  icon={AnalyticsUpIcon}
                  title="Top Markets by Rate"
                  rightContent={
                    <View
                      style={{
                        backgroundColor: isDark
                          ? "rgba(255, 255, 255, 0.06)"
                          : "rgba(0, 0, 0, 0.05)",
                      }}
                      className="px-2.5 py-1 rounded-xl"
                    >
                      <Text className="text-[11px] font-bold text-muted-foreground">
                        Top {topMarkets.length}
                      </Text>
                    </View>
                  }
                />

                <View className="bg-card border border-border rounded-3xl p-5 shadow-sm">
                  {/* Subtitle & Legend */}
                  <View className="flex-row items-center justify-between pb-3 mb-2 border-b border-border">
                    <Text className="text-xs text-muted-foreground">
                      Ranked by highest modal rate
                    </Text>
                    <View className="flex-row items-center gap-3">
                      <View className="flex-row items-center gap-1.5">
                        <View
                          style={{
                            backgroundColor: isDark
                              ? "rgba(16, 185, 129, 0.35)"
                              : "rgba(16, 185, 129, 0.3)",
                          }}
                          className="w-3.5 h-1.5 rounded-full"
                        />
                        <Text className="text-[10px] text-muted-foreground">
                          Bid range
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1.5">
                        <View className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                        <Text className="text-[10px] text-muted-foreground">
                          Modal
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Edge-hugging, spacious market rate rows (No extra boxed frame) */}
                  <View>
                    {topMarkets.map((r, i) => {
                      const lo = topMinBound;
                      const hi = topMaxBound;
                      const span = Math.max(hi - lo, 1);
                      const minPrice = r.a ?? r.p;
                      const maxPrice = r.b ?? r.p;
                      const modalPrice = r.p ?? r.a;

                      const leftPct = Math.max(
                        0,
                        Math.min(100, ((minPrice - lo) / span) * 100)
                      );
                      const rightPct = Math.max(
                        0,
                        Math.min(100, ((maxPrice - lo) / span) * 100)
                      );
                      const widthPct = Math.max(4, rightPct - leftPct);
                      const modalPct = Math.max(
                        0,
                        Math.min(100, ((modalPrice - lo) / span) * 100)
                      );

                      return (
                        <View
                          key={i}
                          className="py-3 border-b border-border last:border-b-0"
                        >
                          {/* Top Row: Market Name on left (hugging edge), Modal Price on right */}
                          <View className="flex-row items-start justify-between mb-2">
                            <View className="flex-row items-start gap-2.5 flex-1 pr-2">
                              <View
                                style={{
                                  backgroundColor: isDark
                                    ? "rgba(255, 255, 255, 0.07)"
                                    : "rgba(0, 0, 0, 0.05)",
                                }}
                                className="w-5 h-5 rounded-full items-center justify-center mt-0.5"
                              >
                                <Text className="text-[10px] font-bold text-muted-foreground">
                                  {i + 1}
                                </Text>
                              </View>
                              <View className="flex-1">
                                <Text className="text-sm font-bold text-foreground">
                                  {r.m}
                                </Text>
                                {r.d ? (
                                  <Text className="text-[11px] text-muted-foreground mt-0.5">
                                    {r.d}
                                  </Text>
                                ) : null}
                              </View>
                            </View>
                            <Text className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                              {rupee(r.p)}
                            </Text>
                          </View>

                          {/* Bottom Row: Min ₹ label, Range bar with modal dot, Max ₹ label */}
                          <View className="flex-row items-center gap-2 px-1">
                            <Text className="text-[11px] text-muted-foreground font-mono w-12 text-left">
                              {rupee(minPrice)}
                            </Text>

                            <View
                              style={{
                                backgroundColor: isDark
                                  ? "rgba(255, 255, 255, 0.06)"
                                  : "rgba(0, 0, 0, 0.05)",
                              }}
                              className="flex-1 h-3 rounded-full overflow-hidden relative justify-center"
                            >
                              {/* Bid range bar */}
                              <View
                                style={{
                                  left: `${leftPct}%`,
                                  width: `${widthPct}%`,
                                  backgroundColor: isDark
                                    ? "rgba(16, 185, 129, 0.45)"
                                    : "rgba(16, 185, 129, 0.35)",
                                }}
                                className="absolute top-0 bottom-0 rounded-full"
                              />
                              {/* Modal rate circle marker */}
                              <View
                                style={{
                                  left: `${modalPct}%`,
                                  marginLeft: -5,
                                  backgroundColor: "#10b981",
                                  borderColor: isDark ? "#1e293b" : "#ffffff",
                                }}
                                className="absolute w-2.5 h-2.5 rounded-full border-2"
                              />
                            </View>

                            <Text className="text-[11px] text-muted-foreground font-mono w-12 text-right">
                              {rupee(maxPrice)}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {/* ============================================================== */}
            {/* 4TH SECTION: PRICE TREND LINE GRAPH (DEDICATED BOX & HEADER) */}
            {/* ============================================================== */}
            {trendPoints.length >= 3 && (
              <View className="mb-6">
                <SectionHeader
                  icon={ChartLineData01Icon}
                  title={`${selectedCommodity || "Commodity"} Price Trend`}
                  rightContent={
                    <View
                      style={{
                        backgroundColor: isDark
                          ? "rgba(255, 255, 255, 0.06)"
                          : "rgba(0, 0, 0, 0.05)",
                      }}
                      className="px-2.5 py-1 rounded-xl"
                    >
                      <Text className="text-[11px] font-bold text-muted-foreground">
                        {trendPoints.length} Days
                      </Text>
                    </View>
                  }
                />

                <View className="bg-card border border-border rounded-3xl p-5 shadow-sm">
                  <Text className="text-xs text-muted-foreground mb-4">
                    Median modal rate over the last {trendPoints.length} reporting days
                  </Text>

                  {/* Line Graph (Rendered directly, NO extra nested box!) */}
                  {(() => {
                    const vals = trendPoints.map((p) => p.v);
                    let lo = Math.min(...vals);
                    let hi = Math.max(...vals);
                    const span = hi - lo || 1;
                    lo -= span * 0.15;
                    hi += span * 0.15;

                    const w = 360;
                    const h = 145;
                    const padL = 54;
                    const padR = 12;
                    const padT = 14;
                    const padB = 26;

                    const X = (i: number) =>
                      padL + (i / (trendPoints.length - 1)) * (w - padL - padR);
                    const Y = (v: number) =>
                      padT + (1 - (v - lo) / (hi - lo)) * (h - padT - padB);

                    const lineD = trendPoints
                      .map(
                        (p, i) =>
                          `${i ? "L" : "M"} ${X(i).toFixed(1)},${Y(p.v).toFixed(1)}`
                      )
                      .join(" ");
                    const areaD = `${lineD} L ${X(
                      trendPoints.length - 1
                    ).toFixed(1)},${h - padB} L ${X(0).toFixed(1)},${
                      h - padB
                    } Z`;

                    const gridVals = [hi, (hi + lo) / 2, lo];

                    return (
                      <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
                        <Defs>
                          <LinearGradient
                            id="trendAreaGrad"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <Stop
                              offset="0"
                              stopColor="#10b981"
                              stopOpacity="0.3"
                            />
                            <Stop
                              offset="1"
                              stopColor="#10b981"
                              stopOpacity="0.0"
                            />
                          </LinearGradient>
                        </Defs>

                        {/* Grid lines */}
                        {gridVals.map((v, i) => {
                          const y = Y(v);
                          return (
                            <G key={`tgrid-${i}`}>
                              <Line
                                x1={padL}
                                x2={w - padR}
                                y1={y}
                                y2={y}
                                stroke={
                                  isDark
                                    ? "rgba(255, 255, 255, 0.08)"
                                    : "rgba(0, 0, 0, 0.06)"
                                }
                                strokeWidth={1}
                                strokeDasharray="4,4"
                              />
                              <SvgText
                                x={padL - 8}
                                y={y + 3}
                                fontSize="10"
                                textAnchor="end"
                                fill={isDark ? "#94a3b8" : "#64748b"}
                                fontWeight="500"
                              >
                                {rupee(v)}
                              </SvgText>
                            </G>
                          );
                        })}

                        <Path d={areaD} fill="url(#trendAreaGrad)" />
                        <Path
                          d={lineD}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />

                        {trendPoints.map((p, i) => (
                          <Circle
                            key={`tpt-${i}`}
                            cx={X(i)}
                            cy={Y(p.v)}
                            r={3}
                            fill="#10b981"
                            stroke={isDark ? "#0f172a" : "#ffffff"}
                            strokeWidth={1.5}
                          />
                        ))}

                        {/* Date labels */}
                        <SvgText
                          x={X(0)}
                          y={h - 8}
                          fontSize="10"
                          textAnchor="start"
                          fill={isDark ? "#94a3b8" : "#64748b"}
                        >
                          {human(trendPoints[0].t)}
                        </SvgText>
                        <SvgText
                          x={X(trendPoints.length - 1)}
                          y={h - 8}
                          fontSize="10"
                          textAnchor="end"
                          fill={isDark ? "#94a3b8" : "#64748b"}
                        >
                          {human(trendPoints[trendPoints.length - 1].t)}
                        </SvgText>
                      </Svg>
                    );
                  })()}
                </View>
              </View>
            )}

            {/* ============================================================== */}
            {/* 5TH SECTION: EVERY MARKET THAT FILED TABLE (DEDICATED BOX & HEADER) */}
            {/* ============================================================== */}
            <View className="mb-6">
              <SectionHeader
                icon={Building01Icon}
                title="Every Market That Filed"
                rightContent={
                  <View
                    style={{
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.06)"
                        : "rgba(0, 0, 0, 0.05)",
                    }}
                    className="px-2.5 py-1 rounded-xl"
                  >
                    <Text className="text-[11px] font-bold text-muted-foreground">
                      {sortedView.length} Records
                    </Text>
                  </View>
                }
              />

              <View className="bg-card border border-border rounded-3xl p-4 shadow-sm">
                <Text className="text-xs text-muted-foreground mb-3 px-1">
                  Swipe horizontally to view all 7 columns. Tap headers to sort.
                </Text>

                {/* Table Container (Directly inside card, NO inner border box!) */}
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={true}
                  persistentScrollbar={true}
                  nestedScrollEnabled={true}
                  directionalLockEnabled={true}
                  contentContainerStyle={{ minWidth: 855, paddingBottom: 6 }}
                >
                  <View style={{ minWidth: 855 }}>
                    {/* Header Row */}
                    <View className="flex-row items-center border-b border-border bg-muted rounded-xl px-3 py-2.5 mb-1">
                      {[
                        { k: "m", l: "Market", w: 200 },
                        { k: "d", l: "District", w: 130 },
                        { k: "c", l: "Commodity", w: 130 },
                        { k: "v", l: "Variety", w: 120 },
                        { k: "a", l: "Min ₹", w: 90, r: true },
                        { k: "b", l: "Max ₹", w: 90, r: true },
                        { k: "p", l: "Modal ₹", w: 95, r: true },
                      ].map((col) => {
                        const isSort = sort.key === col.k;
                        return (
                          <TouchableOpacity
                            key={col.k}
                            activeOpacity={0.7}
                            style={{ width: col.w }}
                            onPress={() => handleSort(col.k as keyof MandiRow)}
                            className={`flex-row items-center ${
                              col.r ? "justify-end" : "justify-start"
                            }`}
                          >
                            <Text
                              className={`text-[11px] font-bold uppercase tracking-wider ${
                                isSort
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {col.l}
                            </Text>
                            {isSort && (
                              <Text className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 ml-1">
                                {sort.dir === 1 ? "▲" : "▼"}
                              </Text>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* Table Rows */}
                    {paginatedView.map((r, i) => {
                      const isBest = r === bestRow;
                      return (
                        <View
                          key={i}
                          style={{
                            backgroundColor: isBest
                              ? isDark
                                ? "rgba(16, 185, 129, 0.12)"
                                : "rgba(16, 185, 129, 0.08)"
                              : "transparent",
                          }}
                          className="flex-row items-center border-b border-border last:border-b-0 px-3 py-3 rounded-lg"
                        >
                          <Text
                            style={{ width: 200 }}
                            className="text-xs font-semibold text-foreground pr-2"
                          >
                            {r.m || "—"}
                          </Text>
                          <Text
                            style={{ width: 130 }}
                            className="text-xs text-muted-foreground pr-2"
                          >
                            {r.d || "—"}
                          </Text>
                          <Text
                            style={{ width: 130 }}
                            className="text-xs text-muted-foreground pr-2"
                          >
                            {r.c || "—"}
                          </Text>
                          <Text
                            style={{ width: 120 }}
                            className="text-xs text-muted-foreground pr-2"
                          >
                            {r.v || "—"}
                          </Text>
                          <Text
                            style={{ width: 90 }}
                            className="text-xs font-semibold text-muted-foreground text-right font-mono"
                          >
                            {rupee(r.a)}
                          </Text>
                          <Text
                            style={{ width: 90 }}
                            className="text-xs font-semibold text-muted-foreground text-right font-mono"
                          >
                            {rupee(r.b)}
                          </Text>
                          <Text
                            style={{ width: 95 }}
                            className={`text-xs font-bold text-right font-mono ${
                              isBest
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-foreground"
                            }`}
                          >
                            {rupee(r.p)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border px-1">
                    <Text className="text-xs text-muted-foreground">
                      {(currentPage - 1) * rowsPerPage + 1}-
                      {Math.min(currentPage * rowsPerPage, sortedView.length)} of{" "}
                      {sortedView.length}
                    </Text>

                    <View className="flex-row items-center gap-2">
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={`w-8 h-8 rounded-lg border border-border bg-card items-center justify-center ${
                          currentPage === 1 ? "opacity-40" : ""
                        }`}
                      >
                        <Icon
                          icon={ChevronLeftIcon}
                          size={16}
                          className="text-foreground"
                        />
                      </TouchableOpacity>

                      <Text className="text-xs font-bold text-foreground px-1">
                        {currentPage} / {totalPages}
                      </Text>

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className={`w-8 h-8 rounded-lg border border-border bg-card items-center justify-center ${
                          currentPage === totalPages ? "opacity-40" : ""
                        }`}
                      >
                        <Icon
                          icon={ChevronRightIcon}
                          size={16}
                          className="text-foreground"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </>
        )}

        {/* NEAREST KRISHI VIGYAN KENDRA (KVK) GUIDANCE FOOTER */}
        <View className="mt-2">
          <NearestKVKSection />
        </View>
      </View>
    );
}

export default PostHarvestSection;
