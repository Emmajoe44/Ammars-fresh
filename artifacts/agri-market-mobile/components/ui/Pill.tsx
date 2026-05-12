import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PJS } from "@/components/ui/typography";

interface PillProps {
  label: string;
  color: string;
  icon?: React.ComponentProps<typeof Feather>["name"];
  size?: "sm" | "md";
  dot?: boolean;
}

export function Pill({ label, color, icon, size = "md", dot = false }: PillProps) {
  const fontSize = size === "sm" ? 10 : 11;
  const padH = size === "sm" ? 8 : 10;
  const padV = size === "sm" ? 3 : 5;
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: color + "1A", paddingHorizontal: padH, paddingVertical: padV },
      ]}
    >
      {dot && <View style={[styles.dot, { backgroundColor: color }]} />}
      {icon && <Feather name={icon} size={fontSize + 1} color={color} />}
      <Text style={[styles.txt, { color, fontSize, fontFamily: PJS.bold }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 999, alignSelf: "flex-start" },
  dot: { width: 6, height: 6, borderRadius: 3 },
  txt: { letterSpacing: 0.2 },
});
