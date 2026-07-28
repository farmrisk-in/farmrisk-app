/**
 * app/search.tsx
 * Full-page search modal — Google Maps style.
 * Auto-focuses the search bar. Shows recent searches when idle,
 * live results when typing.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Keyboard,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import { useLocationSearch } from "@/hooks/useDashboardQueries";
import { useLocationContext } from "@/providers/LocationProvider";
import {
  Search,
  ArrowLeft,
  X,
  MapPin,
  Clock,
  Navigation,
  Map,
} from "lucide-react-native";

const RECENT_KEY = "farmrisk:recent_locations";
const MAX_RECENT = 5;

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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [recents, setRecents] = useState<RecentItem[]>([]);

  const inputRef = useRef<TextInput>(null);

  // Auto-focus search bar when screen mounts
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
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
    [recents]
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
    [setLocation, saveRecent, router]
  );

  const handleSelectRecent = useCallback(
    (item: RecentItem) => {
      setLocation(item);
      saveRecent(item);
      router.back();
    },
    [setLocation, saveRecent, router]
  );

  const handleClearRecent = useCallback(
    async (displayName: string) => {
      const updated = recents.filter((r) => r.displayName !== displayName);
      setRecents(updated);
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    },
    [recents]
  );

  // --- Colors (inline so no CSS var issues) ---
  const bg = isDark ? "#09090b" : "#fafafa";
  const surface = isDark ? "#18181b" : "#ffffff";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const textPrimary = isDark ? "#fafafa" : "#09090b";
  const textMuted = isDark ? "#9f9fa9" : "#71717a";
  const accent = "#006045";
  const accentSoft = isDark ? "#052e16" : "#ecfdf5";
  const divider = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";

  const showResults = debouncedQuery.length >= 2 && results;
  const showEmpty = debouncedQuery.length >= 2 && !isLoading && results?.length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {/* ── Search bar ─────────────────────────────────────────── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 8,
          gap: 10,
          borderBottomWidth: 1,
          borderBottomColor: border,
          backgroundColor: surface,
        }}
      >
        {/* Back */}
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{ padding: 4 }}
        >
          <ArrowLeft size={22} color={textPrimary} />
        </TouchableOpacity>

        {/* Input */}
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Search size={18} color={textMuted} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search city, district, state..."
            placeholderTextColor={textMuted}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            style={{
              flex: 1,
              fontSize: 16,
              color: textPrimary,
              paddingVertical: Platform.OS === "ios" ? 10 : 6,
            }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={18} color={textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Body ───────────────────────────────────────────────── */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Loading */}
        {isLoading && debouncedQuery.length >= 2 && (
          <View style={{ padding: 32, alignItems: "center" }}>
            <ActivityIndicator color={accent} />
            <Text style={{ marginTop: 8, color: textMuted, fontSize: 14 }}>
              Searching...
            </Text>
          </View>
        )}

        {/* No results */}
        {showEmpty && (
          <View style={{ padding: 32, alignItems: "center" }}>
            <MapPin size={32} color={textMuted} />
            <Text style={{ marginTop: 12, color: textMuted, fontSize: 15, textAlign: "center" }}>
              No results for "{debouncedQuery}"
            </Text>
          </View>
        )}

        {/* Search results */}
        {showResults && !isLoading && results!.length > 0 && (
          <View style={{ paddingTop: 8 }}>
            <Text style={{ paddingHorizontal: 16, paddingVertical: 10, fontSize: 12, fontWeight: "600", color: textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>
              Results
            </Text>
            {results!.map((item: any, idx: number) => {
              const label = item.displayName || item.display_name || "";
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.65}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    gap: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: divider,
                  }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: accentSoft, alignItems: "center", justifyContent: "center" }}>
                    <MapPin size={16} color={accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "500", color: textPrimary }}>
                      {item.district || item.state || label.split(",")[0]}
                    </Text>
                    <Text numberOfLines={1} style={{ fontSize: 13, color: textMuted, marginTop: 2 }}>
                      {label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Idle state — show when not searching */}
        {debouncedQuery.length < 2 && (
          <>
            {/* Quick actions */}
            <View style={{ paddingTop: 16, paddingHorizontal: 16, gap: 2 }}>
              <TouchableOpacity
                activeOpacity={0.65}
                onPress={() => {
                  // TODO: wire up GPS permission + device location
                  router.back();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: divider,
                }}
              >
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: accentSoft, alignItems: "center", justifyContent: "center" }}>
                  <Navigation size={16} color={accent} />
                </View>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: "500", color: textPrimary }}>
                    Use my current location
                  </Text>
                  <Text style={{ fontSize: 13, color: textMuted, marginTop: 2 }}>
                    Enable GPS for automatic detection
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.65}
                onPress={() => {
                  // TODO: open map picker screen
                  router.back();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  paddingVertical: 16,
                }}
              >
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: accentSoft, alignItems: "center", justifyContent: "center" }}>
                  <Map size={16} color={accent} />
                </View>
                <View>
                  <Text style={{ fontSize: 15, fontWeight: "500", color: textPrimary }}>
                    Select from map
                  </Text>
                  <Text style={{ fontSize: 13, color: textMuted, marginTop: 2 }}>
                    Tap any point on the map
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Recent searches */}
            {recents.length > 0 && (
              <View style={{ marginTop: 24 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 4 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: textMuted, textTransform: "uppercase", letterSpacing: 0.8 }}>
                    Recent
                  </Text>
                  <TouchableOpacity
                    onPress={async () => {
                      setRecents([]);
                      await AsyncStorage.removeItem(RECENT_KEY);
                    }}
                  >
                    <Text style={{ fontSize: 13, color: accent, fontWeight: "500" }}>Clear all</Text>
                  </TouchableOpacity>
                </View>

                {recents.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleSelectRecent(item)}
                    activeOpacity={0.65}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      gap: 14,
                      borderBottomWidth: idx < recents.length - 1 ? 1 : 0,
                      borderBottomColor: divider,
                    }}
                  >
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: isDark ? "#27272a" : "#f4f4f5", alignItems: "center", justifyContent: "center" }}>
                      <Clock size={16} color={textMuted} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "500", color: textPrimary }}>
                        {item.name}
                      </Text>
                      <Text numberOfLines={1} style={{ fontSize: 13, color: textMuted, marginTop: 2 }}>
                        {item.displayName}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleClearRecent(item.displayName)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <X size={16} color={textMuted} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {recents.length === 0 && (
              <View style={{ paddingTop: 48, alignItems: "center", gap: 8 }}>
                <Search size={40} color={isDark ? "#27272a" : "#e4e4e7"} />
                <Text style={{ fontSize: 15, color: textMuted }}>Search for a location</Text>
                <Text style={{ fontSize: 13, color: isDark ? "#52525b" : "#a1a1aa", textAlign: "center", paddingHorizontal: 32 }}>
                  Your recent searches will appear here
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
