import { Feather } from "@expo/vector-icons";
import { useGetFarmerStats } from "@workspace/api-client-react";
import React from "react";
import { ActivityIndicator, FlatList, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useFormatRevenue } from "@/hooks/useFormatRevenue";
import { StatCard } from "@/components/StatCard";

export default function FarmerStats() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: stats, isLoading, refetch, isRefetching } = useGetFarmerStats();

  const formatRevenue = useFormatRevenue();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
      }
    >
      <View style={{ paddingTop: topPad + 16 }}>
        <Text style={[styles.title, { color: colors.foreground }]}>Sales Dashboard</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Your farming performance</Text>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <StatCard
                label="Total Products"
                value={stats?.totalProducts ?? 0}
                icon="package"
                tone="info"
              />
              <StatCard
                label="Active Listings"
                value={stats?.activeProducts ?? 0}
                icon="check-circle"
                tone="success"
              />
              <StatCard
                label="Orders This Month"
                value={stats?.ordersThisMonth ?? 0}
                icon="shopping-bag"
                tone="secondary"
              />
              <StatCard
                label="Total Revenue"
                value={formatRevenue(stats?.totalSalesSSP ?? 0, stats?.totalSalesUSD ?? 0)}
                icon="trending-up"
                tone="primary"
              />
            </View>

            {(stats?.topProducts ?? []).length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Top Products</Text>
                {(stats?.topProducts ?? []).map((p: any, idx: number) => (
                  <View
                    key={p.productId}
                    style={[
                      styles.topItem,
                      { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
                    ]}
                  >
                    <View style={[styles.rank, { backgroundColor: colors.primary + "18", borderRadius: 20 }]}>
                      <Text style={[styles.rankText, { color: colors.primary }]}>#{idx + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.topName, { color: colors.foreground }]}>{p.productName}</Text>
                      <Text style={[styles.topSales, { color: colors.mutedForeground }]}>
                        {p.totalQuantity} units sold
                      </Text>
                    </View>
                    <Text style={[styles.topRevenue, { color: colors.primary }]}>
                      {formatRevenue(p.totalSSP, p.totalUSD)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {(stats?.topProducts ?? []).length === 0 && (
              <View style={styles.noSales}>
                <Feather name="bar-chart-2" size={48} color={colors.mutedForeground} />
                <Text style={[styles.noSalesText, { color: colors.mutedForeground }]}>
                  No sales data yet
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: "800", paddingHorizontal: 20, marginBottom: 4 },
  subtitle: { fontSize: 13, paddingHorizontal: 20, marginBottom: 20 },
  loading: { padding: 60, alignItems: "center" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 14, marginBottom: 8 },
  section: { marginTop: 16, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 },
  topItem: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderWidth: 1, marginBottom: 10 },
  rank: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  rankText: { fontSize: 13, fontWeight: "800" },
  topName: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  topSales: { fontSize: 12 },
  topRevenue: { fontSize: 15, fontWeight: "700" },
  noSales: { alignItems: "center", justifyContent: "center", gap: 12, padding: 60 },
  noSalesText: { fontSize: 15 },
});
