/**
 * app/search.tsx
 * Full-page search screen — Google Maps style.
 * Uses react-native-paper Searchbar with NativeWind styling & Lucide icons.
 */
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Searchbar } from "react-native-paper";
import { cssInterop } from "nativewind";
import { useLocationSearch } from "@/hooks/useDashboardQueries";
import { useLocationContext } from "@/providers/LocationProvider";
import { Icons } from "@/components/iconLoader";

// Teach NativeWind how to style the Searchbar
cssInterop(Searchbar, {
  className: "style",
  inputClassName: "inputStyle",
});

const RECENT_KEY = "farmrisk:recent_locations";
const MAX_RECENT = 12;

type LocationItem = {
  displayName: string;
  lat: string;
  lng?: string;
  lon?: string;
  district?: string;
  state?: string;
};

type RecentItem = {
  displayName: string;
  lat: number;
  lng: number;
  name: string;
};

export default function SearchScreen() {
  const router = useRouter();
  const { setLocation } = useLocationContext();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [recents, setRecents] = useState<RecentItem[]>([]);

  const searchbarRef = useRef<any>(null);

  // Auto-focus search bar when screen mounts
  useEffect(() => {
    const timer = setTimeout(() => searchbarRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, []);

  // Load recent searches
  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY).then((raw) => {
      if (raw) setRecents(JSON.parse(raw));
    });
  }, []);

  // Debounce query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data: results, isLoading } = useLocationSearch(debouncedQuery);

  const saveRecent = useCallback(
    async (item: RecentItem) => {
      const updated = [
        item,
        ...recents.filter((r) => r.displayName !== item.displayName),
      ].slice(0, MAX_RECENT);
      setRecents(updated);
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    },
    [recents],
  );

  const handleSelect = useCallback(
    (item: LocationItem) => {
      const displayName = item.displayName || "";
      const lng = item.lng !== undefined ? item.lng : item.lon;
      const loc = {
        lat: parseFloat(item.lat),
        lng: parseFloat(lng ?? "0"),
        name: item.district || item.state || displayName,
        displayName,
      };
      setLocation(loc);
      saveRecent(loc);
      Keyboard.dismiss();
      router.back();
    },
    [setLocation, saveRecent, router],
  );

  const handleSelectRecent = useCallback(
    (item: RecentItem) => {
      setLocation(item);
      saveRecent(item);
      router.back();
    },
    [setLocation, saveRecent, router],
  );

  const handleClearRecent = useCallback(
    async (displayName: string) => {
      const updated = recents.filter((r) => r.displayName !== displayName);
      setRecents(updated);
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    },
    [recents],
  );

  // Fill search query into searchbar without submitting
  const handleFillQuery = useCallback((textToFill: string) => {
    setQuery(textToFill);
    searchbarRef.current?.focus();
  }, []);

  // Calculate matching recents during search
  const matchingRecents = useMemo(() => {
    if (debouncedQuery.length < 2) return [];
    const q = debouncedQuery.toLowerCase();
    return recents.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.displayName.toLowerCase().includes(q),
    );
  }, [debouncedQuery, recents]);

  // Filter API results to exclude duplicate items that are already in matchingRecents
  const filteredApiResults = useMemo(() => {
    if (!results || debouncedQuery.length < 2) return [];
    return results.filter((res: any) => {
      const label = res.displayName || res.display_name || "";
      const primary = res.district || res.state || label.split(",")[0];
      return !matchingRecents.some(
        (rec) => rec.name === primary || rec.displayName === label,
      );
    });
  }, [results, debouncedQuery, matchingRecents]);

  const totalResultsCount = matchingRecents.length + filteredApiResults.length;
  const showResults = debouncedQuery.length >= 2 && totalResultsCount > 0;
  const showEmpty =
    debouncedQuery.length >= 2 && !isLoading && totalResultsCount === 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-3 py-4 pb-1">
        {/* Paper Searchbar styled with NativeWind using built-in arrow-left back button */}
        <Searchbar
          ref={searchbarRef}
          placeholder="Search city, district, state..."
          onChangeText={setQuery}
          value={query}
          loading={false}
          icon="chevron-left"
          onIconPress={() => router.back()}
          clearIcon={query.length > 0 ? "close" : ""}
          onClearIconPress={() => setQuery("")}
          elevation={0}
          className="rounded-2xl bg-muted border border-border h-12 justify-center"
          // @ts-ignore - cssInterop mapping
          inputClassName="text-foreground text-base py-0 my-0 min-h-0 align-center"
        />
      </View>

      {/* ── Body Content ───────────────────────────────────────────────── */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Loading State */}
        {isLoading && debouncedQuery.length >= 2 && totalResultsCount === 0 && (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" className="text-primary" />
            <Text className="mt-3 text-md text-muted-foreground">
              Searching locations...
            </Text>
          </View>
        )}

        {/* No Results State */}
        {showEmpty && (
          <View className="py-12 items-center px-6">
            <View className="w-14 h-14 rounded-2xl bg-muted items-center justify-center mb-3">
              <Icons.MapPinOff
                size={25}
                className="text-destructive opacity-80"
              />
            </View>
            <Text className="text-lg font-semibold text-foreground text-center">
              No results found
            </Text>
            <Text className="text-md text-muted-foreground text-center mt-1">
              We couldn't find any location matching &quot;{debouncedQuery}
              &quot;.
            </Text>
          </View>
        )}

        {/* Live Search Results (Matching Recents + API Results) */}
        {showResults && (
          <View className="mt-2 px-2">
            {/* Matching Recents Section */}
            {matchingRecents.map((item, idx) => {
              const isLast =
                idx === matchingRecents.length - 1 &&
                filteredApiResults.length === 0;
              return (
                <TouchableOpacity
                  key={`rec-${idx}`}
                  onPress={() => handleSelectRecent(item)}
                  activeOpacity={0.7}
                  className={`flex-row items-center gap-2 p-3.5 ${
                    !isLast ? "border-b border-border" : ""
                  }`}
                >
                  <View className="w-9 h-9 rounded-xl bg-muted items-center justify-center">
                    <Icons.Clock size={18} className="text-muted-foreground" />
                  </View>

                  <View className="flex-1">
                    <Text
                      className="text-sm font-semibold text-foreground"
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    <Text
                      className="text-xs text-muted-foreground mt-0.5"
                      numberOfLines={1}
                    >
                      {item.displayName}
                    </Text>
                  </View>

                  {/* Fill query into searchbar button */}
                  <TouchableOpacity
                    onPress={() => handleFillQuery(item.name)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    className="p-2 rounded-full active:bg-muted"
                  >
                    <Icons.ArrowUpLeft
                      size={18}
                      className="text-muted-foreground"
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}

            {/* API Search Results Section */}
            {filteredApiResults.map((item: any, idx: number) => {
              const label = item.displayName || item.display_name || "";
              const primaryTitle =
                item.district || item.state || label.split(",")[0];
              const isLast = idx === filteredApiResults.length - 1;

              return (
                <TouchableOpacity
                  key={`api-${idx}`}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                  className={`flex-row items-center gap-2 p-3.5 ${
                    !isLast ? "border-b border-border" : ""
                  }`}
                >
                  <View className="w-9 h-9 rounded-xl bg-muted items-center justify-center">
                    <Icons.MapPin size={18} className="text-muted-foreground" />
                  </View>

                  <View className="flex-1">
                    <Text
                      className="text-sm font-semibold text-foreground"
                      numberOfLines={1}
                    >
                      {primaryTitle}
                    </Text>
                    <Text
                      className="text-xs text-muted-foreground mt-0.5"
                      numberOfLines={1}
                    >
                      {label}
                    </Text>
                  </View>

                  {/* Fill query into searchbar button */}
                  <TouchableOpacity
                    onPress={() => handleFillQuery(primaryTitle)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    className="p-2 rounded-full active:bg-muted"
                  >
                    <Icons.ArrowUpLeft
                      size={18}
                      className="text-muted-foreground"
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Idle State (Quick Actions + Recents) */}
        {debouncedQuery.length < 2 && (
          <>
            {/* Quick Actions (Side by Side in 1 line) */}
            <View className="flex-row gap-2 px-3 pt-2">
              {/* Use Current Location */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => {
                  // Action for current location
                  console.log("GPS");
                }}
                className="flex-1 flex-row items-center gap-2 px-5 py-3 bg-muted rounded-2xl border border-border active:opacity-80"
              >
                <Icons.LocateFixed
                  size={20}
                  className="text-muted-foreground"
                />
                <View className="flex-1">
                  <Text
                    className="text-sm font-semibold text-foreground"
                    numberOfLines={1}
                  >
                    Use My Location
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Select on Map */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => {
                  // Action for map selection
                  console.log("MAP");
                }}
                className="flex-1 flex-row items-center gap-3 py-3 px-5 bg-emerald-600 dark:bg-emerald-900 rounded-xl active:opacity-80"
              >
                <Icons.MapPinned size={20} className="text-white" />
                <View className="flex-1">
                  <Text
                    className="text-sm font-semibold text-white"
                    numberOfLines={1}
                  >
                    Select on Map
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Recent Searches */}
            {recents.length > 0 && (
              <View className="mt-6 px-4">
                <View className="flex-row items-center justify-between mb-2.5 px-1">
                  <Text className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Recent Searches
                  </Text>
                  <TouchableOpacity
                    onPress={async () => {
                      setRecents([]);
                      await AsyncStorage.removeItem(RECENT_KEY);
                    }}
                  >
                    <Text className="text-xs font-semibold text-rose-600 dark:text-destructive opacity-70">
                      Clear all
                    </Text>
                  </TouchableOpacity>
                </View>

                <View>
                  {recents.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleSelectRecent(item)}
                      activeOpacity={0.7}
                      className={`flex-row items-center gap-2 p-3 active:bg-muted ${
                        idx < recents.length - 1 ? "border-b border-border" : ""
                      }`}
                    >
                      <View className="w-9 h-9 rounded-xl bg-muted items-center justify-center">
                        <Icons.Clock
                          size={16}
                          className="text-muted-foreground"
                        />
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-sm font-medium text-foreground"
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        <Text
                          className="text-xs text-muted-foreground mt-0.5"
                          numberOfLines={1}
                        >
                          {item.displayName}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleClearRecent(item.displayName)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        className="p-1 rounded-full active:bg-muted"
                      >
                        <Icons.X size={16} className="text-muted-foreground" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Empty Recent Searches Placeholder */}
            {recents.length === 0 && (
              <View className="py-16 items-center px-6">
                <View className="w-14 h-14 rounded-2xl bg-muted items-center justify-center mb-3">
                  <Icons.Search size={28} className="text-muted-foreground" />
                </View>
                <Text className="text-base font-semibold text-foreground">
                  Search for a city or district
                </Text>
                <Text className="text-sm text-muted-foreground text-center mt-1">
                  Your recent location searches will appear here.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
