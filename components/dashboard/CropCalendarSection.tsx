import React, { useState } from "react";
import { View, Text } from "react-native";
import { useCalendar } from "@/hooks/useCalendar";
import { Icon } from "../ui/Icon";
import {
  Calendar03Icon,
  CloudOffIcon,
  WheatIcon,
} from "@hugeicons/core-free-icons";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTranslation } from "react-i18next";

interface Props {
  crop?: string;
}

// ── constants ────────────────────────────────────────────────────────────────
const MONTHS_SHORT = [
  "J",
  "F",
  "M",
  "A",
  "M",
  "J",
  "J",
  "A",
  "S",
  "O",
  "N",
  "D",
];
const MONTHS_FULL = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Phase color palette – rich, dark-mode friendly
const PHASE_COLORS = {
  sowing: {
    bar: "#22c55e",
    bg: "rgba(34,197,94,0.15)",
    text: "#16a34a",
    dot: "#22c55e",
  },
  growing: {
    bar: "#a16207",
    bg: "rgba(161,98,7,0.15)",
    text: "#ca8a04",
    dot: "#ca8a04",
  },
  harvesting: {
    bar: "#ef4444",
    bg: "rgba(239,68,68,0.15)",
    text: "#dc2626",
    dot: "#ef4444",
  },
};

const TODAY_MONTH = new Date().getMonth() + 1; // 1-indexed

function colForMonth(mon: number) {
  return mon - 1; // 0-indexed column
}

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
  const wraps = to < from;
  if (!wraps) {
    const span = to - from + 1;
    return (
      <View
        className="absolute top-0 bottom-0 rounded-full"
        style={{
          left: `${startCol * colW}%`,
          width: `${span * colW}%`,
          backgroundColor: color,
        }}
      />
    );
  } else {
    const seg1 = 12 - from + 1;
    const seg2 = to;
    return (
      <>
        <View
          className="absolute top-0 bottom-0 rounded-full"
          style={{
            left: `${startCol * colW}%`,
            width: `${seg1 * colW}%`,
            backgroundColor: color,
          }}
        />
        <View
          className="absolute top-0 bottom-0 rounded-full"
          style={{ left: 0, width: `${seg2 * colW}%`, backgroundColor: color }}
        />
      </>
    );
  }
}

