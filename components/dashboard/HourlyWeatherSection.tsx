import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, ActivityIndicator, Card } from "react-native-paper";
import { useWeather } from "@/hooks/useWeather";

export function HourlyWeatherSection() {
  const { data, isLoading, isError } = useWeather();

  if (isLoading) return <ActivityIndicator style={{ marginVertical: 16 }} />;
  if (isError) return <Text style={styles.error}>Failed to load hourly weather</Text>;

  const hourly = data?.hourly;
  if (!hourly?.time?.length) return null;

  const hours = hourly.time.slice(0, 24);

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>⏱ Hourly Weather</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {hours.map((time: string, i: number) => {
          const label = new Date(time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <Card key={i} style={styles.itemCard} mode="outlined">
              <Card.Content style={styles.cardContent}>
                <Text style={styles.time}>{label}</Text>
                <Text style={styles.temp}>
                  {hourly.temperature_2m?.[i] ?? "—"}°
                </Text>
                <Text style={styles.humidity}>
                  💧{hourly.relative_humidity_2m?.[i] ?? "—"}%
                </Text>
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
    minWidth: 70,
  },
  cardContent: { paddingHorizontal: 10, paddingVertical: 8, alignItems: "center" },
  time: { fontSize: 11, color: "#555", marginBottom: 4 },
  temp: { fontSize: 16, fontWeight: "700", color: "#1a73e8" },
  humidity: { fontSize: 11, color: "#555", marginTop: 4 },
  error: { color: "red", marginVertical: 8 },
});
