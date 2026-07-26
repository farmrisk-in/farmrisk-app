/**
 * components/dashboard/SearchSection.tsx
 * Location search using react-native-paper Searchbar and List.Section.
 * Renders suggestions inline so ScrollView clipping never hides the list.
 */
import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import {
  Searchbar,
  List,
  Card,
  Text,
  TouchableRipple,
} from "react-native-paper";
import { useLocationSearch } from "@/hooks/useDashboardQueries";
import { useLocationContext } from "@/providers/LocationProvider";

export function SearchSection() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { setLocation } = useLocationContext();

  // Debounce input (400ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = useLocationSearch(debouncedQuery);
  console.log(results);
  const handleSelect = (item: any) => {
    setLocation({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      name: item.district || item.display_name,
      displayName: item.display_name,
    });
    setQuery(item.display_name);
    setShowResults(false);
  };

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.label}>
        📍 Search Location
      </Text>
      <Searchbar
        placeholder="Search city, district..."
        onChangeText={(t) => {
          setQuery(t);
          setShowResults(true);
        }}
        value={query}
        loading={isLoading}
        style={styles.searchbar}
        inputStyle={styles.searchInput}
      />

      {showResults && results && results.length > 0 && (
        <Card style={styles.resultsCard} mode="elevated">
          <Card.Content style={{ paddingHorizontal: 0, paddingVertical: 4 }}>
            {results.map((item: any, idx: number) => (
              <List.Item
                key={idx}
                title={item.displayName}
                titleNumberOfLines={2}
                left={(props) => <List.Icon {...props} icon="map-marker" />}
                onPress={() => handleSelect(item)}
                style={styles.listItem}
              />
            ))}
          </Card.Content>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontWeight: "700", marginBottom: 8, color: "#1a1a1a" },
  searchbar: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    elevation: 2,
  },
  searchInput: {
    color: "#000000",
  },
  resultsCard: {
    marginTop: 6,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    elevation: 4,
  },
  listItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
});
