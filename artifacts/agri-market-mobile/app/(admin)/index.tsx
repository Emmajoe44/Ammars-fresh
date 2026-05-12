import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useGetAdminStats } from "@workspace/api-client-react";
import React from "react";
import { ActivityIndicator, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { InfoRow, Pill, PJS, SectionLabel } from "@/components/ui";
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
      <Header
        title="Command Center"
        subtitle={`Welcome back, ${user?.name ?? "Admin"}`}
        eyebrow="Live operations"
        variant="gradient"
      />

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
              <StatCard label="Total revenue" value={stats ? formatRevenue(stats.revenueSSP, stats.revenueUSD) : "—"} icon="trending-up" tone="primary" variant="gradient" hint="Today" />
              <StatCard label="Total orders" value={stats?.totalOrders ?? 0} icon="shopping-bag" tone="secondary" variant="gradient" hint="All time" />
            </View>
            <View style={styles.statsRow}>
              <StatCard label="Pending" value={stats?.pendingOrders ?? 0} icon="clock" tone="warning" onPress={() => router.push("/(admin)/orders")} />
              <StatCard label="Active" value={stats?.activeOrders ?? 0} icon="navigation" tone="info" onPress={() => router.push("/(admin)/orders")} />
            </View>
            <View style={styles.statsRow}>
              <StatCard label="Farmers" value={stats?.totalFarmers ?? 0} icon="sun" tone="success" onPress={() => router.push("/(admin)/users")} />
              <StatCard label="Retailers" value={stats?.totalRetailers ?? 0} icon="users" tone="info" onPress={() => router.push("/(admin)/users")} />
            </View>

            {(stats?.lowStockCount ?? 0) > 0 && (
              <View style={[styles.alert, { backgroundColor: colors.warning + "18", borderColor: colors.warning + "40" }]}>
                <Feather name="alert-triangle" size={18} color={colors.warning} />
                <Text style={[styles.alertTxt, { color: colors.warning, fontFamily: PJS.bold }]}>
                  {stats?.lowStockCount} product{stats?.lowStockCount === 1 ? "" : "s"} running low on stock
                </Text>
              </View>
            )}

            <SectionLabel label="Quick actions" />
            <View style={styles.actionsGrid}>
              {[
                { label: "Orders", desc: "Manage flow", icon: "clipboard" as const, route: "/(admin)/orders", tint: colors.primary },
                { label: "Trucks", desc: "Fleet & GPS", icon: "truck" as const, route: "/(admin)/trucks", tint: colors.secondary },
                { label: "Pricing", desc: "Set ranges", icon: "dollar-sign" as const, route: "/(admin)/pricing", tint: colors.info },
                { label: "Analytics", desc: "Demand mix", icon: "bar-chart-2" as const, route: "/(admin)/analytics", tint: colors.success },
              ].map((a) => (
                <Pressable
                  key={a.label}
                  onPress={() => router.push(a.route as any)}
                  style={({ pressed }) => [
                    styles.actionTile,
                    { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
                  ]}
                >
                  <View style={[styles.actionIcon, { backgroundColor: a.tint + "1A" }]}>
                    <Feather name={a.icon} size={18} color={a.tint} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.actionLbl, { color: colors.foreground, fontFamily: PJS.bold }]}>{a.label}</Text>
                    <Text style={[styles.actionDesc, { color: colors.mutedForeground, fontFamily: PJS.medium }]}>{a.desc}</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                </Pressable>
              ))}
            </View>

            <SectionLabel label="At a glance" />
            <Card>
              <InfoRow icon="package" label="Products listed" value={String(stats?.totalProducts ?? 0)} tint={colors.primary} />
              <InfoRow icon="truck" label="Trucks active" value={String(stats?.trucksActive ?? 0)} tint={colors.secondary} />
              <InfoRow icon="check-circle" label="Delivered today" value={String(stats?.deliveredToday ?? 0)} tint={colors.success} />
              <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
                <Pill label="Live" color={colors.success} dot />
                <Pill label="Auto-refresh" color={colors.info} icon="refresh-cw" />
              </View>
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
  alert: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, marginTop: 10 },
  alertTxt: { fontSize: 13, flex: 1 },
  actionsGrid: { gap: 8 },
  actionTile: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 14, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: { shadowColor: "#1a1410", shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 1 },
      web: { boxShadow: "0 3px 10px rgba(26, 20, 16, 0.04)" } as any,
      default: {},
    }),
  },
  actionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  actionLbl: { fontSize: 14 },
  actionDesc: { fontSize: 11, marginTop: 1 },
});
