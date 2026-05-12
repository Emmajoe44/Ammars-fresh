import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useGetAdminStats } from "@workspace/api-client-react";
import React from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { useFormatRevenue } from "@/hooks/useFormatRevenue";

export default function AdminDashboard() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();
  const formatRevenue = useFormatRevenue();

  const { data: stats, isLoading, refetch, isRefetching } = useGetAdminStats();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Command Center" subtitle={user?.name ?? "Admin"} />

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
            <View style={styles.statsRow}>
              <StatCard label="Revenue" value={stats ? formatRevenue(stats.revenueSSP, stats.revenueUSD) : "—"} icon="trending-up" tone="primary" />
              <StatCard label="Total orders" value={stats?.totalOrders ?? 0} icon="shopping-bag" tone="secondary" />
            </View>
            <View style={styles.statsRow}>
              <StatCard label="Pending" value={stats?.pendingOrders ?? 0} icon="clock" tone="warning" />
              <StatCard label="Active" value={stats?.activeOrders ?? 0} icon="navigation" tone="info" />
            </View>
            <View style={styles.statsRow}>
              <StatCard label="Farmers" value={stats?.totalFarmers ?? 0} icon="sun" tone="success" />
              <StatCard label="Retailers" value={stats?.totalRetailers ?? 0} icon="users" tone="info" />
            </View>

            {(stats?.lowStockCount ?? 0) > 0 && (
              <View style={[styles.alert, { backgroundColor: colors.warning + "18", borderColor: colors.warning + "40" }]}>
                <Feather name="alert-triangle" size={18} color={colors.warning} />
                <Text style={[styles.alertTxt, { color: colors.warning }]}>
                  {stats?.lowStockCount} product{stats?.lowStockCount === 1 ? "" : "s"} running low on stock
                </Text>
              </View>
            )}

            <Text style={[styles.section, { color: colors.mutedForeground }]}>Quick actions</Text>
            <View style={styles.actionsGrid}>
              {[
                { label: "Orders", icon: "clipboard" as const, route: "/(admin)/orders", tint: colors.primary },
                { label: "Trucks", icon: "truck" as const, route: "/(admin)/trucks", tint: colors.secondary },
                { label: "Pricing", icon: "dollar-sign" as const, route: "/(admin)/pricing", tint: colors.info },
                { label: "Analytics", icon: "bar-chart-2" as const, route: "/(admin)/analytics", tint: colors.success },
              ].map((a) => (
                <Pressable
                  key={a.label}
                  onPress={() => router.push(a.route as any)}
                  style={({ pressed }) => [
                    styles.actionTile,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <View style={[styles.actionIcon, { backgroundColor: a.tint + "1A" }]}>
                    <Feather name={a.icon} size={18} color={a.tint} />
                  </View>
                  <Text style={[styles.actionLbl, { color: colors.foreground }]}>{a.label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.section, { color: colors.mutedForeground }]}>At a glance</Text>
            <Card padded={false}>
              {[
                { icon: "package" as const, label: "Total products listed", value: stats?.totalProducts ?? 0 },
                { icon: "truck" as const, label: "Active trucks", value: stats?.trucksActive ?? 0 },
                { icon: "check-circle" as const, label: "Delivered today", value: stats?.deliveredToday ?? 0 },
              ].map((row, i, arr) => (
                <View key={row.label}>
                  <View style={styles.summaryRow}>
                    <View style={[styles.summaryIcon, { backgroundColor: colors.primary + "1A" }]}>
                      <Feather name={row.icon} size={16} color={colors.primary} />
                    </View>
                    <Text style={[styles.summaryLbl, { color: colors.foreground }]}>{row.label}</Text>
                    <Text style={[styles.summaryVal, { color: colors.primary }]}>{row.value}</Text>
                  </View>
                  {i < arr.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                </View>
              ))}
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { padding: 60, alignItems: "center" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  alert: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, marginTop: 8 },
  alertTxt: { fontSize: 13, fontWeight: "700", flex: 1 },
  section: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 22, marginBottom: 10, marginLeft: 4 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionTile: { flex: 1, minWidth: "47%", flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth },
  actionIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  actionLbl: { fontSize: 14, fontWeight: "700" },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  summaryIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  summaryLbl: { flex: 1, fontSize: 14, fontWeight: "500" },
  summaryVal: { fontSize: 17, fontWeight: "800", fontVariant: ["tabular-nums"] },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 58 },
});
