import React from "react";
import { View, Text } from "react-native";
import { useCalendar } from "@/hooks/useCalendar";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  Calendar03Icon,
  CloudOffIcon,
  WheatIcon,
} from "@hugeicons/core-free-icons";
import { useTranslation } from "react-i18next";
import { useLocked } from "@/hooks/useLocked";
import { LockedCard } from "@/components/ui/LockedCard";

interface Props {
  crop?: string;
}

type PeriodType = "sowing" | "growing" | "harvesting";

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
const PHASE_COLORS: Record<
  PeriodType,
  { bar: string; text: string; bg: string }
> = {
  sowing: {
    bar: "#22c55e",
    text: "#16a34a",
    bg: "rgba(34,197,94,0.15)",
  },
  growing: {
    bar: "rgba(255,187,4,0.7)", // 60% transparent (40% opacity)
    text: "#ca8a04",
    bg: "rgba(202,138,4,0.15)",
  },
  harvesting: {
    bar: "#ef4444",
    text: "#dc2626",
    bg: "rgba(239,68,68,0.15)",
  },
};

const TODAY_MONTH = new Date().getMonth() + 1; // 1-indexed (1..12)

// ── Period Bar Segment Component ──────────────────────────────────────────────
function PeriodBarSegment({
  from,
  to,
  color,
  zIndex = 10,
  roundedClass = "rounded-none",
}: {
  from: number;
  to: number;
  color: string;
  zIndex?: number;
  roundedClass?: string;
}) {
  const colW = 100 / 12;
  const startCol = from - 1;
  const wraps = to < from;

  const renderSegment = (
    leftPct: number,
    widthPct: number,
    keySuffix: string,
    extraRounded: string = roundedClass,
  ) => (
    <View
      key={keySuffix}
      style={{
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        backgroundColor: color,
        zIndex,
      }}
      className={`absolute top-1.5 bottom-1.5 ${extraRounded}`}
    />
  );

  if (!wraps) {
    const span = to - from + 1;
    return renderSegment(startCol * colW, span * colW, "main", roundedClass);
  } else {
    const seg1 = 12 - from + 1;
    const seg2 = to;
    return (
      <>
        {renderSegment(
          startCol * colW,
          seg1 * colW,
          "seg1",
          roundedClass.includes("rounded-l") ? "rounded-l-md" : "rounded-none",
        )}
        {renderSegment(
          0,
          seg2 * colW,
          "seg2",
          roundedClass.includes("rounded-r") ? "rounded-r-md" : "rounded-none",
        )}
      </>
    );
  }
}

// ── Season Card ──────────────────────────────────────────────────────────────
function SeasonCard({ entry }: { entry: any }) {
  const { t } = useTranslation(["calendar"]);

  const sowFrom = entry.sowFromMon || entry.sow_from_mon;
  const sowTo = entry.sowToMon || entry.sow_to_mon;
  const harvFrom = entry.harvFromMon || entry.harv_from_mon;
  const harvTo = entry.harvToMon || entry.harv_to_mon;
  const season = entry.season || t("season");

  // Calculate growing phase between sowing end and harvest start
  let growFrom: number | null = null;
  let growTo: number | null = null;

  if (sowTo && harvFrom) {
    const nextAfterSow = (sowTo % 12) + 1;
    const prevBeforeHarv = harvFrom === 1 ? 12 : harvFrom - 1;
    if (nextAfterSow !== harvFrom) {
      growFrom = nextAfterSow;
      growTo = prevBeforeHarv;
    }
  }

  const COLS = 12;
  const colW = 100 / COLS;

  return (
    <View className="bg-card dark:bg-muted border border-border rounded-2xl p-4 mb-4 shadow-sm">
      {/* ── Card Header: Season Name + Month Ranges with Colored Dots ── */}
      <View className="flex-row items-center justify-between mb-3 flex-wrap gap-y-1">
        <Text className="text-base font-bold text-foreground">{season}</Text>

        {/* Month ranges per period with matching color dots */}
        <View className="flex-row items-center flex-wrap gap-2.5">
          {sowFrom && sowTo && (
            <View className="flex-row items-center gap-1">
              <View
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: PHASE_COLORS.sowing.bar }}
              />
              <Text className="text-[11px] font-semibold text-muted-foreground">
                {MONTHS_FULL[sowFrom - 1]}–{MONTHS_FULL[sowTo - 1]}
              </Text>
            </View>
          )}

          {growFrom && growTo && (
            <View className="flex-row items-center gap-1">
              <View
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: PHASE_COLORS.growing.bar }}
              />
              <Text className="text-[11px] font-semibold text-muted-foreground">
                {MONTHS_FULL[growFrom - 1]}–{MONTHS_FULL[growTo - 1]}
              </Text>
            </View>
          )}

          {harvFrom && harvTo && (
            <View className="flex-row items-center gap-1">
              <View
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: PHASE_COLORS.harvesting.bar }}
              />
              <Text className="text-[11px] font-semibold text-muted-foreground">
                {MONTHS_FULL[harvFrom - 1]}–{MONTHS_FULL[harvTo - 1]}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Single Chart Container (Month Row Background at 5% opacity + Period Bars) ── */}
      <View className="relative h-11 w-full rounded-xl overflow-hidden bg-card border border-border justify-center">
        {/* Month grid background at 5% opacity using inline style */}
        <View
          style={{ backgroundColor: "rgba(128, 128, 128, 0.05)" }}
          className="absolute inset-0 flex-row items-center"
        >
          {MONTHS_SHORT.map((m, i) => {
            const isCurrentMon = TODAY_MONTH === i + 1;
            return (
              <View
                key={i}
                style={{
                  width: `${colW}%`,
                  borderColor: "rgba(128, 128, 128, 0.1)",
                }}
                className={`h-full items-center justify-center border-r ${
                  i === 11 ? "border-r-0" : ""
                }`}
              >
                <Text
                  style={{
                    opacity: isCurrentMon ? 1 : 0.2,
                  }}
                  className={`text-[10px] font-bold ${
                    isCurrentMon
                      ? "text-emerald-500 font-black"
                      : "text-foreground"
                  }`}
                >
                  {m}
                </Text>
              </View>
            );
          })}
        </View>

        {/* 1. Growing Bar (Yellow, 60% Transparent, No Roundness) - zIndex=10 */}
        {growFrom && growTo && (
          <PeriodBarSegment
            from={growFrom}
            to={growTo}
            color={PHASE_COLORS.growing.bar}
            zIndex={10}
            roundedClass="rounded-none"
          />
        )}

        {/* 2. Sowing Bar (Green, Left Rounded) - zIndex=20 */}
        {sowFrom && sowTo && (
          <PeriodBarSegment
            from={sowFrom}
            to={sowTo}
            color={PHASE_COLORS.sowing.bar}
            zIndex={20}
            roundedClass="rounded-l-md rounded-r-none"
          />
        )}

        {/* 3. Harvesting Bar (Red, Right Rounded) - zIndex=30 */}
        {harvFrom && harvTo && (
          <PeriodBarSegment
            from={harvFrom}
            to={harvTo}
            color={PHASE_COLORS.harvesting.bar}
            zIndex={30}
            roundedClass="rounded-r-md rounded-l-none"
          />
        )}

        {/* Current Month Line Indicator */}
        <View
          className="absolute top-0 bottom-0 w-0.5 bg-emerald-500 z-30 pointer-events-none shadow-sm"
          style={{ left: `${(TODAY_MONTH - 1 + 0.5) * colW}%` }}
        />
      </View>
    </View>
  );
}

