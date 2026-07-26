import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, ActivityIndicator } from "react-native-paper";
import { useCalendar } from "@/hooks/useCalendar";

interface Props {
  crop: string;
}

const MONTH_NAMES = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatPeriod(fromDay: number, fromMon: number, toDay: number, toMon: number) {
  return `${fromDay} ${MONTH_NAMES[fromMon]} – ${toDay} ${MONTH_NAMES[toMon]}`;
}

export function CalendarSection({ crop }: Props) {
  const { calendar, district, state, isLoading, isError } = useCalendar(crop);

  if (!crop) {
    return (
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.title}>📆 Crop Calendar</Text>
          <Text style={styles.hint}>Select a crop above to see its sowing and harvesting calendar.</Text>
        </Card.Content>
      </Card>
    );
  }

  if (isLoading) return <ActivityIndicator style={{ marginVertical: 16 }} />;
  if (isError) return <Text style={styles.error}>Failed to load calendar</Text>;
  if (!calendar.length) {
    return (
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.title}>📆 Crop Calendar</Text>
          <Text style={styles.hint}>No calendar data for {crop} in this region.</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>📆 Crop Calendar</Text>
        <Text variant="bodySmall" style={styles.region}>{district}, {state}</Text>
        {calendar.map((entry: any, i: number) => (
          <View key={i} style={styles.entry}>
            <Text style={styles.cropName}>{entry.crop} — {entry.season}</Text>
            <Text style={styles.period}>
              🌱 Sow: {entry.sowingPeriod ?? formatPeriod(
                entry.sowFromDay, entry.sowFromMon, entry.sowToDay, entry.sowToMon
              )}
            </Text>
            <Text style={styles.period}>
              🌾 Harvest: {entry.harvestingPeriod ?? formatPeriod(
                entry.harvFromDay, entry.harvFromMon, entry.harvToDay, entry.harvToMon
              )}
            </Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fffbf0", borderRadius: 12, marginBottom: 16 },
  title: { fontWeight: "700", marginBottom: 2, color: "#1a1a1a" },
  region: { color: "#888", marginBottom: 8 },
  entry: { borderBottomWidth: 1, borderBottomColor: "#eee", paddingVertical: 8 },
  cropName: { fontSize: 14, fontWeight: "600", marginBottom: 2, color: "#222" },
  period: { fontSize: 13, color: "#555", marginBottom: 1 },
  hint: { fontSize: 13, color: "#888" },
  error: { color: "red", marginVertical: 8 },
});
