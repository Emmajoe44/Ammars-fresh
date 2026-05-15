import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  getListProductsQueryKey,
  useDeleteProduct,
  useListCategories,
  useListProducts,
  useToggleProductAvailability,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Header } from "@/components/Header";
import { PJS } from "@/components/ui";
import { useColors } from "@/hooks/useColors";

export default function AdminProducts() {
  const colors = useColors();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [availability, setAvailability] = useState<"all" | "available" | "unavailable">("all");

  const queryParams = useMemo(
    () => ({
      search: search.trim() || undefined,
      categoryId,
      available: availability === "all" ? undefined : availability === "available",
      limit: 100,
    }),
    [search, categoryId, availability],
  );

  const { data, isLoading, refetch, isRefetching } = useListProducts(queryParams, {
    query: { queryKey: getListProductsQueryKey(queryParams) },
  });
  const { data: categories } = useListCategories();
  const toggleMutation = useToggleProductAvailability();
  const deleteMutation = useDeleteProduct();

  const products = data?.products ?? [];
  const cats = categories ?? [];

  const handleToggle = async (id: number) => {
    Haptics.selectionAsync();
    await toggleMutation.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey(queryParams) });
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert("Delete product", `Remove "${name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteMutation.mutateAsync({ id });
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey(queryParams) });
        },
      },
    ]);
  };

  const gradeColor = (g?: string | null) =>
    g === "A" ? colors.primary : g === "B" ? colors.secondary : colors.mutedForeground;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="All products"
        subtitle={`${products.length} item${products.length === 1 ? "" : "s"}`}
        eyebrow="Catalog oversight"
        variant="gradient"
      />

      {/* Search */}
      <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
        <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search products..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground, fontFamily: PJS.medium }]}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Feather name="x-circle" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        {/* Availability filter */}
        <View style={[styles.segment, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          {(["all", "available", "unavailable"] as const).map((opt) => {
            const selected = availability === opt;
            return (
              <Pressable
                key={opt}
                onPress={() => { Haptics.selectionAsync(); setAvailability(opt); }}
                style={[styles.segmentBtn, selected && { backgroundColor: colors.card }]}
              >
                <Text
                  style={[
                    styles.segmentTxt,
                    {
                      color: selected ? colors.primary : colors.mutedForeground,
                      fontFamily: selected ? PJS.bold : PJS.medium,
                    },
                  ]}
                >
                  {opt === "all" ? "All" : opt === "available" ? "Available" : "Out of stock"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Category chips */}
        {cats.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 12 }}
          >
            <Pressable
              onPress={() => { Haptics.selectionAsync(); setCategoryId(undefined); }}
              style={[
                styles.chip,
                {
                  backgroundColor: categoryId === undefined ? colors.primary : colors.card,
                  borderColor: categoryId === undefined ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={{
                  fontFamily: PJS.bold,
                  fontSize: 12,
                  color: categoryId === undefined ? "#fff" : colors.foreground,
                }}
              >
                All categories
              </Text>
            </Pressable>
            {cats.map((c) => {
              const selected = categoryId === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => { Haptics.selectionAsync(); setCategoryId(selected ? undefined : c.id); }}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? colors.primary : colors.card,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontFamily: PJS.semibold,
                      fontSize: 12,
                      color: selected ? "#fff" : colors.foreground,
                    }}
                  >
                    {c.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : products.length === 0 ? (
        <EmptyState
          icon="package"
          title="No products"
          description="No products match the current filters."
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
          renderItem={({ item }) => {
            const grade = item.qualityGrade ?? "A";
            return (
              <Card style={[{ marginBottom: 12, opacity: item.available ? 1 : 0.7 }]}>
                <View style={styles.headerRow}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.name, { color: colors.foreground, fontFamily: PJS.bold }]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                    {item.nameAr ? (
                      <Text
                        style={[styles.nameAr, { color: colors.mutedForeground, fontFamily: PJS.medium }]}
                        numberOfLines={1}
                      >
                        {item.nameAr}
                      </Text>
                    ) : null}
                  </View>
                  <View style={[styles.gradeBadge, { backgroundColor: gradeColor(grade) + "22" }]}>
                    <Text style={[styles.gradeTxt, { color: gradeColor(grade), fontFamily: PJS.bold }]}>
                      {grade}
                    </Text>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Feather name="user" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.metaTxt, { color: colors.mutedForeground, fontFamily: PJS.medium }]} numberOfLines={1}>
                      {item.farmerName ?? "—"}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Feather name="box" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.metaTxt, { color: colors.mutedForeground, fontFamily: PJS.medium }]}>
                      {item.quantity} {item.unit ?? ""}
                    </Text>
                  </View>
                </View>

                <View style={styles.footer}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.price, { color: colors.primary, fontFamily: PJS.bold }]}>
                      SSP {Number(item.priceSSP).toLocaleString()}
                      <Text style={{ color: colors.mutedForeground, fontFamily: PJS.medium, fontSize: 11 }}>
                        {" "}/ {item.unit ?? "unit"}
                      </Text>
                    </Text>
                    <Text style={[styles.priceUsd, { color: colors.mutedForeground, fontFamily: PJS.medium }]}>
                      ${Number(item.priceUSD ?? 0).toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.actions}>
                    <Switch
                      value={item.available}
                      onValueChange={() => handleToggle(item.id)}
                      trackColor={{ false: colors.muted, true: colors.primary + "70" }}
                      thumbColor={item.available ? colors.primary : colors.mutedForeground}
                      disabled={toggleMutation.isPending}
                    />
                    <Pressable
                      onPress={() => handleDelete(item.id, item.name)}
                      hitSlop={8}
                      style={[styles.deleteBtn, { backgroundColor: colors.destructive + "14" }]}
                    >
                      <Feather name="trash-2" size={15} color={colors.destructive} />
                    </Pressable>
                  </View>
                </View>
              </Card>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
  segment: {
    flexDirection: "row",
    marginTop: 12,
    padding: 4,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  segmentBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 9 },
  segmentTxt: { fontSize: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  name: { fontSize: 15, letterSpacing: -0.2 },
  nameAr: { fontSize: 12, marginTop: 2 },
  gradeBadge: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  gradeTxt: { fontSize: 12 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 10 },
  metaRow: { flexDirection: "row", gap: 16, marginBottom: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5, flex: 1 },
  metaTxt: { fontSize: 11 },
  footer: { flexDirection: "row", alignItems: "center", gap: 12 },
  price: { fontSize: 14 },
  priceUsd: { fontSize: 11, marginTop: 1 },
  actions: { flexDirection: "row", alignItems: "center", gap: 10 },
  deleteBtn: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});
