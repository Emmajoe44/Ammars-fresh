import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { PJS } from "@/components/ui/typography";
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
  id, status, deliveryLocation, totalSSP, totalUSD, itemCount, createdAt,
  currency = "SSP", truckPlate, onPress,
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
          opacity: pressed && onPress ? 0.92 : 1,
          transform: [{ scale: pressed && onPress ? 0.995 : 1 }],
        },
      ]}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.idRow}>
            <View style={[styles.idBadge, { backgroundColor: colors.primary + "12" }]}>
              <Feather name="hash" size={11} color={colors.primary} />
              <Text style={[styles.orderId, { color: colors.primary, fontFamily: PJS.black }]}>{id}</Text>
            </View>
            <Text style={[styles.date, { color: colors.mutedForeground, fontFamily: PJS.medium }]}>{date}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg.color + "18" }]}>
          <View style={[styles.statusDot, { backgroundColor: cfg.color }]} />
          <Text style={[styles.statusText, { color: cfg.color, fontFamily: PJS.bold }]}>{cfg.label}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.metaRow}>
          <Feather name="map-pin" size={13} color={colors.mutedForeground} />
          <Text style={[styles.metaTxt, { color: colors.foreground, fontFamily: PJS.medium }]} numberOfLines={1}>
            {deliveryLocation ?? "No address"}
          </Text>
        </View>
        {truckPlate ? (
          <View style={styles.metaRow}>
            <Feather name="truck" size={13} color={colors.mutedForeground} />
            <Text style={[styles.metaTxt, { color: colors.mutedForeground, fontFamily: PJS.semibold }]} numberOfLines={1}>
              {truckPlate}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.itemsRow}>
          <Feather name="package" size={12} color={colors.mutedForeground} />
          <Text style={[styles.items, { color: colors.mutedForeground, fontFamily: PJS.semibold }]}>
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </Text>
        </View>
        <Text style={[styles.total, { color: colors.foreground, fontFamily: PJS.black }]}>{price}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: "#1a1410", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 1 },
      web: { boxShadow: "0 4px 14px rgba(26, 20, 16, 0.05)" } as any,
      default: {},
    }),
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  idRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  idBadge: { flexDirection: "row", alignItems: "center", gap: 2, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  orderId: { fontSize: 13, letterSpacing: -0.2 },
  date: { fontSize: 12 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, letterSpacing: 0.2 },
  body: { gap: 5, marginBottom: 12 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  metaTxt: { fontSize: 12.5, flex: 1 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12 },
  itemsRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  items: { fontSize: 12.5 },
  total: { fontSize: 17, letterSpacing: -0.3 },
});
