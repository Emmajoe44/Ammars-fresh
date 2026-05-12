import { Feather } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { PJS } from "@/components/ui/typography";
import { useColors } from "@/hooks/useColors";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  icon?: React.ComponentProps<typeof Feather>["name"];
  trailingIcon?: React.ComponentProps<typeof Feather>["name"] | null;
  size?: "md" | "lg";
}

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  variant = "primary",
  icon,
  trailingIcon = "arrow-right",
  size = "lg",
}: PrimaryButtonProps) {
  const colors = useColors();

  const palette = {
    primary: { bg: colors.primary, fg: "#ffffff", border: colors.primary },
    secondary: { bg: colors.muted, fg: colors.foreground, border: colors.border },
    danger: { bg: colors.destructive + "12", fg: colors.destructive, border: colors.destructive + "40" },
    ghost: { bg: "transparent", fg: colors.foreground, border: colors.border },
  }[variant];

  const isDisabled = disabled || loading;
  const showTrail = trailingIcon && variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btn,
        size === "lg" ? styles.lg : styles.md,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: isDisabled ? 0.65 : pressed ? 0.88 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
        },
        variant === "primary" && shadowPrimary,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.fg} />
      ) : (
        <View style={styles.row}>
          {icon && <Feather name={icon} size={size === "lg" ? 18 : 16} color={palette.fg} />}
          <Text style={[styles.lbl, { color: palette.fg, fontFamily: PJS.bold, fontSize: size === "lg" ? 15 : 14 }]}>
            {label}
          </Text>
          {showTrail && <Feather name={trailingIcon!} size={16} color={palette.fg} />}
        </View>
      )}
    </Pressable>
  );
}

const shadowPrimary = Platform.select({
  ios: { shadowColor: "#1f5a2e", shadowOpacity: 0.25, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
  android: { elevation: 4 },
  web: { boxShadow: "0 10px 24px rgba(31, 90, 46, 0.22)" } as any,
  default: {},
});

const styles = StyleSheet.create({
  btn: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  lg: { paddingVertical: 15 },
  md: { paddingVertical: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  lbl: { letterSpacing: 0.2 },
});
