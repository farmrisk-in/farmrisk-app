import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Card, Text, ActivityIndicator } from "react-native-paper";
import { useAI } from "@/hooks/useAI";

interface Props {
  crop?: string;
}

export function AIAdvisorySection({ crop }: Props) {
  const { data, isLoading, isError } = useAI(crop, "en");

  return (
    <View>
      <Card.Content>
        <Text variant="titleMedium">AI Overview</Text>
        {isLoading && <ActivityIndicator />}
        {isError && <Text>Advisory request failed. Try again.</Text>}
        {data && (
          <View>
            <Text>{data}</Text>
          </View>
        )}
      </Card.Content>
    </View>
  );
}
