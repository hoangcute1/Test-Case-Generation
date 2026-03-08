import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "destructive" | "orange";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  size = "md",
}) => {
  const { colors } = useTheme();

  const bgColor = {
    primary: colors.primary,
    secondary: colors.muted,
    outline: "transparent",
    destructive: colors.destructive,
    orange: colors.orange,
  }[variant];

  const txtColor = {
    primary: colors.primaryForeground,
    secondary: colors.text,
    outline: colors.text,
    destructive: colors.primaryForeground,
    orange: colors.primaryForeground,
  }[variant];

  const borderColor = variant === "outline" ? colors.border : "transparent";

  const padV = size === "sm" ? 8 : size === "lg" ? 16 : 12;
  const padH = size === "sm" ? 14 : size === "lg" ? 24 : 18;
  const fontSize = size === "sm" ? 13 : size === "lg" ? 16 : 14;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.base,
        {
          backgroundColor: bgColor,
          borderColor,
          borderWidth: variant === "outline" ? 1 : 0,
          paddingVertical: padV,
          paddingHorizontal: padH,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={txtColor} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: txtColor, fontSize }, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    gap: 8,
  },
  text: {
    fontWeight: "600",
  },
});
