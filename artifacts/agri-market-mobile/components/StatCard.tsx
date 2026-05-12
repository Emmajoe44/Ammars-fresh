import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  accent?: boolean;
  warning?: boolean;
}

export function StatCard({ label, value, icon, accent, warning }: StatCardProps) {
  const colors = useColors();
  const iconColor = warning ? colors.warning : accent ? colors.secondary : colors.primary;
  const bgColor = warning
    ? colors.warning + "15"
    : accent
    ? colors.secondary + "15"
    : colors.primary + "15";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: bgColor, borderRadius: colors.radius / 2 }]}>
        <Feather name={icon as any} size={20} color={iconColor} />
      </View>
      <Text style={[styles.value, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    margin: 6,
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  value: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
  },
});
