import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
  currency?: "SSP" | "USD";
  onAddToCart?: () => void;
  onPress?: () => void;
}

export function ProductCard({
  name,
  farmerName,
  farmName,
  priceSSP,
  priceUSD,
  quantity,
  unit,
  qualityGrade,
  available,
  currency = "SSP",
  onAddToCart,
  onPress,
}: ProductCardProps) {
  const colors = useColors();

  const gradeColor =
    qualityGrade === "A" ? colors.primary : qualityGrade === "B" ? colors.secondary : colors.mutedForeground;
  const price = currency === "USD" ? `$${priceUSD.toFixed(2)}` : `SSP ${priceSSP.toLocaleString()}`;

  const handleAddToCart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
          borderRadius: colors.radius,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View
        style={[styles.gradeTag, { backgroundColor: gradeColor + "20", borderRadius: colors.radius / 2 }]}
      >
        <Text style={[styles.gradeText, { color: gradeColor }]}>Grade {qualityGrade}</Text>
      </View>

      <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={2}>
        {name}
      </Text>

      <Text style={[styles.farmer, { color: colors.mutedForeground }]} numberOfLines={1}>
        {farmName ?? farmerName ?? "Unknown Farm"}
      </Text>

      <View style={styles.footer}>
        <View>
          <Text style={[styles.price, { color: colors.primary }]}>{price}</Text>
          <Text style={[styles.unit, { color: colors.mutedForeground }]}>
            per {unit} · {quantity} available
          </Text>
        </View>

        {onAddToCart && available && (
          <Pressable
            onPress={handleAddToCart}
            style={[styles.addBtn, { backgroundColor: colors.primary, borderRadius: colors.radius / 2 }]}
          >
            <Feather name="plus" size={18} color="#fff" />
          </Pressable>
        )}
      </View>

      {!available && (
        <View style={[styles.unavailableOverlay, { borderRadius: colors.radius }]}>
          <Text style={[styles.unavailableText, { color: colors.mutedForeground }]}>Out of Stock</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 6,
    padding: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  gradeTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  gradeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
    lineHeight: 20,
  },
  farmer: {
    fontSize: 12,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
  },
  unit: {
    fontSize: 11,
    marginTop: 2,
  },
  addBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  unavailableOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  unavailableText: {
    fontWeight: "600",
    fontSize: 13,
  },
});
