import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ProductUpdateQualityGrade,
  getGetProductQueryKey,
  getListProductsQueryKey,
  useDeleteProduct,
  useGetProduct,
  useUpdateProduct,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function FarmerEditProduct() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Number(params.id ?? 0);

  const { data: product, isLoading } = useGetProduct(id, {
    query: { enabled: id > 0, queryKey: getGetProductQueryKey(id) },
  });
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  const [priceSSP, setPriceSSP] = useState("");
  const [priceUSD, setPriceUSD] = useState("");
  const [quantity, setQuantity] = useState("");
  const [grade, setGrade] = useState("A");
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    if (product) {
      setPriceSSP(String(product.priceSSP ?? ""));
      setPriceUSD(String(product.priceUSD ?? ""));
      setQuantity(String(product.quantity ?? ""));
      setGrade(product.qualityGrade ?? "A");
      setAvailable(product.available ?? true);
    }
  }, [product]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey({ farmerId: user?.id }) });
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          priceSSP: Number(priceSSP),
          priceUSD: Number(priceUSD),
          quantity: Number(quantity),
          qualityGrade: grade as ProductUpdateQualityGrade,
          available,
        },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      refresh();
      router.back();
    } catch {
      Alert.alert("Failed", "Could not update product.");
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete product?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync({ id });
            refresh();
            router.back();
          } catch {
            Alert.alert("Failed", "Could not delete product.");
          }
        },
      },
    ]);
  };

  if (isLoading || !product) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Edit product" subtitle={product.name} showBack />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <Card>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.foreground }]}>Listed for sale</Text>
              <Switch
                value={available}
                onValueChange={setAvailable}
                trackColor={{ false: colors.muted, true: colors.primary + "70" }}
                thumbColor={available ? colors.primary : colors.mutedForeground}
              />
            </View>
          </Card>

          <Card style={{ marginTop: 14 }}>
            <Text style={[styles.section, { color: colors.foreground }]}>Pricing & stock</Text>
            <View style={styles.priceRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.lbl, { color: colors.foreground }]}>Price (SSP)</Text>
                <TextInput value={priceSSP} onChangeText={setPriceSSP} keyboardType="numeric" style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.lbl, { color: colors.foreground }]}>Price (USD)</Text>
                <TextInput value={priceUSD} onChangeText={setPriceUSD} keyboardType="decimal-pad" style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]} />
              </View>
            </View>
            <Text style={[styles.lbl, { color: colors.foreground }]}>Quantity ({product.unit})</Text>
            <TextInput value={quantity} onChangeText={setQuantity} keyboardType="numeric" style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]} />

            <Text style={[styles.lbl, { color: colors.foreground }]}>Quality grade</Text>
            <View style={styles.gradeRow}>
              {["A", "B", "C"].map((g) => {
                const active = grade === g;
                return (
                  <Pressable key={g} onPress={() => setGrade(g)} style={[styles.gradeBtn, { backgroundColor: active ? colors.primary : colors.muted, borderColor: active ? colors.primary : colors.border }]}>
                    <Text style={[styles.gradeTxt, { color: active ? "#fff" : colors.foreground }]}>Grade {g}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <Pressable
            onPress={handleSave}
            disabled={updateMutation.isPending}
            style={({ pressed }) => [styles.submit, { backgroundColor: colors.primary, opacity: pressed || updateMutation.isPending ? 0.85 : 1 }]}
          >
            <Feather name="check" size={18} color="#fff" />
            <Text style={styles.submitTxt}>{updateMutation.isPending ? "Saving..." : "Save changes"}</Text>
          </Pressable>

          <Pressable
            onPress={handleDelete}
            disabled={deleteMutation.isPending}
            style={({ pressed }) => [styles.deleteBtn, { borderColor: colors.destructive + "40", backgroundColor: colors.destructive + "10", opacity: pressed ? 0.7 : 1 }]}
          >
            <Feather name="trash-2" size={16} color={colors.destructive} />
            <Text style={[styles.deleteTxt, { color: colors.destructive }]}>Delete product</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { fontSize: 15, fontWeight: "600" },
  section: { fontSize: 14, fontWeight: "800", marginBottom: 8, letterSpacing: -0.2 },
  lbl: { fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  input: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, fontSize: 15 },
  priceRow: { flexDirection: "row", gap: 12 },
  gradeRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  gradeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, alignItems: "center" },
  gradeTxt: { fontSize: 13, fontWeight: "700" },
  submit: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 18, paddingVertical: 14, borderRadius: 14 },
  submitTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
  deleteBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12, paddingVertical: 13, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  deleteTxt: { fontSize: 14, fontWeight: "700" },
});
