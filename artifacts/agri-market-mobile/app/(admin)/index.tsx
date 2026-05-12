import { Feather } from "@expo/vector-icons";
import { useGetAdminStats } from "@workspace/api-client-react";
import React from "react";
import { ActivityIndicator, Platform, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/components/StatCard";

export default function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, currency } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { data: stats, isLoading, refetch, isRefetching } = useGetAdminStats();

  const formatRevenue = () => {
    if (!stats) return "—";
    if (currency === "USD") return `$${Number(stats.revenueUSD ?? 0).toFixed(2)}`;
    return `SSP ${Number(stats.revenueSSP ?? 0).toLocaleString()}`;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
      }
    >
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.primary }]}>
        <View>
          <Text style={styles.headerGreeting}>Command Center</Text>
          <Text style={styles.headerName}>{user?.name ?? "Admin"}</Text>
        </View>
        <View style={[styles.adminBadge, { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: colors.radius }]}>
          <Feather name="shield" size={20} color="#fff" />
        </View>
      </View>

      <View style={{ paddingBottom: 100 }}>
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <StatCard label="Total Orders" value={stats?.totalOrders ?? 0} icon="shopping-bag" />
              <StatCard label="Revenue" value={formatRevenue()} icon="trending-up" accent />
              <StatCard label="Farmers" value={stats?.totalFarmers ?? 0} icon="sun" />
              <StatCard label="Retailers" value={stats?.totalRetailers ?? 0} icon="users" />
              <StatCard label="Pending" value={stats?.pendingOrders ?? 0} icon="clock" warning />
              <StatCard label="Active Orders" value={stats?.activeOrders ?? 0} icon="navigation" accent />
            </View>

            {(stats?.lowStockCount ?? 0) > 0 && (
              <View style={[styles.alertBanner, { backgroundColor: colors.warning + "18", borderColor: colors.warning + "40", borderRadius: colors.radius }]}>
                <Feather name="alert-triangle" size={20} color={colors.warning} />
                <Text style={[styles.alertText, { color: colors.warning }]}>
                  {stats?.lowStockCount} product{stats?.lowStockCount !== 1 ? "s" : ""} running low on stock
                </Text>
              </View>
            )}

            <View style={styles.summarySection}>
              <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Quick Summary</Text>
              {[
                { icon: "package", label: "Total Products Listed", value: stats?.totalProducts ?? 0 },
                { icon: "truck", label: "Active Trucks", value: stats?.trucksActive ?? 0 },
                { icon: "check-circle", label: "Delivered Today", value: stats?.deliveredToday ?? 0 },
              ].map(({ icon, label, value }) => (
                <View
                  key={label}
                  style={[styles.summaryRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
                >
                  <View style={[styles.summaryIcon, { backgroundColor: colors.primary + "15", borderRadius: 10 }]}>
                    <Feather name={icon as any} size={18} color={colors.primary} />
                  </View>
                  <Text style={[styles.summaryLabel, { color: colors.foreground }]}>{label}</Text>
                  <Text style={[styles.summaryValue, { color: colors.primary }]}>{value}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerGreeting: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  headerName: { color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 2 },
  adminBadge: { padding: 12 },
  loading: { padding: 80, alignItems: "center" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 14, paddingTop: 16 },
  alertBanner: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: 20, marginTop: 8, marginBottom: 8, padding: 14, borderWidth: 1 },
  alertText: { fontSize: 14, fontWeight: "600", flex: 1 },
  summarySection: { marginTop: 16, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderWidth: 1, marginBottom: 10 },
  summaryIcon: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  summaryLabel: { flex: 1, fontSize: 14, fontWeight: "500" },
  summaryValue: { fontSize: 18, fontWeight: "800" },
});
