import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { getGetOrderQueryKey, useGetOrder } from "@workspace/api-client-react";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

type Status = "pending" | "confirmed" | "assigned" | "in_transit" | "delivered" | "cancelled";

const STATUS_FLOW: { value: Status; label: string; icon: React.ComponentProps<typeof Feather>["name"]; description: string }[] = [
  { value: "pending", label: "Order placed", icon: "clock", description: "Waiting for confirmation" },
  { value: "confirmed", label: "Confirmed", icon: "check-circle", description: "Farmer accepted your order" },
  { value: "assigned", label: "Truck assigned", icon: "truck", description: "Vehicle dispatched" },
  { value: "in_transit", label: "On the way", icon: "navigation", description: "Heading to your location" },
  { value: "delivered", label: "Delivered", icon: "package", description: "Order completed" },
];

export default function RetailerOrderDetail() {
  const colors = useColors();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Number(params.id ?? 0);
  const { currency } = useAuth();
  const { data: order, isLoading } = useGetOrder(id, {
    query: { enabled: id > 0, queryKey: getGetOrderQueryKey(id) },
  });

  if (isLoading || !order) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const status = order.status as Status;
  const cancelled = status === "cancelled";
  const items: any[] = Array.isArray(order.items) ? order.items : [];
  const total = currency === "USD" ? `$${Number(order.totalUSD ?? 0).toFixed(2)}` : `SSP ${Number(order.totalSSP ?? 0).toLocaleString()}`;
  const stepIndex = STATUS_FLOW.findIndex((s) => s.value === status);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={`Order #${order.id}`}
        subtitle={new Date(order.createdAt).toLocaleString()}
        showBack
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {cancelled ? (
          <View style={[styles.cancelled, { backgroundColor: colors.destructive + "12", borderColor: colors.destructive + "40" }]}>
            <Feather name="x-circle" size={20} color={colors.destructive} />
            <Text style={[styles.cancelledTxt, { color: colors.destructive }]}>This order was cancelled</Text>
          </View>
        ) : (
          <Card>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Delivery tracking</Text>
            <View style={{ marginTop: 8 }}>
              {STATUS_FLOW.map((step, i) => {
                const reached = i <= stepIndex;
                const current = i === stepIndex;
                return (
                  <View key={step.value} style={styles.timelineRow}>
                    <View style={styles.timelineCol}>
                      <View
                        style={[
                          styles.timelineDot,
                          {
                            backgroundColor: reached ? colors.primary : colors.muted,
                            borderColor: current ? colors.primary : "transparent",
                          },
                        ]}
                      >
                        <Feather name={step.icon} size={14} color={reached ? "#fff" : colors.mutedForeground} />
                      </View>
                      {i < STATUS_FLOW.length - 1 && (
                        <View
                          style={[
                            styles.timelineLine,
                            { backgroundColor: i < stepIndex ? colors.primary : colors.border },
                          ]}
                        />
                      )}
                    </View>
                    <View style={{ flex: 1, paddingBottom: 18 }}>
                      <Text style={[styles.timelineLbl, { color: reached ? colors.foreground : colors.mutedForeground, fontWeight: current ? "800" : "600" }]}>
                        {step.label}
                      </Text>
                      <Text style={[styles.timelineDesc, { color: colors.mutedForeground }]}>
                        {step.description}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>
        )}

        <Text style={[styles.section, { color: colors.mutedForeground }]}>Delivery</Text>
        <Card>
          <View style={styles.row}>
            <Feather name="map-pin" size={16} color={colors.mutedForeground} />
            <Text style={[styles.rowTxt, { color: colors.foreground }]} numberOfLines={2}>
              {order.deliveryLocation ?? "—"}
            </Text>
          </View>
          {order.truckPlate ? (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.row}>
                <Feather name="truck" size={16} color={colors.primary} />
                <Text style={[styles.rowTxt, { color: colors.foreground, fontWeight: "700" }]}>
                  Truck {order.truckPlate}
                </Text>
              </View>
              {order.driverName ? (
                <View style={styles.row}>
                  <Feather name="user" size={16} color={colors.mutedForeground} />
                  <Text style={[styles.rowTxt, { color: colors.foreground }]}>{order.driverName}</Text>
                </View>
              ) : null}
            </>
          ) : null}
        </Card>

        <Text style={[styles.section, { color: colors.mutedForeground }]}>Items</Text>
        <Card padded={false}>
          {items.map((item, i) => (
            <View key={i}>
              <View style={styles.itemRow}>
                <View style={[styles.itemIcon, { backgroundColor: colors.primary + "1A" }]}>
                  <Feather name="package" size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemName, { color: colors.foreground }]} numberOfLines={1}>
                    {item.name ?? item.productName}
                  </Text>
                  <Text style={[styles.itemMeta, { color: colors.mutedForeground }]}>
                    {item.quantity} × {currency === "USD" ? `$${Number(item.priceUSD ?? 0).toFixed(2)}` : `SSP ${Number(item.priceSSP ?? 0).toLocaleString()}`}
                  </Text>
                </View>
                <Text style={[styles.itemTotal, { color: colors.primary }]}>
                  {currency === "USD"
                    ? `$${(Number(item.priceUSD ?? 0) * Number(item.quantity ?? 0)).toFixed(2)}`
                    : `SSP ${(Number(item.priceSSP ?? 0) * Number(item.quantity ?? 0)).toLocaleString()}`}
                </Text>
              </View>
              {i < items.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border, marginHorizontal: 14 }]} />}
            </View>
          ))}
          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLbl, { color: colors.foreground }]}>Total</Text>
            <Text style={[styles.totalVal, { color: colors.primary }]}>{total}</Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 14, fontWeight: "800", letterSpacing: -0.2 },
  timelineRow: { flexDirection: "row", gap: 12 },
  timelineCol: { width: 28, alignItems: "center" },
  timelineDot: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  timelineLine: { width: 2, flex: 1, marginTop: 2 },
  timelineLbl: { fontSize: 14 },
  timelineDesc: { fontSize: 12, marginTop: 2 },
  cancelled: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth },
  cancelledTxt: { fontSize: 14, fontWeight: "700" },
  section: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 18, marginBottom: 8, marginLeft: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  rowTxt: { flex: 1, fontSize: 14 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 4 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  itemIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  itemName: { fontSize: 14, fontWeight: "600" },
  itemMeta: { fontSize: 12, marginTop: 2 },
  itemTotal: { fontSize: 14, fontWeight: "800", fontVariant: ["tabular-nums"] },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
  totalLbl: { fontSize: 14, fontWeight: "700" },
  totalVal: { fontSize: 18, fontWeight: "800", fontVariant: ["tabular-nums"] },
});
