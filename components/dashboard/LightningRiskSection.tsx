import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, ActivityIndicator } from "react-native-paper";
import { useWeather } from "@/hooks/useWeather";

const RISK_COLORS: Record<string, string> = {
  Low: "#2ecc71",
  Moderate: "#f39c12",
  High: "#e74c3c",
  Extreme: "#8e44ad",
};

export function LightningRiskSection() {
  const { data, isLoading, isError } = useWeather();

  if (isLoading) return <ActivityIndicator style={{ marginVertical: 16 }} />;
  if (isError) return <Text style={styles.error}>Failed to load lightning risk</Text>;

  const lightning = data?.lightning;
  if (!lightning) return null;

  const color = RISK_COLORS[lightning.category] ?? "#888";

  return (
    <Card style={[styles.card, { borderLeftColor: color }]} mode="elevated">
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>⚡ Lightning Risk</Text>
        <Text variant="headlineMedium" style={[styles.category, { color }]}>{lightning.category}</Text>
        <Text variant="bodyMedium" style={styles.score}>Risk Score: {lightning.score}/100</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff9e6",
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 6,
  },
  title: { fontWeight: "700", marginBottom: 4, color: "#1a1a1a" },
  category: { fontWeight: "bold", marginBottom: 2 },
  score: { color: "#444" },
  error: { color: "red", marginVertical: 8 },
});
