/**
 * QueryProvider.tsx
 * Wraps the app with TanStack Query client.
 * Integrates Expo DevTools plugin (@dev-plugins/react-query)
 * plus an in-app visual Query DevTools Inspector panel.
 */
import React, { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { useReactQueryDevTools } from "@dev-plugins/react-query";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

/**
 * In-App TanStack Query DevTools Drawer / Floating Inspector Button
 */
function InAppDevTools() {
  // Connect to Expo DevTools Plugin
  useReactQueryDevTools(queryClient);

  const [isOpen, setIsOpen] = useState(false);
  const client = useQueryClient();
  const queryCache = client.getQueryCache().getAll();

  return (
    <>
      {/* Floating DevTools Toggle Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsOpen(true)}
      >
        <Text style={styles.floatingButtonText}>
          ⚡ Query DevTools ({queryCache.length})
        </Text>
      </TouchableOpacity>

      {/* DevTools Drawer Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>⚡ TanStack Query DevTools</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setIsOpen(false)}
            >
              <Text style={styles.closeBtnText}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            <Text style={styles.sectionHeader}>
              Active Queries ({queryCache.length})
            </Text>
            {queryCache.length === 0 ? (
              <Text style={styles.emptyText}>No queries cached yet.</Text>
            ) : (
              queryCache.map((q, idx) => {
                const state = q.state;
                const statusColor =
                  state.status === "success"
                    ? "#2ecc71"
                    : state.status === "error"
                      ? "#e74c3c"
                      : "#f39c12";

                return (
                  <View key={idx} style={styles.queryCard}>
                    <View style={styles.queryRow}>
                      <Text style={styles.queryKey}>
                        {JSON.stringify(q.queryKey)}
                      </Text>
                      <Text
                        style={[styles.badge, { backgroundColor: statusColor }]}
                      >
                        {state.status}
                      </Text>
                    </View>
                    <Text style={styles.metaText}>
                      Updated:{" "}
                      {new Date(state.dataUpdatedAt).toLocaleTimeString()} |
                      Fetching: {String(state.status)}
                    </Text>
                    {state.data ? (
                      <View style={styles.dataBox}>
                        <Text style={styles.dataText}>
                          {JSON.stringify(state.data, null, 2).slice(0, 300)}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                );
              })
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <InAppDevTools />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 16,
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 25,
    zIndex: 9999,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  floatingButtonText: { color: "#2ecc71", fontWeight: "700", fontSize: 12 },
  modalSafeArea: { flex: 1, backgroundColor: "#121212" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  closeBtn: {
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  closeBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  body: { flex: 1, padding: 16 },
  sectionHeader: {
    color: "#aaa",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
  },
  emptyText: { color: "#666", fontSize: 14 },
  queryCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  queryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  queryKey: {
    color: "#61dafb",
    fontWeight: "600",
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "700",
  },
  metaText: { color: "#888", fontSize: 11, marginTop: 4 },
  dataBox: {
    backgroundColor: "#0a0a0a",
    borderRadius: 4,
    padding: 8,
    marginTop: 6,
  },
  dataText: {
    color: "#a6e22e",
    fontFamily: "Platform.OS === 'ios' ? 'Courier' : 'monospace'",
    fontSize: 10,
  },
});
