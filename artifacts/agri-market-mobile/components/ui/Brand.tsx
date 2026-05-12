import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { PJS } from "@/components/ui/typography";
import { useColors } from "@/hooks/useColors";

interface BrandProps {
  size?: "sm" | "md" | "lg";
  showTag?: boolean;
  inverted?: boolean;
}

export function Brand({ size = "md", showTag = false, inverted = false }: BrandProps) {
  const colors = useColors();
  const dim = size === "sm" ? 32 : size === "md" ? 40 : 56;
  const titleSize = size === "sm" ? 16 : size === "md" ? 20 : 26;
  const tagSize = size === "sm" ? 9 : size === "md" ? 10 : 11;
  const titleColor = inverted ? "#ffffff" : colors.foreground;
  const tagColor = inverted ? "rgba(255,255,255,0.85)" : colors.primary;

  return (
    <View style={styles.row}>
      <LinearGradient
        colors={[colors.primary, "#1f5a2e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.logo, { width: dim, height: dim, borderRadius: dim * 0.32 }]}
      >
        <MaterialCommunityIcons name="leaf" size={dim * 0.55} color="#fff" />
      </LinearGradient>
      <View>
        <Text style={[styles.title, { color: titleColor, fontSize: titleSize, fontFamily: PJS.black }]}>
          AgriMarket
        </Text>
        {showTag && (
          <Text style={[styles.tag, { color: tagColor, fontSize: tagSize, fontFamily: PJS.bold }]}>
            SOUTH SUDAN
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: {
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: "#1f5a2e", shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 4 },
      web: { boxShadow: "0 8px 24px rgba(31, 90, 46, 0.25)" } as any,
      default: {},
    }),
  },
  title: { letterSpacing: -0.5, lineHeight: undefined },
  tag: { letterSpacing: 1.5, marginTop: 1 },
});
