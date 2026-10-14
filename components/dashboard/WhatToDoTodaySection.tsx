import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { i18n } from "@/i18n";
import { useCropContext } from "@/providers/CropProvider";
import { useLocationContext } from "@/providers/LocationProvider";
import { useWhatToDo } from "@/hooks/useWhatToDo";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { NoLocationCard } from "@/components/ui/NoLocationCard";
import { Icon } from "@/components/ui/Icon";
import {
  CheckListIcon,
  Bug01Icon,
  RainDropIcon,
  CloudFastWindIcon,
} from "@hugeicons/core-free-icons";
import type { WhatToDoCategory } from "@/lib/api/whatToDo";

// ── helpers ──────────────────────────────────────────────────────────────────

/** Icon per category — stable, never derived from text. */
function categoryIcon(category: WhatToDoCategory) {
  switch (category) {
    case "pest":
      return Bug01Icon;
    case "irrigation":
      return RainDropIcon;
    case "weather":
      return CloudFastWindIcon;
    default:
      return CheckListIcon;
  }
}

/** Accent colour per category — mirrors the webapp's categoryColor. */
function categoryColor(category: WhatToDoCategory): string {
  switch (category) {
    case "pest":
      return "#10b981"; // emerald-500 — matches Pest & Disease card
    case "irrigation":
      return "#0ea5e9"; // sky-500 — matches Soil Moisture card
    case "weather":
      return "#f59e0b"; // amber-500
    default:
      return "#10b981";
  }
}

// ── props ─────────────────────────────────────────────────────────────────────
interface Props {
  crop?: string;
}

// ── component ─────────────────────────────────────────────────────────────────
export function WhatToDoTodaySection({ crop }: Props) {
  const { t } = useTranslation(["dashboard", "common"]);
  const { selectedCrop } = useCropContext();
  const activeCrop = crop || selectedCrop || "general";

  const { location, isResolving } = useLocationContext();
  const { data, recommendations, isLoading, isFetching, isError } = useWhatToDo(
    activeCrop,
    i18n.language,
  );

  // While re-fetching for a crop/language switch show loader so stale text
  // doesn't linger (keepPreviousData means query.data still holds old value).
  const isStaleCrop = isFetching && !!data && data.crop_id !== activeCrop;
  const isStaleLanguage =
    isFetching && !!data && data.language !== i18n.language;

  const showLoader = isLoading || isStaleCrop || isStaleLanguage;

  if (!location && !isResolving) {
    return (
      <View className="my-6">
        <SectionHeader icon={CheckListIcon} title={t("whatToDoToday")} />
        <NoLocationCard message="Select a location to receive daily crop and field recommendations." />
      </View>
    );
  }

  return (
    <View className="my-6">
      {/* ── Header ── */}
      <SectionHeader icon={CheckListIcon} title={t("whatToDoToday")} />
      <View className="bg-card border border-border rounded-3xl p-3 shadow-sm">
        {/* ── Loading ── */}
        {showLoader && (
          <View className="items-center justify-center gap-3 py-3 min-h-28">
            <ActivityIndicator color="#10b981" size="large" />
            <Text className="text-xs font-medium text-muted-foreground">
              {t("generatingOverview")}
            </Text>
          </View>
        )}

        {/* ── Error ── */}
        {!showLoader && isError && (
          <View className="py-2">
            <Text className="text-xs text-muted-foreground leading-relaxed">
              {t("advisoryError")}
            </Text>
          </View>
        )}

        {/* ── Recommendations (max two) ── */}
        {!showLoader && !isError && recommendations.length > 0 && (
          <View>
            {recommendations.map((rec, i) => {
              const IconComp = categoryIcon(rec.category);
              const color = categoryColor(rec.category);
              const isLast = i === recommendations.length - 1;
              return (
                <View
                  key={i}
                  className={
                    "flex-row items-start gap-3 py-3" +
                    (!isLast ? " border-b border-border" : "")
                  }
                >
                  {/* Category icon (no box wrapper) */}
                  <View className="mt-0.5 shrink-0">
                    <Icon icon={IconComp} size={18} color={color} />
                  </View>

                  {/* Text content */}
                  <View className="flex-1 min-w-0">
                    <Text
                      className="text-[13px] font-semibold text-foreground leading-snug"
                      numberOfLines={3}
                    >
                      {rec.title}
                    </Text>
                    {!!rec.hint && (
                      <Text className="text-xs text-muted-foreground leading-snug mt-0.5">
                        {rec.hint}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {recommendations.length === 0 && !showLoader && !isError && (
          <Text className="text-muted-foreground text-sm font-medium">
            {t("common:noRecommendations") || "No recommendations available."}
          </Text>
        )}
      </View>
    </View>
  );
}
