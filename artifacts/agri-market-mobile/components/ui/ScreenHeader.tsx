import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PJS } from "@/components/ui/typography";
import { useColors } from "@/hooks/useColors";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  showBack?: boolean;
  right?: React.ReactNode;
  variant?: "plain" | "gradient";
}

export function ScreenHeader({
  title,
  subtitle,
  eyebrow,
  showBack,
  right,
  variant = "plain",
}: ScreenHeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 67 : insets.top + 8;

  const inverted = variant === "gradient";
  const titleColor = inverted ? "#ffffff" : colors.foreground;
  const subtitleColor = inverted ? "rgba(255,255,255,0.85)" : colors.mutedForeground;
  const eyebrowColor = inverted ? "rgba(255,255,255,0.95)" : colors.primary;
  const iconBtnBg = inverted ? "rgba(255,255,255,0.18)" : colors.muted;
  const iconColor = inverted ? "#ffffff" : colors.foreground;

  const Body = (
    <View style={[styles.body, { paddingTop: topPad, paddingBottom: variant === "gradient" ? 24 : 14 }]}>
      <View style={styles.row}>
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.iconBtn,
              { backgroundColor: iconBtnBg, opacity: pressed ? 0.65 : 1 },
            ]}
            hitSlop={8}
          >
            <Feather name="chevron-left" size={20} color={iconColor} />
          </Pressable>
        )}
        <View style={{ flex: 1, minWidth: 0 }}>
          {eyebrow && (
            <View style={styles.eyebrowRow}>
              <Feather name="zap" size={12} color={eyebrowColor} />
              <Text style={[styles.eyebrow, { color: eyebrowColor, fontFamily: PJS.bold }]}>
                {eyebrow}
              </Text>
            </View>
          )}
          <Text
            numberOfLines={1}
            style={[styles.title, { color: titleColor, fontFamily: PJS.black }]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              numberOfLines={1}
              style={[styles.subtitle, { color: subtitleColor, fontFamily: PJS.medium }]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right ? <View>{right}</View> : null}
      </View>
    </View>
  );

  if (variant === "gradient") {
    return (
      <LinearGradient
        colors={[colors.primary, "#1f5a2e", "#163d20"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {Body}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.plain, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      {Body}
    </View>
  );
}

const styles = StyleSheet.create({
  plain: { borderBottomWidth: StyleSheet.hairlineWidth },
  gradient: {},
  body: { paddingHorizontal: 20 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 4 },
  eyebrow: { fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase" },
  title: { fontSize: 24, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, marginTop: 3 },
});
