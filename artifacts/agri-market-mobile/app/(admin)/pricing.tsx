import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  getListPricingQueryKey,
  useCreatePricingRule,
  useListCategories,
  useListPricing,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
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

export default function AdminPricing() {
  const colors = useColors();
  const queryClient = useQueryClient();
  const { data: categories } = useListCategories();
  const { data: rules, isLoading } = useListPricing();
  const createMutation = useCreatePricingRule();

  const [showAdd, setShowAdd] = useState(false);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [minSSP, setMinSSP] = useState("");
  const [maxSSP, setMaxSSP] = useState("");
  const [minUSD, setMinUSD] = useState("");
  const [maxUSD, setMaxUSD] = useState("");

  const handleSave = async () => {
    if (categoryId == null || !minSSP || !maxSSP || !minUSD || !maxUSD) {
      Alert.alert("Missing info", "Please fill all fields and pick a category.");
      return;
    }
    const min_s = Number(minSSP),
      max_s = Number(maxSSP),
      min_u = Number(minUSD),
      max_u = Number(maxUSD);
    if (min_s >= max_s || min_u >= max_u) {
      Alert.alert("Invalid range", "Maximum must be greater than minimum.");
      return;
    }
    try {
      await createMutation.mutateAsync({
        data: {
          categoryId,
          minPriceSSP: min_s,
          maxPriceSSP: max_s,
          minPriceUSD: min_u,
          maxPriceUSD: max_u,
        },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: getListPricingQueryKey() });
      setCategoryId(null);
      setMinSSP("");
      setMaxSSP("");
      setMinUSD("");
      setMaxUSD("");
      setShowAdd(false);
    } catch {
      Alert.alert("Failed", "Could not save pricing rule.");
    }
  };

  const list = rules ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="Pricing rules"
        subtitle="Govern category price floors and ceilings"
        showBack
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
      ) : list.length === 0 ? (
        <EmptyState
          icon="dollar-sign"
          title="No pricing rules yet"
          description="Add a rule to set acceptable price ranges for a category."
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          {list.map((r) => (
            <Card key={r.id} style={{ marginBottom: 12 }}>
              <View style={styles.ruleHeader}>
                <View style={[styles.catBadge, { backgroundColor: colors.primary + "1A" }]}>
                  <Feather name="tag" size={14} color={colors.primary} />
                  <Text style={[styles.catName, { color: colors.primary }]}>
                    {r.categoryName ?? `Category #${r.categoryId}`}
                  </Text>
                </View>
                <Text style={[styles.updated, { color: colors.mutedForeground }]}>
                  {new Date(r.updatedAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.priceGrid}>
                <View style={[styles.priceBox, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.priceLbl, { color: colors.mutedForeground }]}>Min SSP</Text>
                  <Text style={[styles.priceVal, { color: colors.foreground }]}>{Number(r.minPriceSSP).toLocaleString()}</Text>
                </View>
                <View style={[styles.priceBox, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.priceLbl, { color: colors.mutedForeground }]}>Max SSP</Text>
                  <Text style={[styles.priceVal, { color: colors.foreground }]}>{Number(r.maxPriceSSP).toLocaleString()}</Text>
                </View>
                <View style={[styles.priceBox, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.priceLbl, { color: colors.mutedForeground }]}>Min USD</Text>
                  <Text style={[styles.priceVal, { color: colors.foreground }]}>${Number(r.minPriceUSD).toFixed(2)}</Text>
                </View>
                <View style={[styles.priceBox, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.priceLbl, { color: colors.mutedForeground }]}>Max USD</Text>
                  <Text style={[styles.priceVal, { color: colors.foreground }]}>${Number(r.maxPriceUSD).toFixed(2)}</Text>
                </View>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}

      <Modal visible={showAdd} animationType="slide" transparent onRequestClose={() => setShowAdd(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setShowAdd(false)} />
          <View style={[styles.sheet, { backgroundColor: colors.card }]}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>New pricing rule</Text>
              <Text style={[styles.sheetSub, { color: colors.mutedForeground }]}>Set min/max prices for a category</Text>

              <Text style={[styles.fieldLbl, { color: colors.foreground, marginTop: 18 }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                {(categories ?? []).map((c) => {
                  const active = categoryId === c.id;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => setCategoryId(c.id)}
                      style={[
                        styles.catChip,
                        { backgroundColor: active ? colors.primary : colors.muted },
                      ]}
                    >
                      <Text style={[styles.catChipTxt, { color: active ? "#fff" : colors.mutedForeground }]}>{c.name}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <View style={styles.priceRow}>
                {[
                  { label: "Min SSP", value: minSSP, set: setMinSSP },
                  { label: "Max SSP", value: maxSSP, set: setMaxSSP },
                ].map((f) => (
                  <View key={f.label} style={{ flex: 1 }}>
                    <Text style={[styles.fieldLbl, { color: colors.foreground }]}>{f.label}</Text>
                    <TextInput
                      value={f.value}
                      onChangeText={f.set}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={colors.mutedForeground}
                      style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                    />
                  </View>
                ))}
              </View>
              <View style={styles.priceRow}>
                {[
                  { label: "Min USD", value: minUSD, set: setMinUSD },
                  { label: "Max USD", value: maxUSD, set: setMaxUSD },
                ].map((f) => (
                  <View key={f.label} style={{ flex: 1 }}>
                    <Text style={[styles.fieldLbl, { color: colors.foreground }]}>{f.label}</Text>
                    <TextInput
                      value={f.value}
                      onChangeText={f.set}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor={colors.mutedForeground}
                      style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                    />
                  </View>
                ))}
              </View>

              <Pressable
                onPress={handleSave}
                disabled={createMutation.isPending}
                style={({ pressed }) => [
                  styles.createBtn,
                  { backgroundColor: colors.primary, opacity: pressed || createMutation.isPending ? 0.85 : 1 },
                ]}
              >
                <Text style={styles.createTxt}>{createMutation.isPending ? "Saving..." : "Save rule"}</Text>
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
  ruleHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  catBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  catName: { fontSize: 13, fontWeight: "700" },
  updated: { fontSize: 11 },
  priceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  priceBox: { flex: 1, minWidth: "45%", padding: 12, borderRadius: 10 },
  priceLbl: { fontSize: 11, fontWeight: "600", marginBottom: 4 },
  priceVal: { fontSize: 16, fontWeight: "800", fontVariant: ["tabular-nums"] },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32, maxHeight: "92%" },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  sheetSub: { fontSize: 13, marginTop: 4 },
  fieldLbl: { fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  catChipTxt: { fontSize: 13, fontWeight: "600" },
  priceRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  input: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, fontSize: 15 },
  createBtn: { marginTop: 22, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  createTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
  cancelBtn: { marginTop: 8, paddingVertical: 12, alignItems: "center" },
  cancelTxt: { fontSize: 14, fontWeight: "600" },
});
