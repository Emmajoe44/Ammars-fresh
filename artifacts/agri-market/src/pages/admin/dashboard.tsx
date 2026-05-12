import { useLocation } from "wouter";
import { useLang } from "@/contexts/LangContext";
import { useGetAdminStats, getGetAdminStatsQueryKey, useGetDemandAnalytics, getGetDemandAnalyticsQueryKey, useGetLowStockAlerts, getGetLowStockAlertsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/Layout";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { motion } from "framer-motion";
import { ShoppingBag, Users, Truck, Package, TrendingUp, AlertTriangle, Clock, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const { t } = useLang();
  const { data: stats, isLoading } = useGetAdminStats({ query: { queryKey: getGetAdminStatsQueryKey() } });
  const { data: demand } = useGetDemandAnalytics({ days: 30 }, { query: { queryKey: getGetDemandAnalyticsQueryKey({ days: 30 }) } });
  const { data: lowStock } = useGetLowStockAlerts({ query: { queryKey: getGetLowStockAlertsQueryKey() } });
  const [, setLocation] = useLocation();

  const statCards = [
    { label: t("Total Orders", "إجمالي الطلبات"), value: stats?.totalOrders ?? 0, icon: ShoppingBag, color: "text-primary", bg: "bg-primary/10", href: "/admin/orders" },
    { label: t("Revenue (SSP)", "الإيرادات"), value: stats ? `SSP ${stats.revenueSSP.toLocaleString()}` : "0", icon: TrendingUp, color: "text-green-600", bg: "bg-green-100", href: "/admin/analytics" },
    { label: t("Active Trucks", "شاحنات نشطة"), value: stats?.trucksActive ?? 0, icon: Truck, color: "text-blue-600", bg: "bg-blue-100", href: "/admin/trucks" },
    { label: t("Pending Orders", "طلبات معلقة"), value: stats?.pendingOrders ?? 0, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100", href: "/admin/orders" },
    { label: t("Delivered Today", "تسليم اليوم"), value: stats?.deliveredToday ?? 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100", href: "/admin/orders" },
    { label: t("Farmers", "المزارعون"), value: stats?.totalFarmers ?? 0, icon: Users, color: "text-secondary", bg: "bg-secondary/10", href: "/admin/farmers" },
    { label: t("Retailers", "التجار"), value: stats?.totalRetailers ?? 0, icon: Users, color: "text-purple-600", bg: "bg-purple-100", href: "/admin/retailers" },
    { label: t("Low Stock Alerts", "تنبيهات المخزون"), value: stats?.lowStockCount ?? 0, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-100", href: "/admin/orders" },
  ];

  // Aggregate demand data for chart
  const chartData = demand?.reduce((acc, d) => {
    const existing = acc.find(a => a.date === d.date);
    if (existing) { existing.orders = (existing.orders || 0) + d.orderCount; }
    else { acc.push({ date: d.date.slice(5), orders: d.orderCount }); }
    return acc;
  }, [] as { date: string; orders: number }[]) ?? [];

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-extrabold text-foreground mb-6">{t("Command Center", "مركز القيادة")}</h1>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {statCards.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                  onClick={() => setLocation(s.href)}
                  className="bg-card border border-border rounded-2xl p-4 text-left hover:border-primary/40 hover:shadow-sm transition-all"
                  data-testid={`stat-card-${i}`}
                >
                  <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <p className={`font-extrabold text-lg ${isLoading ? "animate-pulse bg-muted rounded w-12 h-5" : ""}`}>
                    {isLoading ? "" : s.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </motion.button>
              );
            })}
          </div>

          {/* Demand chart */}
          {chartData.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5 mb-6">
              <h2 className="font-bold text-foreground mb-4">{t("Order Volume (Last 30 Days)", "حجم الطلبات (30 يوماً)")}</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                  <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Low stock alerts */}
          {lowStock && lowStock.length > 0 && (
            <div className="bg-card border border-red-200 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border-b border-red-100">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h2 className="font-bold text-red-700">{t("Low Stock Alerts", "تنبيهات المخزون المنخفض")}</h2>
                <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{lowStock.length}</span>
              </div>
              <div className="divide-y divide-border">
                {lowStock.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-3" data-testid={`low-stock-${p.id}`}>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.farmerName} · {p.categoryName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">{p.quantity} {p.unit}</p>
                      <p className="text-xs text-muted-foreground">{t("remaining", "متبقٍ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
