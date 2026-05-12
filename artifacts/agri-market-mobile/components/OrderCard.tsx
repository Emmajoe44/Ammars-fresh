import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type OrderStatus = "pending" | "confirmed" | "assigned" | "in_transit" | "delivered" | "cancelled";

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ComponentProps<typeof Feather>["name"]; color: string }> = {
  pending: { label: "Pending", icon: "clock", color: "#f59e0b" },
  confirmed: { label: "Confirmed", icon: "check-circle", color: "#3b82f6" },
  assigned: { label: "Assigned", icon: "truck", color: "#8b5cf6" },
  in_transit: { label: "In Transit", icon: "navigation", color: "#f97316" },
  delivered: { label: "Delivered", icon: "package", color: "#10b981" },
  cancelled: { label: "Cancelled", icon: "x-circle", color: "#ef4444" },
};

interface OrderCardProps {
  id: number;
  status: string;
  deliveryLocation?: string | null;
  totalSSP: number;
  totalUSD: number;
  itemCount: number;
  createdAt: string;
  currency?: "SSP" | "USD";
  truckPlate?: string | null;
  onPress?: () => void;
}

export function OrderCard({
  id,
  status,
  deliveryLocation,
  totalSSP,
  totalUSD,
  itemCount,
  createdAt,
  currency = "SSP",
  truckPlate,
  onPress,
}: OrderCardProps) {
  const colors = useColors();
  const cfg = STATUS_CONFIG[status as OrderStatus] ?? STATUS_CONFIG.pending;
  const price = currency === "USD" ? `$${Number(totalUSD).toFixed(2)}` : `SSP ${Number(totalSSP).toLocaleString()}`;
  const date = new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed && onPress ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.orderId, { color: colors.foreground }]}>Order #{id}</Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>{date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg.color + "1A" }]}>
          <Feather name={cfg.icon} size={12} color={cfg.color} />
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.metaRow}>
          <Feather name="map-pin" size={13} color={colors.mutedForeground} />
          <Text style={[styles.metaTxt, { color: colors.mutedForeground }]} numberOfLines={1}>
            {deliveryLocation ?? "No address"}
          </Text>
        </View>
        {truckPlate ? (
          <View style={styles.metaRow}>
            <Feather name="truck" size={13} color={colors.mutedForeground} />
            <Text style={[styles.metaTxt, { color: colors.mutedForeground }]} numberOfLines={1}>
              {truckPlate}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.items, { color: colors.mutedForeground }]}>
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </Text>
        <Text style={[styles.total, { color: colors.primary }]}>{price}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: "#1a1410", shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 1 },
      web: { boxShadow: "0 2px 10px rgba(26, 20, 16, 0.04)" } as any,
      default: {},
    }),
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  orderId: { fontSize: 15, fontWeight: "800", letterSpacing: -0.2 },
  date: { fontSize: 12, marginTop: 2 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: "700" },
  body: { gap: 4, marginBottom: 12 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaTxt: { fontSize: 12 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10 },
  items: { fontSize: 13 },
  total: { fontSize: 16, fontWeight: "800", fontVariant: ["tabular-nums"] },
});
