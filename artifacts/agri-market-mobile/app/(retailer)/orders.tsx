import { getListOrdersQueryKey, useListOrders } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { Header } from "@/components/Header";
import { OrderCard } from "@/components/OrderCard";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function RetailerOrders() {
  const colors = useColors();
  const router = useRouter();
  const { user, currency } = useAuth();

  const { data, isLoading, refetch, isRefetching } = useListOrders(
    { retailerId: user?.id },
    {
      query: {
        enabled: !!user?.id,
        queryKey: getListOrdersQueryKey({ retailerId: user?.id }),
      },
    },
  );

  const orders = data?.orders ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="My orders" subtitle={`${orders.length} ${orders.length === 1 ? "order" : "orders"}`} />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : orders.length === 0 ? (
        <EmptyState
          icon="package"
          title="No orders yet"
          description="Orders you place will show up here with delivery tracking."
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
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
              truckPlate={item.truckPlate}
              onPress={() => router.push(`/(retailer)/order-detail?id=${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 16, paddingBottom: 120 },
});
