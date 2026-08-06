import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useCalendar } from "@/hooks/useCalendar";
import { Icon } from "../ui/Icon";
import {
  Calendar03Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

interface Props {
  crop?: string;
}

// ── constants ────────────────────────────────────────────────────────────────
const MONTHS_SHORT = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const MONTHS_FULL  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Phase color palette – rich, dark-mode friendly
const PHASE_COLORS = {
  sowing:     { bar: "#22c55e", bg: "rgba(34,197,94,0.15)",   text: "#16a34a", dot: "#22c55e" },
  growing:    { bar: "#a16207", bg: "rgba(161,98,7,0.15)",    text: "#ca8a04", dot: "#ca8a04" },
  harvesting: { bar: "#ef4444", bg: "rgba(239,68,68,0.15)",   text: "#dc2626", dot: "#ef4444" },
};

const TODAY_MONTH = new Date().getMonth() + 1; // 1-indexed

// ── helpers ──────────────────────────────────────────────────────────────────
// Wrap months around year boundary: sowFrom=11, sowTo=2 → spans [11,12,1,2]
function monthsInRange(from: number, to: number): number[] {
  const result: number[] = [];
  let m = from;
  while (true) {
    result.push(m);
    if (m === to) break;
    m = (m % 12) + 1;
    if (result.length > 12) break; // safety
  }
  return result;
}

function colForMonth(mon: number) {
  return mon - 1; // 0-indexed column
}

// ── Calendar Bar ─────────────────────────────────────────────────────────────
function MonthBar({
  from,
  to,
  color,
  totalCols,
}: {
  from: number;
  to: number;
  color: string;
  totalCols: number;
}) {
  const colW = 100 / totalCols;
  const startCol = colForMonth(from);
  // Handle wrap-around
  const wraps = to < from;
  if (!wraps) {
    const span = to - from + 1;
    return (
      <View
        style={{
          position: "absolute",
          left: `${startCol * colW}%`,
          width: `${span * colW}%`,
          top: 0,
          bottom: 0,
          backgroundColor: color,
          borderRadius: 10,
        }}
      />
    );
  } else {
    // Two segments: from→Dec and Jan→to
    const seg1 = 12 - from + 1;
    const seg2 = to;
    return (
      <>
        <View
          style={{
            position: "absolute",
            left: `${startCol * colW}%`,
            width: `${seg1 * colW}%`,
            top: 0,
            bottom: 0,
            backgroundColor: color,
            borderRadius: 10,
          }}
        />
        <View
          style={{
            position: "absolute",
            left: 0,
            width: `${seg2 * colW}%`,
            top: 0,
            bottom: 0,
            backgroundColor: color,
            borderRadius: 10,
          }}
        />
      </>
    );
  }
}

// ── Season Card ───────────────────────────────────────────────────────────────
function SeasonCard({ entry }: { entry: any }) {
  const sowFrom  = entry.sowFromMon  || entry.sow_from_mon;
  const sowTo    = entry.sowToMon    || entry.sow_to_mon;
  const harvFrom = entry.harvFromMon || entry.harv_from_mon;
  const harvTo   = entry.harvToMon   || entry.harv_to_mon;
  const season   = entry.season      || "Season";

  const COLS = 12;
  const colW = 100 / COLS;

  return (
    <View className="mb-5">
      {/* Season label */}
      <Text className="text-base font-bold text-foreground mb-3">{season}</Text>

      {/* Month header */}
      <View style={{ flexDirection: "row", marginBottom: 6 }}>
        {MONTHS_SHORT.map((m, i) => (
          <View
            key={i}
            style={{
              width: `${colW}%`,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: TODAY_MONTH === i + 1 ? "900" : "600",
                color: TODAY_MONTH === i + 1 ? "#10b981" : "#71717a",
              }}
            >
              {m}
            </Text>
          </View>
        ))}
      </View>

      {/* Sowing bar */}
      {sowFrom && sowTo && (
        <View className="mb-2">
          <Text style={{ fontSize: 10, color: PHASE_COLORS.sowing.text, fontWeight: "700", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Sowing
          </Text>
          <View style={{ height: 28, borderRadius: 10, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.04)", position: "relative" }}>
            {/* subtle month grid lines */}
            {MONTHS_SHORT.map((_, i) => (
              <View
                key={i}
                style={{
                  position: "absolute",
                  left: `${i * colW}%`,
                  top: 0,
                  bottom: 0,
                  width: 0.5,
                  backgroundColor: "rgba(113,113,122,0.15)",
                }}
              />
            ))}
            <MonthBar from={sowFrom} to={sowTo} color={PHASE_COLORS.sowing.bar} totalCols={COLS} />
            {/* Today line */}
            <View
              style={{
                position: "absolute",
                left: `${(TODAY_MONTH - 1 + 0.5) * colW}%`,
                top: 0,
                bottom: 0,
                width: 1.5,
                backgroundColor: "rgba(255,255,255,0.6)",
                borderRadius: 1,
              }}
            />
          </View>
          <Text style={{ fontSize: 10, color: "#71717a", marginTop: 3 }}>
            {MONTHS_FULL[sowFrom - 1]} – {MONTHS_FULL[sowTo - 1]}
          </Text>
        </View>
      )}

      {/* Growing bar (inferred = sowing-end to harvest-start) */}
      {sowTo && harvFrom && sowTo !== harvFrom && (
        <View className="mb-2">
          <Text style={{ fontSize: 10, color: PHASE_COLORS.growing.text, fontWeight: "700", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Growing
          </Text>
          <View style={{ height: 28, borderRadius: 10, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.04)", position: "relative" }}>
            {MONTHS_SHORT.map((_, i) => (
              <View
                key={i}
                style={{
                  position: "absolute",
                  left: `${i * colW}%`,
                  top: 0,
                  bottom: 0,
                  width: 0.5,
                  backgroundColor: "rgba(113,113,122,0.15)",
                }}
              />
            ))}
            <MonthBar from={(sowTo % 12) + 1} to={harvFrom} color={PHASE_COLORS.growing.bar} totalCols={COLS} />
            <View
              style={{
                position: "absolute",
                left: `${(TODAY_MONTH - 1 + 0.5) * colW}%`,
                top: 0,
                bottom: 0,
                width: 1.5,
                backgroundColor: "rgba(255,255,255,0.6)",
                borderRadius: 1,
              }}
            />
          </View>
          <Text style={{ fontSize: 10, color: "#71717a", marginTop: 3 }}>
            {MONTHS_FULL[(sowTo % 12)]} – {MONTHS_FULL[harvFrom - 1]}
          </Text>
        </View>
      )}

      {/* Harvesting bar */}
      {harvFrom && harvTo && (
        <View>
          <Text style={{ fontSize: 10, color: PHASE_COLORS.harvesting.text, fontWeight: "700", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Harvesting
          </Text>
          <View style={{ height: 28, borderRadius: 10, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.04)", position: "relative" }}>
            {MONTHS_SHORT.map((_, i) => (
              <View
                key={i}
                style={{
                  position: "absolute",
                  left: `${i * colW}%`,
                  top: 0,
                  bottom: 0,
                  width: 0.5,
                  backgroundColor: "rgba(113,113,122,0.15)",
                }}
              />
            ))}
            <MonthBar from={harvFrom} to={harvTo} color={PHASE_COLORS.harvesting.bar} totalCols={COLS} />
            <View
              style={{
                position: "absolute",
                left: `${(TODAY_MONTH - 1 + 0.5) * colW}%`,
                top: 0,
                bottom: 0,
                width: 1.5,
                backgroundColor: "rgba(255,255,255,0.6)",
                borderRadius: 1,
              }}
            />
          </View>
          <Text style={{ fontSize: 10, color: "#71717a", marginTop: 3 }}>
            {MONTHS_FULL[harvFrom - 1]} – {MONTHS_FULL[harvTo - 1]}
          </Text>
        </View>
      )}
    </View>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export function CropCalendarSection({ crop }: Props) {
  const { calendar, district, state, isLoading, isError } = useCalendar(crop);

  // ── loading ──
  if (isLoading)
    return <ActivityIndicator style={{ marginVertical: 16 }} color="#007a55" />;

  // ── no crop selected ──
  if (!crop)
    return (
      <View className="my-6 px-4">
        <View className="flex-row items-center gap-3 mb-4">
          <Icon icon={Calendar03Icon} size={26} strokeWidth={1.5} className="text-foreground" />
          <Text className="text-xl font-semibold text-foreground">Crop Calendar</Text>
        </View>
        <View className="bg-card border border-border/50 rounded-2xl p-5 items-center gap-2">
          <Text className="text-3xl">🌾</Text>
          <Text className="text-sm text-muted-foreground text-center">
            Select a crop above to see its seasonal calendar
          </Text>
        </View>
      </View>
    );

  // ── error / empty ──
  if (isError || !calendar.length)
    return (
      <View className="my-6 px-4">
        <View className="flex-row items-center gap-3 mb-4">
          <Icon icon={Calendar03Icon} size={26} strokeWidth={1.5} className="text-foreground" />
          <Text className="text-xl font-semibold text-foreground">Crop Calendar</Text>
        </View>
        <View className="bg-card border border-border/50 rounded-2xl p-5 items-center">
          <Text className="text-sm text-muted-foreground">
            {isError ? "Failed to load calendar data." : `No calendar found for ${crop} in this region.`}
          </Text>
        </View>
      </View>
    );

  return (
    <View className="my-6 px-4">
      {/* ── Header ── */}
      <View className="flex-row items-center gap-2 pb-4">
        <Icon icon={Calendar03Icon} size={26} strokeWidth={1.5} className="text-foreground" />
        <Text className="grow text-xl font-semibold text-foreground">Crop Calendar</Text>
        {/* Crop badge */}
        <View className="px-3 py-1 rounded-xl bg-emerald-600">
          <Text className="text-xs font-black text-white uppercase tracking-wider">
            {crop}
          </Text>
        </View>
      </View>

      {/* Region label */}
      {(district || state) && (
        <Text className="text-xs text-muted-foreground mb-3 -mt-2">
          📍 {[district, state].filter(Boolean).join(", ")}
        </Text>
      )}

      {/* ── Legend ── */}
      <View className="flex-row gap-4 mb-5">
        {[
          { label: "Sowing",     color: PHASE_COLORS.sowing.bar     },
          { label: "Growing",    color: PHASE_COLORS.growing.bar     },
          { label: "Harvesting", color: PHASE_COLORS.harvesting.bar  },
        ].map(({ label, color }) => (
          <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
            <Text style={{ fontSize: 12, color: "#71717a", fontWeight: "600" }}>{label}</Text>
          </View>
        ))}
        {/* Today indicator */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginLeft: "auto" }}>
          <View style={{ width: 2, height: 12, backgroundColor: "rgba(255,255,255,0.6)", borderRadius: 1 }} />
          <Text style={{ fontSize: 11, color: "#71717a" }}>Today</Text>
        </View>
      </View>

      {/* Divider */}
      <View className="border-t border-border/40 mb-5" />

      {/* ── Season cards ── */}
      {calendar.map((entry: any, i: number) => (
        <SeasonCard key={i} entry={entry} />
      ))}

      {/* ── Days until next phase info ── */}
      {calendar[0] && (() => {
        const entry = calendar[0];
        const sowFrom = entry.sowFromMon || entry.sow_from_mon;
        if (!sowFrom) return null;
        const diff = ((sowFrom - TODAY_MONTH + 12) % 12);
        if (diff === 0) return (
          <View className="mt-2 bg-emerald-900/30 border border-emerald-800/50 rounded-2xl px-4 py-3 flex-row items-center gap-3">
            <Text className="text-xl">🌱</Text>
            <Text className="text-sm text-emerald-300 font-semibold flex-1">
              Sowing season is active now!
            </Text>
          </View>
        );
        return (
          <View className="mt-2 bg-card border border-border/50 rounded-2xl px-4 py-3 flex-row items-center gap-3">
            <Text className="text-xl">📅</Text>
            <Text className="text-sm text-muted-foreground flex-1">
              Next sowing season starts in{" "}
              <Text className="text-foreground font-bold">{diff} month{diff !== 1 ? "s" : ""}</Text>
              {" "}({MONTHS_FULL[sowFrom - 1]})
            </Text>
          </View>
        );
      })()}
    </View>
  );
}
