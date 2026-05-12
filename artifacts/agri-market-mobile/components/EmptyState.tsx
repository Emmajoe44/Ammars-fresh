import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PJS } from "@/components/ui/typography";
import { useColors } from "@/hooks/useColors";

interface EmptyStateProps {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  description?: string;
  action?: { label: string; onPress: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const colors = useColors();
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconRing, { borderColor: colors.primary + "26" }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primary + "12" }]}>
          <Feather name={icon} size={28} color={colors.primary} />
        </View>
      </View>
      <Text style={[styles.title, { color: colors.foreground, fontFamily: PJS.bold }]}>{title}</Text>
      {description ? (
        <Text style={[styles.desc, { color: colors.mutedForeground, fontFamily: PJS.medium }]}>
          {description}
        </Text>
      ) : null}
      {action && (
        <Pressable
          onPress={action.onPress}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[styles.ctaTxt, { fontFamily: PJS.bold }]}>{action.label}</Text>
          <Feather name="arrow-right" size={14} color="#fff" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", paddingVertical: 56, paddingHorizontal: 32, gap: 10 },
  iconRing: {
    width: 84, height: 84, borderRadius: 42, alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, marginBottom: 8,
  },
  iconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 17, letterSpacing: -0.3 },
  desc: { fontSize: 13, textAlign: "center", lineHeight: 19, maxWidth: 280 },
  cta: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginTop: 14, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 12,
  },
  ctaTxt: { color: "#fff", fontSize: 14 },
});
