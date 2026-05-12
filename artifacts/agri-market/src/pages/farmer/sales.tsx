import { useLang } from "@/contexts/LangContext";
import { useGetFarmerStats, getGetFarmerStatsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/Layout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, Package, DollarSign, ShoppingBag } from "lucide-react";

export default function FarmerSales() {
  const { t } = useLang();
  const { data: stats, isLoading } = useGetFarmerStats({ query: { queryKey: getGetFarmerStatsQueryKey() } });

  const chartData = stats?.topProducts.map(p => ({
    name: p.productName.length > 12 ? p.productName.slice(0, 12) + "..." : p.productName,
    SSP: p.totalSSP,
    USD: p.totalUSD,
  })) ?? [];

  return (
    <AppLayout>
      <div className="p-4 md:p-6 pb-20 md:pb-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-extrabold text-foreground mb-5">{t("Sales Dashboard", "لوحة المبيعات")}</h1>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: t("Total Sales (SSP)", "إجمالي المبيعات"), value: `SSP ${(stats?.totalSalesSSP ?? 0).toLocaleString()}`, icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
            { label: t("Sales (USD)", "المبيعات بالدولار"), value: `$${(stats?.totalSalesUSD ?? 0).toFixed(2)}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
            { label: t("Orders This Month", "طلبات الشهر"), value: stats?.ordersThisMonth ?? 0, icon: ShoppingBag, color: "text-secondary", bg: "bg-secondary/10" },
            { label: t("Active Products", "منتجات نشطة"), value: stats?.activeProducts ?? 0, icon: Package, color: "text-blue-600", bg: "bg-blue-100" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-card border border-border rounded-2xl p-4" data-testid={`sales-stat-${i}`}>
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <p className={`font-extrabold text-lg ${isLoading ? "animate-pulse bg-muted rounded w-16 h-5" : ""}`}>{isLoading ? "" : s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Top products chart */}
        {chartData.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-4 mb-6">
            <h2 className="font-bold text-foreground mb-4">{t("Revenue by Product (SSP)", "الإيرادات حسب المنتج")}</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                <Bar dataKey="SSP" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top products table */}
        {stats?.topProducts && stats.topProducts.length > 0 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="font-bold text-foreground">{t("Top Selling Products", "أكثر المنتجات مبيعاً")}</h2>
            </div>
            <div className="divide-y divide-border">
              {stats.topProducts.map((p, i) => (
                <div key={p.productId} className="flex items-center justify-between px-4 py-3" data-testid={`top-product-${i}`}>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-muted-foreground text-sm w-6">#{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{p.productName}</p>
                      <p className="text-xs text-muted-foreground">{p.totalQuantity} kg sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">SSP {p.totalSSP.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">${p.totalUSD.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
