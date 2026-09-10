import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { Icon } from "@/components/ui/Icon";
import LockKeyIcon from "@hugeicons/core-free-icons/LockKeyIcon";
import File01Icon from "@hugeicons/core-free-icons/File01Icon";
import Alert01Icon from "@hugeicons/core-free-icons/Alert01Icon";
import { CloudOffIcon } from "@hugeicons/core-free-icons";

export interface MarkdownViewerProps {
  content?: string | null;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  emptySubtext?: string;
}

export function MarkdownViewer({
  content,
  isLoading,
  isError,
  errorMessage = "Failed to load content",
  emptyMessage = "No information available yet",
  emptySubtext = "Generated advisory guidelines will appear here.",
}: MarkdownViewerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const styles = isDark ? darkStyles : lightStyles;

  if (isLoading) {
    return (
      <View className="flex flex-col items-center justify-center py-7 px-4">
        <ActivityIndicator size={"large"} color="#10b981" />
        <Text className="text-sm text-muted-foreground mt-3">
          Loading content...
        </Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex flex-col items-center justify-center py-7 px-4 text-center">
        <Icon icon={CloudOffIcon} size={32} className="text-destructive" />
        <Text className="mt-4 text-muted-foreground font-medium">
          ERROR HAPPPEDNED
        </Text>
      </View>
    );
  }

  if (!content || !content.trim()) {
    return (
      <View className="flex flex-col items-center justify-center py-7 px-4 text-center">
        <View className="flex w-9 h-9 items-center justify-center rounded-full bg-muted mb-2">
          <Icon icon={File01Icon} size={18} className="text-muted-foreground" />
        </View>
        <Text className="text-xs font-semibold text-foreground">
          {emptyMessage}
        </Text>
        {emptySubtext && (
          <Text className="text-[11px] text-muted-foreground mt-0.5 max-w-[250px] text-center">
            {emptySubtext}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View className="w-full">
      <Markdown style={styles}>{content}</Markdown>
    </View>
  );
}

const lightStyles = StyleSheet.create({
  body: {
    color: "#334155",
    fontSize: 14,
    lineHeight: 22,
  },
  heading1: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 4,
  },
  heading2: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 6,
  },
  heading3: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    marginBottom: 8,
    marginTop: 0,
  },
  strong: {
    fontWeight: "bold",
    color: "#0f172a",
  },
  em: {
    fontStyle: "italic",
  },
  blockquote: {
    backgroundColor: "#ecfdf5", // emerald-50
    borderLeftWidth: 3,
    borderLeftColor: "#10b981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 8,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    fontStyle: "italic",
    color: "#065f46", // emerald-800
  },
  code_inline: {
    backgroundColor: "#f1f5f9",
    color: "#059669",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontFamily: "monospace",
    fontSize: 12,
  },
  code_block: {
    backgroundColor: "#f1f5f9",
    color: "#059669",
    borderRadius: 8,
    padding: 12,
    fontFamily: "monospace",
    fontSize: 12,
    marginVertical: 8,
  },
  bullet_list: {
    marginBottom: 8,
  },
  ordered_list: {
    marginBottom: 8,
  },
  list_item: {
    marginBottom: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 10,
  },
  thead: {
    backgroundColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tbody: {},
  tr: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    flexDirection: "row",
  },
  th: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
    color: "#0f172a",
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
  },
  td: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
    color: "#334155",
  },
  hr: {
    backgroundColor: "#e2e8f0",
    height: 1,
    marginVertical: 12,
  },
});

const darkStyles = StyleSheet.create({
  body: {
    color: "#cbd5e1", // slate-300
    fontSize: 14,
    lineHeight: 22,
  },
  heading1: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    paddingBottom: 4,
  },
  heading2: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 6,
  },
  heading3: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    marginBottom: 8,
    marginTop: 0,
  },
  strong: {
    fontWeight: "bold",
    color: "#f8fafc",
  },
  em: {
    fontStyle: "italic",
  },
  blockquote: {
    backgroundColor: "#022c22", // emerald-950
    borderLeftWidth: 3,
    borderLeftColor: "#10b981", // emerald-500
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 8,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    fontStyle: "italic",
    color: "#a7f3d0", // emerald-200
  },
  code_inline: {
    backgroundColor: "#1e293b",
    color: "#34d399",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontFamily: "monospace",
    fontSize: 12,
  },
  code_block: {
    backgroundColor: "#1e293b",
    color: "#34d399",
    borderRadius: 8,
    padding: 12,
    fontFamily: "monospace",
    fontSize: 12,
    marginVertical: 8,
  },
  bullet_list: {
    marginBottom: 8,
  },
  ordered_list: {
    marginBottom: 8,
  },
  list_item: {
    marginBottom: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 10,
  },
  thead: {
    backgroundColor: "#1e293b",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  tbody: {},
  tr: {
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    flexDirection: "row",
  },
  th: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
    color: "#f8fafc",
    borderRightWidth: 1,
    borderRightColor: "#334155",
  },
  td: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    borderRightWidth: 1,
    borderRightColor: "#334155",
    color: "#cbd5e1",
  },
  hr: {
    backgroundColor: "#334155",
    height: 1,
    marginVertical: 12,
  },
});
