import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  getListTrucksQueryKey,
  useCreateTruck,
  useListTrucks,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Header } from "@/components/Header";
import { useColors } from "@/hooks/useColors";

type Status = "available" | "in_transit" | "maintenance";

const STATUS_META: Record<Status, { label: string; color: string; icon: React.ComponentProps<typeof Feather>["name"] }> = {
  available: { label: "Available", color: "#10b981", icon: "check-circle" },
  in_transit: { label: "In Transit", color: "#f97316", icon: "navigation" },
  maintenance: { label: "Maintenance", color: "#ef4444", icon: "tool" },
};

export default function AdminTrucks() {
  const colors = useColors();
  const queryClient = useQueryClient();
  const { data: trucks, isLoading, refetch, isRefetching } = useListTrucks();
  const createMutation = useCreateTruck();
  const [showAdd, setShowAdd] = useState(false);
  const [plate, setPlate] = useState("");
  const [driver, setDriver] = useState("");
  const [phone, setPhone] = useState("");

  const handleCreate = async () => {
    if (!plate.trim() || !driver.trim() || !phone.trim()) {
      Alert.alert("Missing info", "Plate, driver, and phone are required.");
      return;
    }
    try {
      await createMutation.mutateAsync({
        data: { plateNumber: plate.trim(), driverName: driver.trim(), driverPhone: phone.trim() },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: getListTrucksQueryKey() });
      setPlate("");
      setDriver("");
      setPhone("");
      setShowAdd(false);
    } catch {
      Alert.alert("Failed", "Could not add truck. The plate may already exist.");
    }
  };

  const list = trucks ?? [];
  const counts = {
    available: list.filter((t) => t.status === "available").length,
    in_transit: list.filter((t) => t.status === "in_transit").length,
    maintenance: list.filter((t) => t.status === "maintenance").length,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Fleet"
        subtitle={`${list.length} trucks total`}
        right={
          <TouchableOpacity
            onPress={() => setShowAdd(true)}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            hitSlop={6}
          >
            <Feather name="plus" size={18} color="#fff" />
          </TouchableOpacity>
        }
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(t) => String(t.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
          ListHeaderComponent={
            <View style={styles.summaryRow}>
              {(Object.keys(STATUS_META) as Status[]).map((s) => {
                const meta = STATUS_META[s];
                return (
                  <View
                    key={s}
                    style={[
                      styles.summaryCard,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                  >
                    <View style={[styles.summaryDot, { backgroundColor: meta.color }]} />
                    <Text style={[styles.summaryNum, { color: colors.foreground }]}>{counts[s]}</Text>
                    <Text style={[styles.summaryLbl, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {meta.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          }
          ListEmptyComponent={
            <EmptyState
              icon="truck"
              title="No trucks yet"
              description="Add your first delivery truck to start fulfilling orders."
            />
          }
          renderItem={({ item }) => {
            const meta = STATUS_META[item.status as Status] ?? STATUS_META.available;
            return (
              <Card style={{ marginBottom: 12 }}>
                <View style={styles.truckHeader}>
                  <View style={[styles.plateBadge, { backgroundColor: colors.muted }]}>
                    <Feather name="truck" size={16} color={colors.primary} />
                    <Text style={[styles.plate, { color: colors.foreground }]}>{item.plateNumber}</Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: meta.color + "1A" }]}>
                    <Feather name={meta.icon} size={12} color={meta.color} />
                    <Text style={[styles.statusTxt, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                </View>
                <View style={styles.truckRow}>
                  <Feather name="user" size={14} color={colors.mutedForeground} />
                  <Text style={[styles.truckTxt, { color: colors.foreground }]}>{item.driverName}</Text>
                </View>
                <View style={styles.truckRow}>
                  <Feather name="phone" size={14} color={colors.mutedForeground} />
                  <Text style={[styles.truckTxt, { color: colors.mutedForeground }]}>{item.driverPhone}</Text>
                </View>
                {item.lat != null && item.lng != null ? (
                  <View style={styles.truckRow}>
                    <Feather name="map-pin" size={14} color={colors.mutedForeground} />
                    <Text style={[styles.truckTxt, { color: colors.mutedForeground }]}>
                      GPS {Number(item.lat).toFixed(4)}, {Number(item.lng).toFixed(4)}
                    </Text>
                  </View>
                ) : null}
                {item.currentOrderId != null && (
                  <View style={[styles.assignedTag, { backgroundColor: colors.primary + "12" }]}>
                    <Feather name="package" size={12} color={colors.primary} />
                    <Text style={[styles.assignedTxt, { color: colors.primary }]}>Assigned to order #{item.currentOrderId}</Text>
                  </View>
                )}
              </Card>
            );
          }}
        />
      )}

      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setShowAdd(false)} />
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Add new truck</Text>
              <Text style={[styles.sheetSub, { color: colors.mutedForeground }]}>
                Register a delivery vehicle and driver
              </Text>

              {[
                { label: "Plate number", value: plate, set: setPlate, placeholder: "SS 12345 AB", icon: "hash" as const },
                { label: "Driver name", value: driver, set: setDriver, placeholder: "Full name", icon: "user" as const },
                { label: "Driver phone", value: phone, set: setPhone, placeholder: "+211 9XX XXX XXX", icon: "phone" as const },
              ].map((f) => (
                <View key={f.label} style={{ marginTop: 14 }}>
                  <Text style={[styles.fieldLbl, { color: colors.foreground }]}>{f.label}</Text>
                  <View style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Feather name={f.icon} size={16} color={colors.mutedForeground} />
                    <TextInput
                      value={f.value}
                      onChangeText={f.set}
                      placeholder={f.placeholder}
                      placeholderTextColor={colors.mutedForeground}
                      style={[styles.inputTxt, { color: colors.foreground }]}
                      autoCapitalize={f.label === "Plate number" ? "characters" : "words"}
                      keyboardType={f.label === "Driver phone" ? "phone-pad" : "default"}
                    />
                  </View>
                </View>
              ))}

              <Pressable
                onPress={handleCreate}
                disabled={createMutation.isPending}
                style={({ pressed }) => [
                  styles.createBtn,
                  { backgroundColor: colors.primary, opacity: pressed || createMutation.isPending ? 0.85 : 1 },
                ]}
              >
                <Text style={styles.createTxt}>
                  {createMutation.isPending ? "Adding..." : "Add Truck"}
                </Text>
              </Pressable>
              <TouchableOpacity onPress={() => setShowAdd(false)} style={styles.cancelBtn}>
                <Text style={[styles.cancelTxt, { color: colors.mutedForeground }]}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  summaryCard: { flex: 1, padding: 12, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, alignItems: "flex-start", gap: 4 },
  summaryDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  summaryNum: { fontSize: 20, fontWeight: "800" },
  summaryLbl: { fontSize: 11, fontWeight: "500" },
  truckHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  plateBadge: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  plate: { fontSize: 14, fontWeight: "800", letterSpacing: 0.5, fontVariant: ["tabular-nums"] },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  statusTxt: { fontSize: 11, fontWeight: "700" },
  truckRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 },
  truckTxt: { fontSize: 13 },
  assignedTag: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignSelf: "flex-start" },
  assignedTxt: { fontSize: 12, fontWeight: "600" },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32, maxHeight: "90%" },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  sheetSub: { fontSize: 13, marginTop: 4 },
  fieldLbl: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  inputTxt: { flex: 1, fontSize: 15, paddingVertical: 0 },
  createBtn: { marginTop: 22, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  createTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
  cancelBtn: { marginTop: 8, paddingVertical: 12, alignItems: "center" },
  cancelTxt: { fontSize: 14, fontWeight: "600" },
});
