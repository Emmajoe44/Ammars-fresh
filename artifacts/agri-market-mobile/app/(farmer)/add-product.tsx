import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import {
  ProductInputQualityGrade,
  getListProductsQueryKey,
  useCreateProduct,
  useListCategories,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { ImageUploader } from "@/components/ImageUploader";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function FarmerAddProduct() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: categories } = useListCategories();
  const createMutation = useCreateProduct();

  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [priceSSP, setPriceSSP] = useState("");
  const [priceUSD, setPriceUSD] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [grade, setGrade] = useState("A");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const reset = () => {
    setName("");
    setNameAr("");
    setCategoryId(null);
    setPriceSSP("");
    setPriceUSD("");
    setQuantity("");
    setUnit("kg");
    setGrade("A");
    setDescription("");
    setImageUrl(null);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !nameAr.trim() || !categoryId || !priceSSP || !priceUSD || !quantity) {
      Alert.alert("Missing info", "Please fill name (EN + AR), category, price, and quantity.");
      return;
    }
    try {
      await createMutation.mutateAsync({
        data: {
          name: name.trim(),
          nameAr: nameAr.trim(),
          categoryId,
          priceSSP: Number(priceSSP),
          priceUSD: Number(priceUSD),
          quantity: Number(quantity),
          unit,
          qualityGrade: grade as ProductInputQualityGrade,
          description: description.trim() || null,
          imageUrl: imageUrl ?? null,
        },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey({ farmerId: user?.id }) });
      reset();
      Alert.alert("Listed!", "Your product is now visible to retailers.", [
        { text: "Add another", style: "default" },
        { text: "View products", onPress: () => router.push("/(farmer)") },
      ]);
    } catch {
      Alert.alert("Failed", "Could not add product. Please try again.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Add product" subtitle="List a new item for sale" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Card>
            <Text style={[styles.section, { color: colors.foreground }]}>Photo</Text>
            <ImageUploader value={imageUrl} onChange={setImageUrl} label="" />
          </Card>

          <Card style={{ marginTop: 14 }}>
            <Text style={[styles.section, { color: colors.foreground }]}>Product details</Text>

            <Text style={[styles.lbl, { color: colors.foreground }]}>Name (English)</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Fresh Tomatoes"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
            />

            <Text style={[styles.lbl, { color: colors.foreground }]}>Name (Arabic)</Text>
            <TextInput
              value={nameAr}
              onChangeText={setNameAr}
              placeholder="طماطم طازجة"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground, textAlign: "right" }]}
            />

            <Text style={[styles.lbl, { color: colors.foreground }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
              {(categories ?? []).map((c) => {
                const active = categoryId === c.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setCategoryId(c.id)}
                    style={[styles.chip, { backgroundColor: active ? colors.primary : colors.muted }]}
                  >
                    <Text style={[styles.chipTxt, { color: active ? "#fff" : colors.mutedForeground }]}>{c.name}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Card>

          <Card style={{ marginTop: 14 }}>
            <Text style={[styles.section, { color: colors.foreground }]}>Pricing & stock</Text>

            <View style={styles.priceRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.lbl, { color: colors.foreground }]}>Price (SSP)</Text>
                <TextInput
                  value={priceSSP}
                  onChangeText={setPriceSSP}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.lbl, { color: colors.foreground }]}>Price (USD)</Text>
                <TextInput
                  value={priceUSD}
                  onChangeText={setPriceUSD}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                />
              </View>
            </View>

            <View style={styles.priceRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.lbl, { color: colors.foreground }]}>Quantity</Text>
                <TextInput
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.lbl, { color: colors.foreground }]}>Unit</Text>
                <View style={styles.unitRow}>
                  {["kg", "ton", "bag", "crate"].map((u) => (
                    <Pressable
                      key={u}
                      onPress={() => setUnit(u)}
                      style={[styles.unitBtn, { backgroundColor: unit === u ? colors.primary : colors.muted }]}
                    >
                      <Text style={[styles.unitTxt, { color: unit === u ? "#fff" : colors.mutedForeground }]}>{u}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            <Text style={[styles.lbl, { color: colors.foreground }]}>Quality grade</Text>
            <View style={styles.gradeRow}>
              {["A", "B", "C"].map((g) => {
                const active = grade === g;
                return (
                  <Pressable
                    key={g}
                    onPress={() => setGrade(g)}
                    style={[styles.gradeBtn, { backgroundColor: active ? colors.primary : colors.muted, borderColor: active ? colors.primary : colors.border }]}
                  >
                    <Text style={[styles.gradeTxt, { color: active ? "#fff" : colors.foreground }]}>Grade {g}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <Card style={{ marginTop: 14 }}>
            <Text style={[styles.section, { color: colors.foreground }]}>Description (optional)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Tell retailers what makes your produce great..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={4}
              style={[styles.input, styles.textarea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
            />
          </Card>

          <Pressable
            onPress={handleSubmit}
            disabled={createMutation.isPending}
            style={({ pressed }) => [
              styles.submit,
              { backgroundColor: colors.primary, opacity: pressed || createMutation.isPending ? 0.85 : 1 },
            ]}
          >
            <Feather name="check" size={18} color="#fff" />
            <Text style={styles.submitTxt}>
              {createMutation.isPending ? "Listing..." : "List product"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 14, fontWeight: "800", marginBottom: 12, letterSpacing: -0.2 },
  lbl: { fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  input: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, fontSize: 15 },
  textarea: { minHeight: 100, textAlignVertical: "top" },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  chipTxt: { fontSize: 13, fontWeight: "600" },
  priceRow: { flexDirection: "row", gap: 12 },
  unitRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  unitBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  unitTxt: { fontSize: 12, fontWeight: "600" },
  gradeRow: { flexDirection: "row", gap: 8 },
  gradeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, alignItems: "center" },
  gradeTxt: { fontSize: 13, fontWeight: "700" },
  submit: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 18, paddingVertical: 15, borderRadius: 14 },
  submitTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
