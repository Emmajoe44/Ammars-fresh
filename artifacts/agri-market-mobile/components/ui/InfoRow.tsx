import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PJS } from "@/components/ui/typography";
import { useColors } from "@/hooks/useColors";

interface InfoRowProps {
  icon: React.ComponentProps<typeof Feather>["name"];
  label?: string;
  value: string;
  tint?: string;
}

export function InfoRow({ icon, label, value, tint }: InfoRowProps) {
  const colors = useColors();
  const accent = tint ?? colors.primary;
  return (
    <View style={styles.row}>
      <View style={[styles.iconBox, { backgroundColor: accent + "16" }]}>
        <Feather name={icon} size={14} color={accent} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        {label && (
          <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: PJS.semibold }]}>
            {label}
          </Text>
        )}
        <Text style={[styles.value, { color: colors.foreground, fontFamily: PJS.semibold }]} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6 },
  iconBox: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  value: { fontSize: 14 },
});