// ── Season Card
function SeasonCard({ entry }: { entry: any }) {
  const { t } = useTranslation(["calendar"]);
  const sowFrom = entry.sowFromMon || entry.sow_from_mon;
  const sowTo = entry.sowToMon || entry.sow_to_mon;
  const harvFrom = entry.harvFromMon || entry.harv_from_mon;
  const harvTo = entry.harvToMon || entry.harv_to_mon;
  const season = entry.season || t("season");

  const COLS = 12;
  const colW = 100 / COLS;

  // Calculate growing dates properly (between sowing end and harvest start)
  const growFrom = sowTo ? (sowTo % 12) + 1 : null;
  const growTo = harvFrom ? (harvFrom === 1 ? 12 : harvFrom - 1) : null;
  const showGrowing = growFrom && growTo;

  return (
    <View className="mb-5">
      <Text className="text-base font-bold text-foreground mb-3">{season}</Text>

      <View className="flex-row mb-2">
        {MONTHS_SHORT.map((m, i) => (
          <View key={i} style={{ width: `${colW}%` }} className="items-center">
            <Text
              className={`text-[10px] ${TODAY_MONTH === i + 1 ? "font-black text-emerald-500" : "font-semibold text-muted-foreground"}`}
            >
              {m}
            </Text>
          </View>
        ))}
      </View>

      {sowFrom && sowTo && (
        <View className="mb-2">
          <Text
            className="text-[10px] font-bold mb-1 uppercase tracking-wider"
            style={{ color: PHASE_COLORS.sowing.text }}
          >
            {t("sowing")}
          </Text>
          <View className="h-7 rounded-full overflow-hidden bg-white/5 relative">
            {MONTHS_SHORT.map((_, i) => (
              <View
                key={i}
                className="absolute top-0 bottom-0 w-[0.5px] bg-muted-foreground/15"
                style={{ left: `${i * colW}%` }}
              />
            ))}
            <MonthBar
              from={sowFrom}
              to={sowTo}
              color={PHASE_COLORS.sowing.bar}
              totalCols={COLS}
            />
            <View
              className="absolute top-0 bottom-0 w-0.5 bg-white/60 rounded-full"
              style={{ left: `${(TODAY_MONTH - 1 + 0.5) * colW}%` }}
            />
          </View>
          <Text className="text-[10px] text-muted-foreground mt-1">
            {MONTHS_FULL[sowFrom - 1]} – {MONTHS_FULL[sowTo - 1]}
          </Text>
        </View>
      )}

      {showGrowing && (
        <View className="mb-2">
          <Text
            className="text-[10px] font-bold mb-1 uppercase tracking-wider"
            style={{ color: PHASE_COLORS.growing.text }}
          >
            {t("growing")}
          </Text>
          <View className="h-7 rounded-full overflow-hidden bg-white/5 relative">
            {MONTHS_SHORT.map((_, i) => (
              <View
                key={i}
                className="absolute top-0 bottom-0 w-[0.5px] bg-muted-foreground/15"
                style={{ left: `${i * colW}%` }}
              />
            ))}
            <MonthBar
              from={growFrom}
              to={growTo}
              color={PHASE_COLORS.growing.bar}
              totalCols={COLS}
            />
            <View
              className="absolute top-0 bottom-0 w-0.5 bg-white/60 rounded-full"
              style={{ left: `${(TODAY_MONTH - 1 + 0.5) * colW}%` }}
            />
          </View>
          <Text className="text-[10px] text-muted-foreground mt-1">
            {MONTHS_FULL[growFrom - 1]} – {MONTHS_FULL[growTo - 1]}
          </Text>
        </View>
      )}

      {harvFrom && harvTo && (
        <View>
          <Text
            className="text-[10px] font-bold mb-1 uppercase tracking-wider"
            style={{ color: PHASE_COLORS.harvesting.text }}
          >
            {t("harvesting")}
          </Text>
          <View className="h-7 rounded-full overflow-hidden bg-white/5 relative">
            {MONTHS_SHORT.map((_, i) => (
              <View
                key={i}
                className="absolute top-0 bottom-0 w-[0.5px] bg-muted-foreground/15"
                style={{ left: `${i * colW}%` }}
              />
            ))}
            <MonthBar
              from={harvFrom}
              to={harvTo}
              color={PHASE_COLORS.harvesting.bar}
              totalCols={COLS}
            />
            <View
              className="absolute top-0 bottom-0 w-0.5 bg-white/60 rounded-full"
              style={{ left: `${(TODAY_MONTH - 1 + 0.5) * colW}%` }}
            />
          </View>
          <Text className="text-[10px] text-muted-foreground mt-1">
            {MONTHS_FULL[harvFrom - 1]} – {MONTHS_FULL[harvTo - 1]}
          </Text>
        </View>
      )}
    </View>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export function CropCalendarSection({ crop }: Props) {
  const { t } = useTranslation(["calendar"]);
  const { calendar, isLoading, isError } = useCalendar(crop);

  // ── loading ──
  if (isLoading) {
    return (
      <View className="my-6 px-4">
        <View className="flex-row items-center gap-2 pb-4">
          <Icon
            icon={Calendar03Icon}
            size={26}
            strokeWidth={1.5}
            className="text-foreground"
          />
          <Text className="grow text-xl font-semibold text-foreground">
            {t("cropCalendar")}
          </Text>
        </View>
        <View className="bg-card dark:bg-muted/20 rounded-3xl p-6 my-2 h-[200px] justify-center">
          <Skeleton width="40%" height={20} borderRadius={6} className="mb-4" />
          <Skeleton
            width="100%"
            height={28}
            borderRadius={14}
            className="mb-3"
          />
          <Skeleton
            width="100%"
            height={28}
            borderRadius={14}
            className="mb-3"
          />
          <Skeleton width="100%" height={28} borderRadius={14} />
        </View>
      </View>
    );
  }

  // ── no crop selected ──
  if (!crop) {
    return (
      <View className="my-6 px-4">
        <View className="flex-row items-center gap-2 pb-4">
          <Icon
            icon={Calendar03Icon}
            size={26}
            strokeWidth={1.5}
            className="text-foreground"
          />
          <Text className="grow text-xl font-semibold text-foreground">
            {t("cropCalendar")}
          </Text>
        </View>
        <View className="bg-card border border-border/50 rounded-3xl p-6 items-center gap-2">
          <Icon
            icon={WheatIcon}
            size={32}
            strokeWidth={1.5}
            className="text-foreground"
          />
          <Text className="text-sm text-muted-foreground text-center">
            {t("selectCropCalendar")}
          </Text>
        </View>
      </View>
    );
  }

  // ── error / empty ──
  if (isError || !calendar.length) {
    return (
      <View className="my-6 px-4">
        <View className="flex-row items-center gap-2 pb-4">
          <Icon
            icon={Calendar03Icon}
            size={26}
            strokeWidth={1.5}
            className="text-foreground"
          />
          <Text className="grow text-xl font-semibold text-foreground">
            {t("cropCalendar")}
          </Text>
        </View>
        <View className="bg-card dark:bg-muted/20 border border-border rounded-3xl p-6 items-center justify-center">
          <Icon icon={CloudOffIcon} size={32} className="text-destructive" />
          <Text className="mt-4 text-sm text-muted-foreground font-medium text-center">
            {isError
              ? t("calendarLoadError")
              : t("noCalendarFor", { crop })}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="my-6 px-4">
      <View className="flex pb-4 flex-row gap-2 items-center">
        <Icon
          icon={Calendar03Icon}
          className="text-foreground"
          strokeWidth={2}
          size={26}
        />
        <Text className="grow text-xl text-foreground font-semibold">
          {t("cropCalendar")}
        </Text>
        <View className="flex-row flex gap-1 items-center">
          <View className="px-3 py-1 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/50">
            <Text className="text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
              {crop}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Legend ── */}
      <View className="flex-row gap-4 mb-5">
        {[
          { label: t("sowing"), color: PHASE_COLORS.sowing.bar },
          { label: t("growing"), color: PHASE_COLORS.growing.bar },
          { label: t("harvesting"), color: PHASE_COLORS.harvesting.bar },
        ].map(({ label, color }) => (
          <View key={label} className="flex-row items-end gap-1.5">
            <View
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <Text className="text-xs text-muted-foreground font-semibold">
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Season cards ── */}
      {calendar.map((entry: any, i: number) => (
        <SeasonCard key={i} entry={entry} />
      ))}
    </View>
  );
}
