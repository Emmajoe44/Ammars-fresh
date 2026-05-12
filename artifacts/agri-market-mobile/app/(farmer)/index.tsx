import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import {
  getListProductsQueryKey,
  useListProducts,
  useToggleProductAvailability,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function FarmerProducts() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useListProducts(
    { farmerId: user?.id },
    {
      query: {
        enabled: !!user?.id,
        queryKey: getListProductsQueryKey({ farmerId: user?.id }),
      },
    },
  );
  const toggleMutation = useToggleProductAvailability();

  const products = data?.products ?? [];
  const activeCount = products.filter((p) => p.available).length;

  const handleToggle = async (id: number) => {
    Haptics.selectionAsync();
    await toggleMutation.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey({ farmerId: user?.id }) });
  };

  const gradeColor = (g: string) =>
    g === "A" ? colors.primary : g === "B" ? colors.secondary : colors.mutedForeground;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="My products"
        subtitle={`${activeCount} active · ${products.length} total`}
        right={
          <Pressable
            onPress={() => router.push("/(farmer)/add-product")}
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            hitSlop={6}
          >
            <Feather name="plus" size={18} color="#fff" />
          </Pressable>
        }
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : products.length === 0 ? (
        <EmptyState
          icon="package"
          title="No products yet"
          description="Tap the + button to list your first product."
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
          renderItem={({ item }) => {
            const grade = item.qualityGrade ?? "A";
            return (
              <Pressable
                onPress={() => router.push(`/(farmer)/edit-product?id=${item.id}`)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <Card style={[{ marginBottom: 12, opacity: item.available ? 1 : 0.65 }]}>
                  <View style={styles.headerRow}>
                    <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={[styles.gradeBadge, { backgroundColor: gradeColor(grade) + "20" }]}>
                      <Text style={[styles.gradeTxt, { color: gradeColor(grade) }]}>Grade {grade}</Text>
                    </View>
                  </View>
                  <Text style={[styles.nameAr, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {item.nameAr}
                  </Text>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <View style={styles.footer}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.price, { color: colors.primary }]}>
                        SSP {Number(item.priceSSP).toLocaleString()} / {item.unit ?? "unit"}
                      </Text>
                      <Text style={[styles.qty, { color: colors.mutedForeground }]}>
                        {item.quantity} {item.unit ?? "unit"} in stock
                      </Text>
                    </View>
                    <Switch
                      value={item.available}
                      onValueChange={() => handleToggle(item.id)}
                      trackColor={{ false: colors.muted, true: colors.primary + "70" }}
                      thumbColor={item.available ? colors.primary : colors.mutedForeground}
                      disabled={toggleMutation.isPending}
                    />
                  </View>
                </Card>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  addBtn: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  name: { flex: 1, fontSize: 16, fontWeight: "700", letterSpacing: -0.2 },
  gradeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  gradeTxt: { fontSize: 11, fontWeight: "700" },
  nameAr: { fontSize: 13, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 12 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  price: { fontSize: 14, fontWeight: "700" },
  qty: { fontSize: 12, marginTop: 2 },
});
