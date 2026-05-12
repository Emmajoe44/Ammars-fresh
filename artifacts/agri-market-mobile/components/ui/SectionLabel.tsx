import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PJS } from "@/components/ui/typography";
import { useColors } from "@/hooks/useColors";

interface SectionLabelProps {
  label: string;
  action?: { label: string; onPress: () => void };
  style?: object;
}

export function SectionLabel({ label, action, style }: SectionLabelProps) {
  const colors = useColors();
  return (
    <View style={[styles.row, style]}>
      <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: PJS.bold }]}>
        {label}
      </Text>
      {action && (
        <Pressable onPress={action.onPress} hitSlop={6}>
          <Text style={[styles.action, { color: colors.primary, fontFamily: PJS.bold }]}>
            {action.label} →
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 22,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  label: { fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase" },
  action: { fontSize: 12, letterSpacing: 0.2 },
});
