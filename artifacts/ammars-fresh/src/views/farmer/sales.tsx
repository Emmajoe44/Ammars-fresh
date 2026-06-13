import { useLang } from "@/contexts/LangContext";
import { useGetFarmerStats, getGetFarmerStatsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/Layout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, Package, DollarSign, ShoppingBag, PieChart as PieIcon, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#f59e0b", "#3b82f6", "#8b5cf6", "#ef4444", "#10b981"];

export default function FarmerSales() {
  const { t } = useLang();
  const { data: stats, isLoading } = useGetFarmerStats({ query: { queryKey: getGetFarmerStatsQueryKey() } });

  const chartData =
    stats?.topProducts.map((p) => ({
      name: p.productName.length > 12 ? `${p.productName.slice(0, 12)}…` : p.productName,
      SSP: p.totalSSP,
      USD: p.totalUSD,
    })) ?? [];

  const statCards = [
    {
      label: t("Total Sales (SSP)", "إجمالي المبيعات"),
      value: stats ? `SSP ${stats.totalSalesSSP.toLocaleString()}` : "SSP 0",
      icon: DollarSign,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: t("Sales (USD)", "المبيعات بالدولار"),
      value: stats ? `$${stats.totalSalesUSD.toFixed(2)}` : "$0.00",
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: t("Sales (USG)", "المبيعات بالشلن"),
      value: stats ? `USG ${stats.totalSalesUSG.toLocaleString()}` : "USG 0",
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      label: t("Orders This Month", "طلبات الشهر"),
      value: stats?.ordersThisMonth ?? 0,
      icon: ShoppingBag,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      label: t("Active Products", "منتجات نشطة"),
      value: stats?.activeProducts ?? 0,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-6 pb-20 md:pb-8 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">{t("Sales Dashboard", "لوحة المبيعات")}</h1>
              <p className="text-sm text-muted-foreground">{t("Revenue and product performance", "الإيرادات وأداء المنتجات")}</p>
            </div>
          </div>

          {/* Stats — single row */}
          <div className="bg-card border border-border rounded-2xl p-3 mb-6 overflow-x-auto">
            <div className="grid grid-cols-5 gap-2 min-w-[640px] sm:min-w-0">
              {statCards.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col items-center text-center px-2 py-3 rounded-xl bg-muted/30"
                    data-testid={`sales-stat-${i}`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}>
                      <Icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                    <p
                      className={`font-extrabold text-base sm:text-lg tabular-nums leading-tight ${
                        isLoading ? "animate-pulse bg-muted rounded w-12 h-6" : "text-foreground"
                      }`}
                    >
                      {isLoading ? "" : s.value}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-snug line-clamp-2">
                      {s.label}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {chartData.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-card border border-border rounded-2xl p-4">
                  <h2 className="font-bold text-foreground mb-4">{t("Revenue by Product (SSP)", "الإيرادات حسب المنتج")}</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                        }}
                        formatter={(v: number) => `SSP ${v.toLocaleString()}`}
                      />
                      <Bar dataKey="SSP" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-card border border-border rounded-2xl p-4">
                  <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-primary" />
                    {t("Revenue Share", "حصة الإيرادات")}
                  </h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="SSP"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        innerRadius={38}
                        paddingAngle={2}
                      >
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                        }}
                        formatter={(v: number) => `SSP ${v.toLocaleString()}`}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} iconSize={10} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h2 className="font-bold text-foreground">{t("Top Selling Products", "أكثر المنتجات مبيعاً")}</h2>
                </div>
                <div className="divide-y divide-border">
                  {stats!.topProducts.map((p, i) => (
                    <div key={p.productId} className="flex items-center justify-between px-4 py-3" data-testid={`top-product-${i}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-bold text-muted-foreground text-sm w-6 shrink-0">#{i + 1}</span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{p.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.totalQuantity} {t("sold", "مباع")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-bold text-primary">SSP {p.totalSSP.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          ${p.totalUSD.toFixed(2)} · USG {p.totalUSG.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-card border border-border rounded-2xl text-muted-foreground">
              <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium text-foreground">{t("No sales data yet", "لا توجد بيانات مبيعات بعد")}</p>
              <p className="text-sm mt-1">{t("Sales charts appear once retailers place orders for your products.", "تظهر الرسوم البيانية عندما يطلب التجار منتجاتك.")}</p>
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
