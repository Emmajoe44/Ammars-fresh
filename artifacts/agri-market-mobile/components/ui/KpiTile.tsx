import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { PJS } from "@/components/ui/typography";
import { useColors } from "@/hooks/useColors";

interface KpiTileProps {
  label: string;
  value: string | number;
  icon: React.ComponentProps<typeof Feather>["name"];
  tint: string;
  variant?: "plain" | "gradient";
  hint?: string;
  onPress?: () => void;
}

export function KpiTile({ label, value, icon, tint, variant = "plain", hint, onPress }: KpiTileProps) {
  const colors = useColors();

  const Body = (
    <>
      <View style={styles.headRow}>
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: variant === "gradient" ? "rgba(255,255,255,0.22)" : tint + "1A",
            },
          ]}
        >
          <Feather name={icon} size={18} color={variant === "gradient" ? "#ffffff" : tint} />
        </View>
        {hint ? (
          <Text
            style={{
              fontSize: 10,
              fontFamily: PJS.bold,
              color: variant === "gradient" ? "rgba(255,255,255,0.85)" : colors.mutedForeground,
              letterSpacing: 0.4,
              textTransform: "uppercase",
            }}
          >
            {hint}
          </Text>
        ) : null}
      </View>
      <Text
        numberOfLines={1}
        style={[
          styles.value,
          {
            color: variant === "gradient" ? "#ffffff" : colors.foreground,
            fontFamily: PJS.black,
          },
        ]}
      >
        {value}
      </Text>
      <Text
        numberOfLines={2}
        style={[
          styles.label,
          {
            color: variant === "gradient" ? "rgba(255,255,255,0.85)" : colors.mutedForeground,
            fontFamily: PJS.medium,
          },
        ]}
      >
        {label}
      </Text>
    </>
  );

  const inner =
    variant === "gradient" ? (
      <LinearGradient
        colors={[tint, shade(tint)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.tile, styles.gradientTile]}
      >
        {Body}
      </LinearGradient>
    ) : (
      <View
        style={[
          styles.tile,
          { backgroundColor: colors.card, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth },
        ]}
      >
        {Body}
      </View>
    );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [{ flex: 1, opacity: pressed ? 0.85 : 1 }]}>
        {inner}
      </Pressable>
    );
  }
  return <View style={{ flex: 1 }}>{inner}</View>;
}

function shade(hex: string): string {
  // Simple darker shade fallback
  const map: Record<string, string> = {
    "#2d753e": "#1f5a2e",
    "#e9850c": "#c66c08",
    "#3b82f6": "#2563eb",
    "#10b981": "#059669",
    "#f59e0b": "#d97706",
    "#8b5cf6": "#7c3aed",
    "#ef4444": "#dc2626",
    "#f97316": "#ea580c",
  };
  return map[hex.toLowerCase()] ?? hex;
}

const styles = StyleSheet.create({
  tile: {
    padding: 16,
    borderRadius: 18,
    minHeight: 110,
    ...Platform.select({
      ios: { shadowColor: "#1a1410", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 1 },
      web: { boxShadow: "0 4px 14px rgba(26, 20, 16, 0.05)" } as any,
      default: {},
    }),
  },
  gradientTile: {
    ...Platform.select({
      ios: { shadowColor: "#1a1410", shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 4 },
      web: { boxShadow: "0 12px 28px rgba(26, 20, 16, 0.18)" } as any,
      default: {},
    }),
  },
  headRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  iconBox: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  value: { fontSize: 22, letterSpacing: -0.4, marginBottom: 3 },
  label: { fontSize: 11, lineHeight: 14 },
});
