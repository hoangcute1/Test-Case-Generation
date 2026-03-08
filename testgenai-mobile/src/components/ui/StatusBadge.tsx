import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "TO DO": { bg: "#E5E7EB", text: "#6B7280" },
  "IN PROGRESS": { bg: "#DBEAFE", text: "#3B82F6" },
  "IN REVIEW": { bg: "#E0E7FF", text: "#6366F1" },
  DONE: { bg: "#D1FAE5", text: "#10B981" },
};

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const key = (status || "").trim().toUpperCase();
  const color = STATUS_COLORS[key] || STATUS_COLORS["TO DO"];

  const label = (status || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <View style={[styles.badge, { backgroundColor: color.bg }]}>
      <Text style={[styles.text, { color: color.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 11,
    fontWeight: "600",
  },
});
