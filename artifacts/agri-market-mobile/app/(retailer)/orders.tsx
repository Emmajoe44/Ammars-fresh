import { Feather } from "@expo/vector-icons";
import { getListOrdersQueryKey, useListOrders } from "@workspace/api-client-react";
import React from "react";
import { ActivityIndicator, FlatList, Platform, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { OrderCard } from "@/components/OrderCard";

export default function RetailerOrders() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, currency } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data, isLoading, refetch, isRefetching } = useListOrders(
    { retailerId: user?.id },
    {
      query: {
        enabled: !!user?.id,
        queryKey: getListOrdersQueryKey({ retailerId: user?.id }),
      },
    }
  );

  const orders = data?.orders ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 16, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>My Orders</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{orders.length} orders</Text>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="package" size={52} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No orders yet</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Your placed orders will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
          renderItem={({ item }) => (
            <OrderCard
              id={item.id}
              status={item.status}
              deliveryLocation={item.deliveryLocation}
              totalSSP={item.totalSSP}
              totalUSD={item.totalUSD}
              itemCount={Array.isArray(item.items) ? item.items.length : 0}
              createdAt={item.createdAt}
              currency={currency}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 4 },
  count: { fontSize: 13 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center" },
  list: { padding: 16, paddingBottom: 100 },
});
