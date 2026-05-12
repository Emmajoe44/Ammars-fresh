import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { PJS } from "@/components/ui/typography";
import { useColors } from "@/hooks/useColors";

interface ProductCardProps {
  id: number;
  name: string;
  farmerName?: string | null;
  farmName?: string | null;
  priceSSP: number;
  priceUSD: number;
  quantity: number;
  unit: string;
  qualityGrade?: string;
  available: boolean;
  imageUrl?: string | null;
  currency?: "SSP" | "USD";
  onAddToCart?: () => void;
  onPress?: () => void;
}

function resolveImage(value?: string | null): string | null {
  if (!value) return null;
  if (value.startsWith("/objects/")) {
    const base = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : "";
    return `${base}/api/storage${value}`;
  }
  return value;
}

export function ProductCard({
  name, farmerName, farmName, priceSSP, priceUSD, quantity, unit,
  qualityGrade, available, imageUrl, currency = "SSP", onAddToCart, onPress,
}: ProductCardProps) {
  const colors = useColors();

  const gradeColor =
    qualityGrade === "A" ? colors.primary : qualityGrade === "B" ? colors.secondary : colors.mutedForeground;
  const price = currency === "USD" ? `$${Number(priceUSD).toFixed(2)}` : `SSP ${Number(priceSSP).toLocaleString()}`;

  const handleAddToCart = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAddToCart?.();
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}
    >
      <LinearGradient
        colors={[gradeColor + "26", gradeColor + "10"]}
        style={styles.imageBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {resolveImage(imageUrl) ? (
          <Image source={{ uri: resolveImage(imageUrl)! }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <Feather name="package" size={36} color={gradeColor} />
        )}
        {qualityGrade && (
          <View style={[styles.gradeTag, { backgroundColor: "#fff" }]}>
            <Text style={[styles.gradeText, { color: gradeColor, fontFamily: PJS.black }]}>
              {qualityGrade}
            </Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.body}>
        <Text style={[styles.name, { color: colors.foreground, fontFamily: PJS.bold }]} numberOfLines={2}>
          {name}
        </Text>
        <Text style={[styles.farmer, { color: colors.mutedForeground, fontFamily: PJS.medium }]} numberOfLines={1}>
          {farmName ?? farmerName ?? "Unknown farm"}
        </Text>

        <View style={styles.footer}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.price, { color: colors.foreground, fontFamily: PJS.black }]} numberOfLines={1}>
              {price}
            </Text>
            <Text style={[styles.unit, { color: colors.mutedForeground, fontFamily: PJS.medium }]} numberOfLines={1}>
              per {unit} · {quantity} left
            </Text>
          </View>

          {onAddToCart && available && (
            <Pressable
              onPress={handleAddToCart}
              style={({ pressed }) => [
                styles.addBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Feather name="plus" size={18} color="#fff" />
            </Pressable>
          )}
        </View>
      </View>

      {!available && (
        <View style={styles.unavailableOverlay}>
          <View style={[styles.unavailableBadge, { backgroundColor: colors.foreground }]}>
            <Text style={[styles.unavailableText, { color: colors.background, fontFamily: PJS.bold }]}>
              Out of stock
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#1a1410", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 1 },
      web: { boxShadow: "0 4px 14px rgba(26, 20, 16, 0.05)" } as any,
      default: {},
    }),
  },
  imageBg: {
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  gradeTag: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
      web: { boxShadow: "0 2px 6px rgba(0,0,0,0.12)" } as any,
      default: {},
    }),
  },
  gradeText: { fontSize: 12, letterSpacing: 0 },
  body: { padding: 12 },
  name: { fontSize: 14, lineHeight: 18, marginBottom: 2 },
  farmer: { fontSize: 11, marginBottom: 10 },
  footer: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 8 },
  price: { fontSize: 14, letterSpacing: -0.2 },
  unit: { fontSize: 10, marginTop: 2 },
  addBtn: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: "#1f5a2e", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 3 },
      web: { boxShadow: "0 4px 10px rgba(31, 90, 46, 0.3)" } as any,
      default: {},
    }),
  },
  unavailableOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  unavailableBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  unavailableText: { fontSize: 11, letterSpacing: 0.4, textTransform: "uppercase" },
});
