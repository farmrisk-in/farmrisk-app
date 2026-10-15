import { useState, useEffect, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import Constants from "expo-constants";
import { getApiUrl } from "@/lib/api";

export interface VersionInfo {
  minVersion: string;
  latestVersion: string;
  minVersionCode?: number;
  forceUpdate?: boolean;
  title?: string;
  message?: string;
  storeUrl?: string;
  playStoreWebUrl?: string;
}

export function isVersionOlder(current: string, minRequired: string): boolean {
  if (!current || !minRequired) return false;
  const cParts = current.split(".").map((n) => parseInt(n, 10) || 0);
  const mParts = minRequired.split(".").map((n) => parseInt(n, 10) || 0);
  const len = Math.max(cParts.length, mParts.length);

  for (let i = 0; i < len; i++) {
    const c = cParts[i] ?? 0;
    const m = mParts[i] ?? 0;
    if (c < m) return true;
    if (c > m) return false;
  }
  return false;
}

export function useForceUpdateCheck() {
  const [needsUpdate, setNeedsUpdate] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [updateInfo, setUpdateInfo] = useState<VersionInfo | null>(null);

  const checkVersion = useCallback(async () => {
    try {
      setIsChecking(true);
      const baseUrl = getApiUrl();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${baseUrl}/api/app-version`, {
        signal: controller.signal,
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        // If endpoint is not found or fails, do not block the user
        setIsChecking(false);
        return;
      }

      const data: VersionInfo = await res.json();
      setUpdateInfo(data);

      const currentVersion = Constants.expoConfig?.version || "1.0.0";
      const currentCode = Constants.expoConfig?.android?.versionCode ?? 1;

      const isOlderVersion = isVersionOlder(currentVersion, data.minVersion);
      const isOlderCode =
        data.minVersionCode !== undefined && currentCode < data.minVersionCode;

      if ((isOlderVersion || isOlderCode) && data.forceUpdate !== false) {
        setNeedsUpdate(true);
      } else {
        setNeedsUpdate(false);
      }
    } catch {
      // Network failure or offline: allow user to continue gracefully
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkVersion();

    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") {
          checkVersion();
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [checkVersion]);

  return {
    needsUpdate,
    isChecking,
    updateInfo,
    recheckUpdate: checkVersion,
  };
}