// ── Main Section Component ────────────────────────────────────────────────────
export function CropCalendarSection({ crop }: Props) {
  const { t } = useTranslation(["calendar"]);
  const { isLocked } = useLocked();
  const { calendar, isLoading, isError } = useCalendar(crop);

  if (isLocked) {
    return (
      <View className="my-6 px-4">
        <View className="flex-row items-center gap-2 pb-4">
          <Icon
            icon={Calendar03Icon}
            size={26}
            strokeWidth={1.5}
            className="text-foreground"
          />
          <Text
            className="flex-1 shrink text-lg font-semibold text-foreground"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {t("cropCalendar")}
          </Text>
        </View>
        <LockedCard
          title="Crop Calendar Locked"
          description="Sign in or register to track seasonal sowing, growing, and harvesting periods for your crops."
        />
      </View>
    );
  }

  // ── Loading ──
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
          <Text
            className="flex-1 shrink text-lg font-semibold text-foreground"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {t("cropCalendar")}
          </Text>
        </View>
        <View className="bg-card dark:bg-muted rounded-3xl p-6 my-2 h-[80px] justify-center gap-3" />
        <View className="bg-card dark:bg-muted rounded-3xl p-6 my-2 h-[80px] justify-center gap-3" />
      </View>
    );
  }

  // ── No crop selected ──
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
          <Text
            className="flex-1 shrink text-lg font-semibold text-foreground"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {t("cropCalendar")}
          </Text>
        </View>
        <View className="bg-card border border-border rounded-3xl p-6 items-center gap-2">
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

  // ── Error / Empty ──
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
          <Text
            className="flex-1 shrink text-lg font-semibold text-foreground"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {t("cropCalendar")}
          </Text>
        </View>
        <View className="bg-card dark:bg-muted border border-border rounded-3xl p-6 items-center justify-center">
          <Icon icon={CloudOffIcon} size={32} className="text-destructive" />
          <Text className="mt-4 text-sm text-muted-foreground font-medium text-center">
            {isError ? t("calendarLoadError") : t("noCalendarFor", { crop })}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="my-6 px-4">
      <SectionHeader
        icon={Calendar03Icon}
        title={t("cropCalendar")}
        containerClassName="flex pb-2 flex-row gap-2 items-center"
        rightContent={
          <View className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-800">
            <Text className="text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
              {crop}
            </Text>
          </View>
        }
      />

      {/* ── Global Section Legend (Shown ONCE at top) ── */}
      <View className="flex-row items-center gap-4 mb-4">
        {[
          { label: t("sowing"), color: PHASE_COLORS.sowing.bar },
          { label: t("growing"), color: PHASE_COLORS.growing.bar },
          { label: t("harvesting"), color: PHASE_COLORS.harvesting.bar },
        ].map(({ label, color }) => (
          <View key={label} className="flex-row items-center gap-1.5">
            <View
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <Text className="text-[11px] font-semibold text-muted-foreground">
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
