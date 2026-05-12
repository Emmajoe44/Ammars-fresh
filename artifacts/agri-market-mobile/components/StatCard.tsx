import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentProps<typeof Feather>["name"];
  tone?: "primary" | "secondary" | "info" | "warning" | "success" | "destructive";
}

const TONES: Record<NonNullable<StatCardProps["tone"]>, { fg: string; bgKey: keyof ReturnType<typeof useColors> }> = {
  primary: { fg: "primary", bgKey: "primary" } as any,
  secondary: { fg: "secondary", bgKey: "secondary" } as any,
  info: { fg: "info", bgKey: "info" } as any,
  warning: { fg: "warning", bgKey: "warning" } as any,
  success: { fg: "success", bgKey: "success" } as any,
  destructive: { fg: "destructive", bgKey: "destructive" } as any,
};

export function StatCard({ label, value, icon, tone = "primary" }: StatCardProps) {
  const colors = useColors();
  const colorKey = TONES[tone].bgKey as keyof typeof colors;
  const accent = (colors as any)[colorKey] as string;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: accent + "1A" }]}>
        <Feather name={icon} size={18} color={accent} />
      </View>
      <Text style={[styles.value, { color: colors.foreground }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.label, { color: colors.mutedForeground }]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: "#1a1410",
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
      },
      android: { elevation: 1 },
      web: { boxShadow: "0 2px 10px rgba(26, 20, 16, 0.04)" } as any,
      default: {},
    }),
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  value: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  label: { fontSize: 11, fontWeight: "500", lineHeight: 14 },
});
