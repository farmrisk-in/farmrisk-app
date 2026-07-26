import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Card, Text, ActivityIndicator } from "react-native-paper";
import { useForecast } from "@/hooks/useForecast";

export function ForecastSection() {
  const { forecastRows, isLoading, isError } = useForecast();

  if (isLoading) return <ActivityIndicator style={{ marginVertical: 16 }} />;
  if (isError && forecastRows.length === 0) return <Text style={styles.error}>Forecast unavailable</Text>;
  if (!forecastRows.length) return null;

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>📅 16-Day Forecast</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {forecastRows.slice(0, 16).map((day: any, i: number) => {
          const dateLabel = day.date ?? `Day ${i + 1}`;
          const tempMax = day.tmax_corrected ?? day.tmax ?? "—";
          const tempMin = day.tmin_corrected ?? day.tmin ?? "—";
          const rain = day.pcp_corrected ?? day.pcp ?? "—";

          return (
            <Card key={i} style={styles.itemCard} mode="outlined">
              <Card.Content style={styles.cardContent}>
                <Text style={styles.date}>{String(dateLabel).slice(5, 10)}</Text>
                <Text style={styles.maxTemp}>↑{tempMax}°</Text>
                <Text style={styles.minTemp}>↓{tempMin}°</Text>
                {rain !== "—" && <Text style={styles.rain}>🌧{rain}mm</Text>}
              </Card.Content>
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  title: { fontWeight: "700", marginBottom: 8, color: "#1a1a1a" },
  itemCard: {
    backgroundColor: "#ffffff",
    marginRight: 8,
    borderRadius: 10,
    minWidth: 64,
  },
  cardContent: { paddingHorizontal: 8, paddingVertical: 8, alignItems: "center" },
  date: { fontSize: 11, color: "#555", marginBottom: 4 },
  maxTemp: { fontSize: 14, fontWeight: "700", color: "#e74c3c" },
  minTemp: { fontSize: 12, color: "#2980b9" },
  rain: { fontSize: 11, color: "#3498db", marginTop: 2 },
  error: { color: "red", marginVertical: 8 },
});
