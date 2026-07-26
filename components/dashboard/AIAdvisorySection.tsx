import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, TextInput, Button, ActivityIndicator } from "react-native-paper";
import { useAI } from "@/hooks/useAI";

interface Props {
  crop?: string;
}

export function AIAdvisorySection({ crop }: Props) {
  const [query, setQuery] = useState("");
  const { data, isLoading, isError, askAdvisory } = useAI(crop, "en");

  const handleAsk = () => {
    if (!query.trim()) return;
    askAdvisory(query.trim());
  };

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>🌾 AI Farm Advisory</Text>
        <TextInput
          mode="outlined"
          value={query}
          onChangeText={setQuery}
          placeholder="Ask a farming question..."
          style={styles.input}
          textColor="#000000"
          multiline
        />
        <Button
          mode="contained"
          onPress={handleAsk}
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}
          buttonColor="#2ecc71"
        >
          Ask Advisory
        </Button>
        {isLoading && <ActivityIndicator style={{ marginTop: 8 }} />}
        {isError && <Text style={styles.error}>Advisory request failed. Try again.</Text>}
        {data && (
          <View style={styles.result}>
            <Text style={styles.resultLabel}>Advisory:</Text>
            <Text style={styles.resultText}>{data}</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff8f0", borderRadius: 12, marginBottom: 16 },
  title: { fontWeight: "700", marginBottom: 8, color: "#1a1a1a" },
  input: { backgroundColor: "#ffffff", marginBottom: 10 },
  button: { borderRadius: 8, marginVertical: 4 },
  result: { marginTop: 12 },
  resultLabel: { fontWeight: "700", marginBottom: 4, color: "#27ae60" },
  resultText: { fontSize: 14, color: "#333", lineHeight: 20 },
  error: { color: "red", marginTop: 8 },
});
