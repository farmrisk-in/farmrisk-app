import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Icon } from "@/components/ui/Icon";
import {
  ArrowLeft01Icon,
  SoilMoistureFieldIcon,
} from "@hugeicons/core-free-icons";
import { useSoilMoisture } from "@/hooks/useSoilMoisture";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

// ── helpers ──────────────────────────────────────────────────────────────────
const MONTHS = [
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

const parseDate = (raw: string) => {
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return { year: +m[1], month: +m[2] - 1, day: +m[3] };
};

const shortDate = (raw: string) => {
  const p = parseDate(raw);
  if (!p) return raw;
  return `${MONTHS[p.month]} ${p.day}`;
};

const moistureColor = (v: number) =>
  v <= 30 ? "#ef4444" : v <= 70 ? "#94a3b8" : "#3b82f6";

const moistureLabel = (t: TFunction<"weather">, v: number) =>
  v <= 30 ? t("moistureDry") : v <= 70 ? t("moistureModerate") : t("moistureWet");

// ── table row ─────────────────────────────────────────────────────────────────
function TableRow({ item, isEven }: { item: any; isEven: boolean }) {
  const { t } = useTranslation(["weather"]);
  const sm = item.sm_percentile ?? 0;
  const color = moistureColor(sm);
  return (
    <View
      className={`flex flex-row items-center py-4 px-3 border-b border-border ${isEven ? "bg-sky-100/30 dark:bg-sky-900/20" : ""}`}
    >
      {/* Date */}
      <View style={{ width: 64 }}>
        <Text className="text-md font-semibold text-foreground">
          {shortDate(item.fullDate)}
        </Text>
      </View>

      {/* Moisture bar */}
      <View style={{ flex: 1, marginHorizontal: 8, gap: 3 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text className="text-foreground text-sm font-semibold">
            {moistureLabel(t, sm)}
          </Text>
          <Text style={{ fontSize: 11, fontWeight: "800", color }}>
            {Math.round(sm)}%
          </Text>
        </View>
        <View
          style={{
            height: 5,
            backgroundColor: "rgba(0,0,0,0.08)",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${Math.min(100, sm)}%`,
              backgroundColor: color,
              borderRadius: 3,
            }}
          />
        </View>
      </View>

      {/* Rain */}
      <View style={{ width: 48, alignItems: "flex-end" }}>
        <Text className="text-sm font-semibold text-sky-900 dark:text-sky-200">
          {item.P_obs > 0 ? `${item.P_obs.toFixed(1)}` : "—"}
        </Text>
      </View>

      {/* PE */}
      <View style={{ width: 40, alignItems: "flex-end" }}>
        <Text className="text-sm font-semibold text-rose-900 dark:text-rose-200">
          {item.PE > 0 ? item.PE.toFixed(1) : "—"}
        </Text>
      </View>
    </View>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function SoilDetailScreen() {
  const router = useRouter();
  const { data, isLoading, isError } = useSoilMoisture();
  const { t } = useTranslation(["weather"]);
  const { t: tDash } = useTranslation(["dashboard"]);

  const rawArray = Array.isArray(data) ? data : (data?.soil_moisture ?? []);

  const allData = useMemo(() => {
    if (!rawArray.length) return [];
    return [...rawArray]
      .sort((a: any, b: any) => (a.date > b.date ? 1 : -1))
      .map((d: any) => ({
        date: shortDate(d.date),
        fullDate: d.date,
        sm_percentile: d.sm_percentile ?? 0,
        P_obs: d.P_obs ?? 0,
        PE: d.PE ?? 0,
        E: d.E ?? 0,
        R: d.R ?? 0,
        G: d.G ?? 0,
        is_forecast: d.is_forecast ?? 0,
      }));
  }, [rawArray]);

  if (isLoading)
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#007a55" size="large" />
      </SafeAreaView>
    );

  if (isError || !allData.length)
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-muted-foreground text-center text-base">
          {tDash("soilMoistureUnavailable")}
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-6">
          <Text className="text-emerald-600 font-bold">← {tDash("goBack")}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* ── Header ── */}
      <View className="px-4 pt-2 pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="self-start mb-4 p-1"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon icon={ArrowLeft01Icon} size={26} className="text-foreground" />
        </TouchableOpacity>
        <View className="flex-row items-center gap-3">
          <View className="p-2.5 bg-sky-100 dark:bg-sky-900/50 rounded-2xl">
            <Icon
              icon={SoilMoistureFieldIcon}
              size={26}
              className="text-sky-700 dark:text-sky-400"
            />
          </View>
          <View>
            <Text className="text-2xl font-bold text-foreground">
              {t("soilMoisture")}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {t("daysOfData", {
                count: allData.length,
                date: allData[allData.length - 1]?.date ?? "",
              })}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* ── Full Data Table ── */}

        {/* Table header */}
        <View className="flex flex-row items-center py-3 px-3 bg-sky-200/50 dark:bg-sky-900/50 border-y border-border">
          <Text className="text-md pr-10 font-bold text-foreground uppercase">
            {t("dateCol")}
          </Text>
          <Text className="grow font-bold text-md text-foreground uppercase">
            {t("moistureCol")}
          </Text>
          <Text className="text-md px-4 font-bold text-foreground uppercase">
            {t("rainCol")}
          </Text>
          <Text className="text-md pl-4 font-bold text-foreground uppercase ">
            {t("peCol")}
          </Text>
        </View>

        {/* Table rows — newest first */}
        {[...allData].reverse().map((item, i) => (
          <TableRow key={item.fullDate} item={item} isEven={i % 2 === 0} />
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
