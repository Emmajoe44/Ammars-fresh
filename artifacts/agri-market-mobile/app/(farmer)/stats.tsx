import { Feather } from "@expo/vector-icons";
import { useGetFarmerStats } from "@workspace/api-client-react";
import React from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { InfoRow, Pill, PJS, SectionLabel } from "@/components/ui";
import { useColors } from "@/hooks/useColors";
import { useFormatRevenue } from "@/hooks/useFormatRevenue";

export default function FarmerStats() {
  const colors = useColors();
  const formatRevenue = useFormatRevenue();

  const { data: stats, isLoading, refetch, isRefetching } = useGetFarmerStats();

  const top = stats?.topProducts ?? [];
  const maxQty = top.reduce((m, p) => Math.max(m, p.totalQuantity), 0) || 1;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Sales" subtitle="Performance & demand" eyebrow="Your harvest" variant="gradient" />

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            <View style={styles.row}>
              <StatCard label="Revenue" value={stats ? formatRevenue(stats.totalSalesSSP, stats.totalSalesUSD) : "—"} icon="trending-up" tone="primary" variant="gradient" hint="All time" />
              <StatCard label="Orders" value={stats?.ordersThisMonth ?? 0} icon="shopping-bag" tone="secondary" variant="gradient" hint="This month" />
            </View>
            <View style={styles.row}>
              <StatCard label="Active products" value={stats?.activeProducts ?? 0} icon="package" tone="info" hint="Listed" />
              <StatCard label="Total products" value={stats?.totalProducts ?? 0} icon="grid" tone="success" hint="Catalog" />
            </View>

            <SectionLabel label="Top sellers" />
            <Card>
              {top.length === 0 ? (
                <View style={styles.empty}>
                  <Feather name="bar-chart-2" size={28} color={colors.mutedForeground} />
                  <Text style={[styles.emptyTxt, { color: colors.mutedForeground, fontFamily: PJS.medium }]}>
                    No sales data yet
                  </Text>
                </View>
              ) : (
                top.map((p, i) => {
                  const pct = (p.totalQuantity / maxQty) * 100;
                  return (
                    <View key={p.productId} style={{ marginBottom: i === top.length - 1 ? 0 : 14 }}>
                      <View style={styles.topRow}>
                        <Text style={[styles.topName, { color: colors.foreground, fontFamily: PJS.bold }]} numberOfLines={1}>
                          {p.productName}
                        </Text>
                        <Pill label={`${p.totalQuantity} sold`} color={colors.primary} icon="package" />
                      </View>
                      <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
                        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: colors.primary }]} />
                      </View>
                    </View>
                  );
                })
              )}
            </Card>

            <SectionLabel label="At a glance" />
            <Card>
              <InfoRow icon="package" label="Total products" value={String(stats?.totalProducts ?? 0)} tint={colors.primary} />
              <InfoRow icon="check-circle" label="Active listings" value={String(stats?.activeProducts ?? 0)} tint={colors.success} />
              <InfoRow icon="shopping-bag" label="Orders this month" value={String(stats?.ordersThisMonth ?? 0)} tint={colors.info} />
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { padding: 60, alignItems: "center" },
  row: { flexDirection: "row", gap: 10, marginBottom: 10 },
  empty: { alignItems: "center", paddingVertical: 24, gap: 8 },
  emptyTxt: { fontSize: 13 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6, gap: 10 },
  topName: { fontSize: 14, flex: 1 },
  barTrack: { height: 8, borderRadius: 999, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 999 },
});
