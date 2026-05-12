import { Feather } from "@expo/vector-icons";
import { useGetAdminStats, useGetDemandAnalytics } from "@workspace/api-client-react";
import React, { useMemo } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

const PIE_COLORS = ["#2d753e", "#e9850c", "#3b82f6", "#a855f7", "#f43f5e", "#10b981"];

export default function AdminAnalytics() {
  const colors = useColors();
  const { currency } = useAuth();
  const { data: demand, isLoading: dLoading } = useGetDemandAnalytics();
  const { data: stats } = useGetAdminStats();

  const rows = Array.isArray(demand) ? demand : [];

  const dailyOrders = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const d = String(r.date);
      map.set(d, (map.get(d) ?? 0) + Number(r.orderCount ?? 0));
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, orders]) => ({ date, orders }));
  }, [rows]);

  const byProduct = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const k = String(r.productName ?? "Unknown");
      map.set(k, (map.get(k) ?? 0) + Number(r.orderCount ?? 0));
    }
    return Array.from(map.entries())
      .map(([name, orders]) => ({ name, orders }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 8);
  }, [rows]);

  const maxDaily = Math.max(1, ...dailyOrders.map((p) => p.orders));
  const totalProductOrders = byProduct.reduce((acc, p) => acc + p.orders, 0);

  const formatRevenue = () => {
    if (!stats) return "—";
    if (currency === "USD") return `$${Number(stats.revenueUSD ?? 0).toFixed(2)}`;
    return `SSP ${Number(stats.revenueSSP ?? 0).toLocaleString()}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Demand analytics" subtitle="Order trends and category mix" showBack />

      {dLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <View style={styles.statsRow}>
            <StatCard label="Revenue" value={formatRevenue()} icon="trending-up" tone="primary" />
            <StatCard label="Total orders" value={stats?.totalOrders ?? 0} icon="shopping-bag" tone="secondary" />
          </View>
          <View style={styles.statsRow}>
            <StatCard label="Active orders" value={stats?.activeOrders ?? 0} icon="navigation" tone="info" />
            <StatCard label="Delivered today" value={stats?.deliveredToday ?? 0} icon="check-circle" tone="success" />
          </View>

          <Text style={[styles.section, { color: colors.mutedForeground }]}>Daily orders (last 7 days)</Text>
          <Card>
            {dailyOrders.length === 0 ? (
              <EmptyState icon="bar-chart-2" title="No orders yet" description="Daily order activity will appear here." />
            ) : (
              <View style={styles.barChart}>
                {dailyOrders.slice(-7).map((p, i) => {
                  const h = Math.max(6, (p.orders / maxDaily) * 140);
                  const date = new Date(p.date);
                  const label = date.toLocaleDateString("en-US", { weekday: "short" });
                  return (
                    <View key={i} style={styles.barCol}>
                      <Text style={[styles.barVal, { color: colors.foreground }]}>{p.orders}</Text>
                      <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
                        <View style={[styles.barFill, { backgroundColor: colors.primary, height: h }]} />
                      </View>
                      <Text style={[styles.barLbl, { color: colors.mutedForeground }]}>{label}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </Card>

          <Text style={[styles.section, { color: colors.mutedForeground }]}>Top products by demand</Text>
          <Card>
            {byProduct.length === 0 ? (
              <EmptyState icon="pie-chart" title="No product data" description="Product demand will appear here." />
            ) : (
              <View style={{ gap: 12 }}>
                {byProduct.map((p, idx) => {
                  const pct = totalProductOrders ? (p.orders / totalProductOrders) * 100 : 0;
                  const color = PIE_COLORS[idx % PIE_COLORS.length];
                  return (
                    <View key={p.name}>
                      <View style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: color }]} />
                        <Text style={[styles.legendLbl, { color: colors.foreground }]} numberOfLines={1}>
                          {p.name}
                        </Text>
                        <Text style={[styles.legendNum, { color: colors.mutedForeground }]}>
                          {p.orders} · {pct.toFixed(0)}%
                        </Text>
                      </View>
                      <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
                        <View style={[styles.progressFill, { backgroundColor: color, width: `${pct}%` }]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </Card>

          {(stats?.lowStockCount ?? 0) > 0 && (
            <View style={[styles.alert, { backgroundColor: colors.warning + "18", borderColor: colors.warning + "40" }]}>
              <Feather name="alert-triangle" size={18} color={colors.warning} />
              <Text style={[styles.alertTxt, { color: colors.warning }]}>
                {stats?.lowStockCount} product{stats?.lowStockCount === 1 ? "" : "s"} low on stock
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  section: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 18, marginBottom: 8, marginLeft: 4 },
  barChart: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 200, paddingTop: 8, gap: 6 },
  barCol: { flex: 1, alignItems: "center", justifyContent: "flex-end", gap: 4 },
  barVal: { fontSize: 11, fontWeight: "700", fontVariant: ["tabular-nums"] },
  barTrack: { width: "100%", height: 150, borderRadius: 6, overflow: "hidden", justifyContent: "flex-end" },
  barFill: { width: "100%", borderRadius: 6 },
  barLbl: { fontSize: 11, marginTop: 2 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLbl: { flex: 1, fontSize: 13, fontWeight: "600" },
  legendNum: { fontSize: 12, fontVariant: ["tabular-nums"] },
  progressTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  alert: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, marginTop: 18 },
  alertTxt: { fontSize: 13, fontWeight: "700", flex: 1 },
});
