import { useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

const COOLDOWN_MS = 10000; // 10 seconds spam protection cooldown

export function useRefreshDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const lastRefreshRef = useRef<number>(0);

  const onRefresh = useCallback(async () => {
    const now = Date.now();
    const timeSinceLast = now - lastRefreshRef.current;

    setRefreshing(true);

    // Spam Protection: If pulled again within 10s cooldown, don't spam backend APIs
    if (timeSinceLast < COOLDOWN_MS) {
      setTimeout(() => {
        setRefreshing(false);
      }, 400);
      return;
    }

    try {
      lastRefreshRef.current = now;
      // Invalidate all weather & agronomy queries while keeping location context intact
      await queryClient.invalidateQueries();
    } catch (err) {
      console.warn("Dashboard refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  return { refreshing, onRefresh };
}
