import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";

export default function FarmerProducts() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data, isLoading, refetch, isRefetching } = useListProducts(
    { farmerId: user?.id },
    {
      query: {
        enabled: !!user?.id,
        queryKey: getListProductsQueryKey({ farmerId: user?.id }),
      },
    }
  );
  const toggleMutation = useToggleProductAvailability();

  const products = data?.products ?? [];

  const handleToggle = async (id: number) => {
    Haptics.selectionAsync();
    await toggleMutation.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: ["/api/products"] });
  };

  const gradeColor = (g: string) =>
    g === "A" ? colors.primary : g === "B" ? colors.secondary : colors.mutedForeground;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>My Products</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{user?.farmName ?? "Your Farm"}</Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: colors.primary + "18", borderRadius: colors.radius }]}>
          <Text style={[styles.countText, { color: colors.primary }]}>{products.length}</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="leaf" size={52} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No products yet</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Your listed products will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.productItem,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderRadius: colors.radius,
                  opacity: item.available ? 1 : 0.6,
                },
              ]}
            >
              <View style={styles.itemLeft}>
                <View style={styles.itemHeader}>
                  <Text style={[styles.productName, { color: colors.foreground }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={[styles.gradeBadge, { backgroundColor: gradeColor(item.qualityGrade ?? "A") + "20", borderRadius: 6 }]}>
                    <Text style={[styles.gradeText, { color: gradeColor(item.qualityGrade ?? "A") }]}>
                      {item.qualityGrade ?? "A"}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.productAr, { color: colors.mutedForeground }]}>{item.nameAr}</Text>
                <View style={styles.priceRow}>
                  <Text style={[styles.price, { color: colors.primary }]}>
                    SSP {item.priceSSP} / {item.unit ?? "unit"}
                  </Text>
                  <Text style={[styles.qty, { color: colors.mutedForeground }]}>{item.quantity} {item.unit ?? "unit"} left</Text>
                </View>
              </View>
              <Switch
                value={item.available}
                onValueChange={() => handleToggle(item.id)}
                trackColor={{ false: colors.muted, true: colors.primary + "60" }}
                thumbColor={item.available ? colors.primary : colors.mutedForeground}
                disabled={toggleMutation.isPending}
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 24, fontWeight: "800" },
  subtitle: { fontSize: 13, marginTop: 2 },
  countBadge: { paddingHorizontal: 14, paddingVertical: 8 },
  countText: { fontSize: 18, fontWeight: "800" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center" },
  list: { padding: 16, paddingBottom: 100 },
  productItem: { flexDirection: "row", alignItems: "center", padding: 16, borderWidth: 1, marginBottom: 12 },
  itemLeft: { flex: 1, marginRight: 12 },
  itemHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  productName: { flex: 1, fontSize: 16, fontWeight: "700" },
  gradeBadge: { paddingHorizontal: 8, paddingVertical: 3 },
  gradeText: { fontSize: 11, fontWeight: "700" },
  productAr: { fontSize: 13, marginBottom: 8, fontFamily: "System" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  price: { fontSize: 14, fontWeight: "600" },
  qty: { fontSize: 12 },
});
