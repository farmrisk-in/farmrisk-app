import React from "react";
import { StyleSheet } from "react-native";
import { Card, Text, ActivityIndicator } from "react-native-paper";
import { useWeatherSummary } from "@/hooks/useWeatherSummary";

export function WeatherSummarySection() {
  const { data, isLoading, isError } = useWeatherSummary("en");

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>🤖 AI Weather Summary</Text>
        {isLoading && <ActivityIndicator style={{ marginVertical: 8 }} />}
        {isError && <Text style={styles.error}>Summary unavailable</Text>}
        {data && <Text variant="bodyMedium" style={styles.summary}>{data}</Text>}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#f3f0ff", borderRadius: 12, marginBottom: 16 },
  title: { fontWeight: "700", marginBottom: 6, color: "#1a1a1a" },
  summary: { color: "#333", lineHeight: 20 },
  error: { color: "red", marginVertical: 4 },
});
