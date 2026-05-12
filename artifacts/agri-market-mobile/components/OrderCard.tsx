import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

type OrderStatus = "pending" | "confirmed" | "assigned" | "in_transit" | "delivered" | "cancelled";

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: string; color: string }> = {
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
}: OrderCardProps) {
  const colors = useColors();
  const cfg = STATUS_CONFIG[status as OrderStatus] ?? STATUS_CONFIG.pending;
  const price = currency === "USD" ? `$${totalUSD.toFixed(2)}` : `SSP ${totalSSP.toLocaleString()}`;
  const date = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

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
      <View style={styles.header}>
        <View>
          <Text style={[styles.orderId, { color: colors.mutedForeground }]}>Order #{id}</Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>{date}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: cfg.color + "18", borderRadius: colors.radius / 2 },
          ]}
        >
          <Feather name={cfg.icon as any} size={13} color={cfg.color} />
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <Text style={[styles.address, { color: colors.foreground }]} numberOfLines={1}>
        <Feather name="map-pin" size={12} color={colors.mutedForeground} /> {deliveryLocation ?? "No address"}
      </Text>

      <View style={styles.footer}>
        <Text style={[styles.items, { color: colors.mutedForeground }]}>
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </Text>
        <Text style={[styles.total, { color: colors.primary }]}>{price}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 13,
    fontWeight: "600",
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  address: {
    fontSize: 13,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  items: {
    fontSize: 13,
  },
  total: {
    fontSize: 16,
    fontWeight: "700",
  },
});
