import { useListOrders } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { EmptyState } from "@/components/EmptyState";
import { Header } from "@/components/Header";
import { OrderCard } from "@/components/OrderCard";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

type StatusFilter = "all" | "pending" | "confirmed" | "assigned" | "in_transit" | "delivered" | "cancelled";

const FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Assigned", value: "assigned" },
  { label: "In Transit", value: "in_transit" },
  { label: "Delivered", value: "delivered" },
];

export default function AdminOrders() {
  const colors = useColors();
  const router = useRouter();
  const { currency } = useAuth();
  const [filter, setFilter] = useState<StatusFilter>("all");

  const { data, isLoading, refetch, isRefetching } = useListOrders(
    filter !== "all" ? { status: filter } : {},
  );

  const orders = data?.orders ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="All orders" subtitle={`${data?.total ?? 0} total`} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <Pressable
              key={f.value}
              onPress={() => setFilter(f.value)}
              style={[styles.filterChip, { backgroundColor: active ? colors.primary : colors.muted }]}
            >
              <Text style={[styles.filterText, { color: active ? "#fff" : colors.mutedForeground }]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : orders.length === 0 ? (
        <EmptyState icon="clipboard" title="No orders" description="Orders matching this filter will show up here." />
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
              onPress={() => router.push(`/(admin)/order-detail?id=${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterRow: { paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  filterText: { fontSize: 13, fontWeight: "700" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 16, paddingBottom: 120 },
});
