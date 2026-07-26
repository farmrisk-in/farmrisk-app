import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, ActivityIndicator } from "react-native-paper";
import { useSoilMoisture } from "@/hooks/useSoilMoisture";

interface Props {
  crop?: string;
}

export function SoilMoistureSection({ crop }: Props) {
  const { data, isLoading, isError } = useSoilMoisture(crop);

  if (isLoading) return <ActivityIndicator style={{ marginVertical: 16 }} />;
  if (isError) return <Text style={styles.error}>Soil moisture data unavailable</Text>;
  if (!data) return null;

  if (data.success === false || data.error) {
    return (
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="titleMedium" style={styles.title}>🌱 Soil Moisture</Text>
          {crop && <Text variant="labelSmall" style={styles.cropLabel}>Crop: {crop}</Text>}
          <Text style={styles.notice}>
            {data.message || data.error || "No soil moisture data for this crop/location."}
          </Text>
        </Card.Content>
      </Card>
    );
  }

  const entries = Object.entries(data).filter(
    ([k]) => !["success", "error"].includes(k)
  );

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>🌱 Soil Moisture</Text>
        {crop ? (
          <Text variant="labelMedium" style={styles.cropLabel}>Selected Crop: {crop}</Text>
        ) : (
          <Text variant="labelMedium" style={styles.cropLabel}>General Soil Assessment</Text>
        )}
        {entries.map(([key, value]) => {
          const displayVal =
            typeof value === "object"
              ? JSON.stringify(value, null, 2)
              : String(value);

          return (
            <View key={key} style={styles.row}>
              <Text style={styles.key}>{key.replace(/_/g, " ")}:</Text>
              <Text style={styles.value}>{displayVal}</Text>
            </View>
          );
        })}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#f0fff4", borderRadius: 12, marginBottom: 16 },
  title: { fontWeight: "700", marginBottom: 6, color: "#1a1a1a" },
  cropLabel: { color: "#27ae60", fontWeight: "600", marginBottom: 8 },
  row: { marginBottom: 6 },
  key: { fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 2, textTransform: "capitalize" },
  value: { fontSize: 13, color: "#444", backgroundColor: "#e8f8f0", padding: 6, borderRadius: 6 },
  notice: { fontSize: 13, color: "#666", fontStyle: "italic" },
  error: { color: "red", marginVertical: 8 },
});
