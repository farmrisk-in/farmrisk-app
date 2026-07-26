import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, Chip, ActivityIndicator } from "react-native-paper";
import { useCrops } from "@/hooks/useCrops";

interface Props {
  selectedCrop?: string;
  onSelectCrop: (cropId: string) => void;
}

export function CropsSection({ selectedCrop, onSelectCrop }: Props) {
  const { crops, district, state, isLoading, isError } = useCrops();

  if (isLoading) return <ActivityIndicator style={{ marginVertical: 16 }} />;
  if (isError) return <Text style={styles.error}>Failed to load crops</Text>;
  if (!crops.length) return null;

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>🌾 Top Crops — {district}, {state}</Text>
      <Text variant="bodySmall" style={styles.subtitle}>Tap a crop to filter soil & calendar data</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {crops.map((crop: any) => {
          const cropId = crop.id || crop.name?.toLowerCase();
          const isSelected = selectedCrop === cropId;
          return (
            <Chip
              key={cropId}
              selected={isSelected}
              onPress={() => onSelectCrop(isSelected ? "" : cropId)}
              style={[styles.chip, isSelected && styles.chipSelected]}
              textStyle={isSelected ? styles.chipTextSelected : styles.chipText}
            >
              {crop.name} ({crop.area} ha)
            </Chip>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  title: { fontWeight: "700", marginBottom: 2, color: "#1a1a1a" },
  subtitle: { color: "#888", marginBottom: 8 },
  chip: { marginRight: 8, backgroundColor: "#ffffff" },
  chipSelected: { backgroundColor: "#2ecc71" },
  chipText: { color: "#333", fontSize: 13 },
  chipTextSelected: { color: "#ffffff", fontWeight: "700", fontSize: 13 },
  error: { color: "red", marginVertical: 8 },
});
