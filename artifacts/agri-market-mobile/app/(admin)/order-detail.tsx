import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import {
  getGetOrderQueryKey,
  getListOrdersQueryKey,
  useAssignTruckToOrder,
  useGetOrder,
  useListTrucks,
  useUpdateOrder,
} from "@workspace/api-client-react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

type Status = "pending" | "confirmed" | "assigned" | "in_transit" | "delivered" | "cancelled";

const STATUS_FLOW: { value: Status; label: string; icon: React.ComponentProps<typeof Feather>["name"] }[] = [
  { value: "pending", label: "Pending", icon: "clock" },
  { value: "confirmed", label: "Confirmed", icon: "check-circle" },
  { value: "assigned", label: "Assigned", icon: "truck" },
  { value: "in_transit", label: "In transit", icon: "navigation" },
  { value: "delivered", label: "Delivered", icon: "package" },
];

export default function AdminOrderDetail() {
  const colors = useColors();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Number(params.id ?? 0);
  const { currency } = useAuth();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useGetOrder(id, {
    query: { enabled: id > 0, queryKey: getGetOrderQueryKey(id) },
  });
  const { data: trucks } = useListTrucks();
  const updateMutation = useUpdateOrder();
  const assignMutation = useAssignTruckToOrder();

  const [showAssign, setShowAssign] = useState(false);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(id) });
    queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
  };

  const setStatus = async (status: Status) => {
    try {
      await updateMutation.mutateAsync({ id, data: { status } });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      refresh();
    } catch {
      Alert.alert("Failed", "Could not update order.");
    }
  };

  const setPayment = async (paymentStatus: "paid" | "unpaid") => {
    try {
      await updateMutation.mutateAsync({ id, data: { paymentStatus } as any });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      refresh();
    } catch {
      Alert.alert("Failed", "Could not update payment status.");
    }
  };

  const assign = async (truckId: number) => {
    try {
      await assignMutation.mutateAsync({ id, data: { truckId } });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      refresh();
      setShowAssign(false);
    } catch {
      Alert.alert("Failed", "Could not assign truck.");
    }
  };

  if (isLoading || !order) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const status = order.status as Status;
  const items: any[] = Array.isArray(order.items) ? order.items : [];
  const total = currency === "USD" ? `$${Number(order.totalUSD ?? 0).toFixed(2)}` : `SSP ${Number(order.totalSSP ?? 0).toLocaleString()}`;
  const stepIndex = STATUS_FLOW.findIndex((s) => s.value === status);
  const availableTrucks = (trucks ?? []).filter((t) => t.status === "available" || t.id === order.truckId);
  const isPaid = (order as any).paymentStatus === "paid";
  const paidAt = (order as any).paidAt as string | null | undefined;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title={`Order #${order.id}`} subtitle={new Date(order.createdAt).toLocaleString()} showBack />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Status tracker */}
        <Card>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Delivery progress</Text>
          <View style={styles.tracker}>
            {STATUS_FLOW.map((step, i) => {
              const reached = i <= stepIndex;
              return (
                <View key={step.value} style={styles.trackStep}>
                  <View style={styles.trackTop}>
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: reached ? colors.primary : colors.muted },
                      ]}
                    >
                      <Feather name={step.icon} size={14} color={reached ? "#fff" : colors.mutedForeground} />
                    </View>
                    {i < STATUS_FLOW.length - 1 && (
                      <View
                        style={[
                          styles.connector,
                          { backgroundColor: i < stepIndex ? colors.primary : colors.muted },
                        ]}
                      />
                    )}
                  </View>
                  <Text style={[styles.stepLbl, { color: reached ? colors.foreground : colors.mutedForeground }]} numberOfLines={1}>
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Payment status */}
        <Text style={[styles.section, { color: colors.mutedForeground }]}>Payment</Text>
        <Card>
          <View style={styles.payRow}>
            <View
              style={[
                styles.payBadge,
                { backgroundColor: isPaid ? colors.primary : colors.warning },
              ]}
            >
              <Feather name={isPaid ? "check-circle" : "alert-circle"} size={16} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.payTitle, { color: colors.foreground }]}>
                {isPaid ? "Payment received" : "Payment pending"}
              </Text>
              <Text style={[styles.paySub, { color: colors.mutedForeground }]} numberOfLines={1}>
                {isPaid && paidAt
                  ? `Paid · ${new Date(paidAt).toLocaleString()}`
                  : "Receipt unlocks once payment is confirmed"}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => setPayment(isPaid ? "unpaid" : "paid")}
            disabled={updateMutation.isPending}
            style={[
              styles.payBtn,
              {
                backgroundColor: isPaid ? colors.muted : colors.primary,
              },
            ]}
          >
            <Feather
              name={isPaid ? "rotate-ccw" : "check"}
              size={14}
              color={isPaid ? colors.foreground : "#fff"}
            />
            <Text
              style={[
                styles.payBtnTxt,
                { color: isPaid ? colors.foreground : "#fff" },
              ]}
            >
              {isPaid ? "Mark as unpaid" : "Confirm payment"}
            </Text>
          </Pressable>
        </Card>

        {/* Customer */}
        <Text style={[styles.section, { color: colors.mutedForeground }]}>Customer</Text>
        <Card>
          <View style={styles.row}>
            <Feather name="user" size={16} color={colors.mutedForeground} />
            <Text style={[styles.rowTxt, { color: colors.foreground }]}>{order.retailerName ?? "—"}</Text>
          </View>
          <View style={styles.row}>
            <Feather name="map-pin" size={16} color={colors.mutedForeground} />
            <Text style={[styles.rowTxt, { color: colors.foreground }]} numberOfLines={2}>
              {order.deliveryLocation ?? "No address"}
            </Text>
          </View>
          {order.deliveryLat != null && order.deliveryLng != null ? (
            <View style={styles.row}>
              <Feather name="navigation" size={16} color={colors.mutedForeground} />
              <Text style={[styles.rowTxt, { color: colors.mutedForeground }]}>
                {Number(order.deliveryLat).toFixed(4)}, {Number(order.deliveryLng).toFixed(4)}
              </Text>
            </View>
          ) : null}
        </Card>

        {/* Truck */}
        <Text style={[styles.section, { color: colors.mutedForeground }]}>Delivery truck</Text>
        <Card>
          {order.truckId ? (
            <>
              <View style={styles.row}>
                <Feather name="truck" size={16} color={colors.primary} />
                <Text style={[styles.rowTxt, { color: colors.foreground, fontWeight: "700" }]}>{order.truckPlate}</Text>
              </View>
              <View style={styles.row}>
                <Feather name="user" size={16} color={colors.mutedForeground} />
                <Text style={[styles.rowTxt, { color: colors.foreground }]}>{order.driverName ?? "—"}</Text>
              </View>
              <Pressable
                onPress={() => setShowAssign(true)}
                style={[styles.linkBtn, { backgroundColor: colors.muted }]}
              >
                <Feather name="repeat" size={14} color={colors.foreground} />
                <Text style={[styles.linkTxt, { color: colors.foreground }]}>Reassign truck</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={() => setShowAssign(true)}
              style={[styles.assignBtn, { backgroundColor: colors.primary }]}
            >
              <Feather name="truck" size={16} color="#fff" />
              <Text style={styles.assignTxt}>Assign truck</Text>
            </Pressable>
          )}
        </Card>

        {/* Items */}
        <Text style={[styles.section, { color: colors.mutedForeground }]}>{items.length} items · {total}</Text>
        <Card padded={false}>
          {items.map((item, i) => (
            <View key={i}>
              <View style={styles.itemRow}>
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
              {i < items.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            </View>
          ))}
        </Card>

        {/* Status actions */}
        <Text style={[styles.section, { color: colors.mutedForeground }]}>Update status</Text>
        <View style={styles.statusGrid}>
          {STATUS_FLOW.map((s) => {
            const active = s.value === status;
            return (
              <Pressable
                key={s.value}
                onPress={() => setStatus(s.value)}
                disabled={active || updateMutation.isPending}
                style={[
                  styles.statusBtn,
                  {
                    backgroundColor: active ? colors.primary : colors.card,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Feather name={s.icon} size={14} color={active ? "#fff" : colors.foreground} />
                <Text style={[styles.statusBtnTxt, { color: active ? "#fff" : colors.foreground }]}>{s.label}</Text>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() =>
              Alert.alert("Cancel order", "Are you sure?", [
                { text: "No", style: "cancel" },
                { text: "Yes, cancel", style: "destructive", onPress: () => setStatus("cancelled") },
              ])
            }
            disabled={status === "cancelled" || updateMutation.isPending}
            style={[styles.statusBtn, { backgroundColor: colors.destructive + "10", borderColor: colors.destructive + "40" }]}
          >
            <Feather name="x-circle" size={14} color={colors.destructive} />
            <Text style={[styles.statusBtnTxt, { color: colors.destructive }]}>Cancel order</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={showAssign} animationType="slide" transparent onRequestClose={() => setShowAssign(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setShowAssign(false)} />
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Assign truck</Text>
            <Text style={[styles.sheetSub, { color: colors.mutedForeground }]}>Choose an available truck</Text>
            <ScrollView style={{ marginTop: 16, maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              {availableTrucks.length === 0 ? (
                <Text style={[styles.empty, { color: colors.mutedForeground }]}>
                  No available trucks. Free up a truck or add a new one.
                </Text>
              ) : (
                availableTrucks.map((t) => (
                  <Pressable
                    key={t.id}
                    onPress={() => assign(t.id)}
                    disabled={assignMutation.isPending}
                    style={({ pressed }) => [
                      styles.truckOpt,
                      { backgroundColor: pressed ? colors.muted : "transparent", borderColor: colors.border },
                    ]}
                  >
                    <View style={[styles.truckIcon, { backgroundColor: colors.primary + "1A" }]}>
                      <Feather name="truck" size={18} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.truckPlate, { color: colors.foreground }]}>{t.plateNumber}</Text>
                      <Text style={[styles.truckMeta, { color: colors.mutedForeground }]}>
                        {t.driverName} · {t.driverPhone}
                      </Text>
                    </View>
                    {t.id === order.truckId && (
                      <Feather name="check-circle" size={18} color={colors.primary} />
                    )}
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 14, fontWeight: "700", marginBottom: 16 },
  tracker: { flexDirection: "row", justifyContent: "space-between" },
  trackStep: { flex: 1, alignItems: "center", gap: 6 },
  trackTop: { width: "100%", flexDirection: "row", alignItems: "center" },
  dot: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  connector: { flex: 1, height: 2, marginHorizontal: 2 },
  stepLbl: { fontSize: 10, fontWeight: "600", textAlign: "center" },
  section: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 18, marginBottom: 8, marginLeft: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 5 },
  rowTxt: { flex: 1, fontSize: 14 },
  linkBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 10, paddingVertical: 9, borderRadius: 10 },
  linkTxt: { fontSize: 13, fontWeight: "600" },
  assignBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 10 },
  assignTxt: { color: "#fff", fontSize: 14, fontWeight: "700" },
  itemRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  itemName: { fontSize: 14, fontWeight: "600" },
  itemMeta: { fontSize: 12, marginTop: 2 },
  itemTotal: { fontSize: 14, fontWeight: "800", fontVariant: ["tabular-nums"] },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 14 },
  statusGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statusBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth },
  statusBtnTxt: { fontSize: 13, fontWeight: "700" },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32, maxHeight: "80%" },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  sheetSub: { fontSize: 13, marginTop: 4 },
  empty: { fontSize: 14, textAlign: "center", padding: 24 },
  truckOpt: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, marginBottom: 8 },
  truckIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  truckPlate: { fontSize: 14, fontWeight: "700", letterSpacing: 0.5, fontVariant: ["tabular-nums"] },
  truckMeta: { fontSize: 12, marginTop: 2 },
  payRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  payBadge: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  payTitle: { fontSize: 14, fontWeight: "700" },
  paySub: { fontSize: 12, marginTop: 2 },
  payBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, paddingVertical: 10, borderRadius: 10 },
  payBtnTxt: { fontSize: 13, fontWeight: "700" },
});
