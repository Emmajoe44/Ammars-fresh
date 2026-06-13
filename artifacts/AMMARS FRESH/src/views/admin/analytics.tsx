import { useState } from "react";
import { useLang } from "@/contexts/LangContext";
import { useGetDemandAnalytics, getGetDemandAnalyticsQueryKey, useGetAdminStats, getGetAdminStatsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/Layout";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from "recharts";
import { BarChart3, TrendingUp, ShoppingBag, Users } from "lucide-react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#3b82f6", "#8b5cf6", "#ec4899", "#f97316"];

export default function AdminAnalytics() {
  const { t } = useLang();
  const [days, setDays] = useState(30);

  const { data: demand, isLoading } = useGetDemandAnalytics({ days }, { query: { queryKey: getGetDemandAnalyticsQueryKey({ days }) } });
  const { data: stats } = useGetAdminStats({ query: { queryKey: getGetAdminStatsQueryKey() } });

  // Aggregate by date
  const byDate = demand?.reduce((acc, d) => {
    const ex = acc.find(a => a.date === d.date);
    if (ex) { ex.orders = (ex.orders || 0) + d.orderCount; ex.quantity = (ex.quantity || 0) + d.quantity; }
    else { acc.push({ date: d.date.slice(5), orders: d.orderCount, quantity: d.quantity }); }
    return acc;
  }, [] as { date: string; orders: number; quantity: number }[]) ?? [];

  // Aggregate by product
  const byProduct = demand?.reduce((acc, d) => {
    const ex = acc.find(a => a.name === d.productName);
    if (ex) { ex.orders += d.orderCount; ex.quantity += d.quantity; }
    else { acc.push({ name: d.productName, orders: d.orderCount, quantity: d.quantity }); }
    return acc;
  }, [] as { name: string; orders: number; quantity: number }[])?.sort((a, b) => b.orders - a.orders).slice(0, 6) ?? [];

  const pieData = byProduct.slice(0, 5).map(p => ({ name: p.name.slice(0, 12), value: p.orders }));

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-extrabold text-foreground">{t("Demand Analytics", "تحليلات الطلب")}</h1>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setDays(d)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${days === d ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
                data-testid={`button-days-${d}`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Revenue summary */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
            {[
              { label: t("Revenue SSP", "إيرادات بالجنيه"), value: `SSP ${(stats.revenueSSP ?? 0).toLocaleString()}`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
              { label: t("Revenue USD", "إيرادات بالدولار"), value: `$${(stats.revenueUSD ?? 0).toFixed(2)}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
              { label: t("Revenue USG", "إيرادات بالجنيه القديم"), value: `USG ${(stats.revenueUSG ?? 0).toLocaleString()}`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-100" },
              { label: t("Total Orders", "إجمالي الطلبات"), value: stats.totalOrders, icon: ShoppingBag, color: "text-secondary", bg: "bg-secondary/10" },
              { label: t("Total Products", "إجمالي المنتجات"), value: stats.totalProducts, icon: BarChart3, color: "text-blue-600", bg: "bg-blue-100" },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-card border border-border rounded-2xl p-4" data-testid={`analytics-stat-${i}`}>
                  <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                    <Icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <p className="font-extrabold text-lg">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Order volume line chart */}
        {byDate.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5 mb-5">
            <h2 className="font-bold text-foreground mb-4">{t("Order Volume Over Time", "حجم الطلبات عبر الزمن")}</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={byDate} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top products bar + pie */}
        {byProduct.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="font-bold text-foreground mb-4">{t("Top Products by Orders", "أفضل المنتجات حسب الطلبات")}</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={byProduct} layout="vertical" margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={80} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="font-bold text-foreground mb-4">{t("Order Share", "حصة الطلبات")}</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-52 bg-muted rounded-2xl animate-pulse" />)}
          </div>
        )}

        {!isLoading && byDate.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="font-semibold text-foreground">{t("No data yet", "لا توجد بيانات")}</p>
            <p className="text-sm text-muted-foreground">{t("Data will appear once orders are placed", "ستظهر البيانات بمجرد تقديم الطلبات")}</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
