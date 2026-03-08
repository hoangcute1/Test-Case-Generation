import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

/** Full-screen loading spinner */
export const LoadingView: React.FC<{ message?: string }> = ({ message }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      {message && (
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

/** Empty state with icon and optional action */
export const EmptyView: React.FC<{
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({
  icon = "document-text-outline",
  title,
  message,
  actionLabel,
  onAction,
}) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <View style={[styles.iconBg, { backgroundColor: colors.primary + "15" }]}>
        <Ionicons name={icon} size={32} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      {message && (
        <Text style={[styles.emptyMsg, { color: colors.textSecondary }]}>
          {message}
        </Text>
      )}
      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={onAction}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.actionText, { color: colors.primaryForeground }]}
          >
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/** Error state with retry and optional re-auth */
export const ErrorView: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
  onReAuth?: () => void;
}> = ({ title = "Something went wrong", message, onRetry, onReAuth }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: colors.background }]}>
      <View
        style={[styles.iconBg, { backgroundColor: colors.destructive + "15" }]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={32}
          color={colors.destructive}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.emptyMsg, { color: colors.textSecondary }]}>
        {message}
      </Text>
      <View style={styles.btnRow}>
        {onRetry && (
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.muted }]}
            onPress={onRetry}
          >
            <Text style={{ color: colors.textSecondary, fontWeight: "500" }}>
              Retry
            </Text>
          </TouchableOpacity>
        )}
        {onReAuth && (
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
            onPress={onReAuth}
          >
            <Text
              style={{ color: colors.primaryForeground, fontWeight: "500" }}
            >
              Re-authenticate
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
  },
  iconBg: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyMsg: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 300,
    lineHeight: 20,
  },
  actionBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionText: {
    fontWeight: "600",
    fontSize: 14,
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
});
