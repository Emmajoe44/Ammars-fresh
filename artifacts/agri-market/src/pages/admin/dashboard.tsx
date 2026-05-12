import { useLocation } from "wouter";
import { useLang } from "@/contexts/LangContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  useGetAdminStats,
  getGetAdminStatsQueryKey,
  useGetDemandAnalytics,
  getGetDemandAnalyticsQueryKey,
  useGetLowStockAlerts,
  getGetLowStockAlertsQueryKey,
  useListOrders,
  getListOrdersQueryKey,
  useListTrucks,
  getListTrucksQueryKey,
} from "@workspace/api-client-react";
import { AppLayout } from "@/components/Layout";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Users,
  Truck,
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Activity,
  DollarSign,
  Leaf,
  Plus,
  Tag,
  BarChart3,
  Eye,
  Sparkles,
} from "lucide-react";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: [string, string] }> = {
  pending: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500", label: ["Pending", "معلق"] },
  confirmed: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: ["Confirmed", "مؤكد"] },
  assigned: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500", label: ["Assigned", "مُعيَّن"] },
  in_transit: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500", label: ["In transit", "قيد النقل"] },
  delivered: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500", label: ["Delivered", "تم التسليم"] },
  cancelled: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", label: ["Cancelled", "ملغي"] },
};

function timeAgo(dateStr: string, lang: "en" | "ar"): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return lang === "ar" ? "الآن" : "just now";
  if (m < 60) return lang === "ar" ? `منذ ${m}د` : `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return lang === "ar" ? `منذ ${h}س` : `${h}h ago`;
  const d = Math.floor(h / 24);
  return lang === "ar" ? `منذ ${d}ي` : `${d}d ago`;
}

export default function AdminDashboard() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats, isLoading } = useGetAdminStats({ query: { queryKey: getGetAdminStatsQueryKey() } });
  const { data: demand } = useGetDemandAnalytics(
    { days: 30 },
    { query: { queryKey: getGetDemandAnalyticsQueryKey({ days: 30 }) } },
  );
  const { data: lowStock } = useGetLowStockAlerts({ query: { queryKey: getGetLowStockAlertsQueryKey() } });
  const { data: ordersData } = useListOrders(
    { limit: 6 },
    { query: { queryKey: getListOrdersQueryKey({ limit: 6 }) } },
  );
  const { data: trucks } = useListTrucks({ query: { queryKey: getListTrucksQueryKey() } });

  const recentOrders = (ordersData?.orders ?? []).slice(0, 5);
  const trucksTotal = trucks?.length ?? 0;
  const trucksAvailable = trucks?.filter((tr) => tr.status === "available").length ?? 0;

  // Aggregate demand by date for area chart
  const orderTrend =
    demand?.reduce((acc, d) => {
      const ex = acc.find((a) => a.date === d.date);
      if (ex) ex.orders += d.orderCount;
      else acc.push({ date: d.date.slice(5), orders: d.orderCount });
      return acc;
    }, [] as { date: string; orders: number }[]) ?? [];

  // Top 5 products by quantity
  const productAgg =
    demand?.reduce((acc, d) => {
      const ex = acc.find((a) => a.name === d.productName);
      if (ex) ex.quantity += d.quantity;
      else acc.push({ name: d.productName, quantity: d.quantity });
      return acc;
    }, [] as { name: string; quantity: number }[]) ?? [];
  const topProducts = productAgg.sort((a, b) => b.quantity - a.quantity).slice(0, 5);

  const totalOrders = stats?.totalOrders ?? 0;
  const aov = totalOrders > 0 ? (stats?.revenueSSP ?? 0) / totalOrders : 0;

  const heroKpis = [
    {
      label: t("Revenue", "الإيرادات"),
      value: `SSP ${(stats?.revenueSSP ?? 0).toLocaleString()}`,
      sub: stats?.revenueUSD ? `≈ $${stats.revenueUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—",
      icon: DollarSign,
      gradient: "from-emerald-500 to-green-600",
      shadow: "shadow-emerald-500/30",
    },
    {
      label: t("Total Orders", "إجمالي الطلبات"),
      value: totalOrders.toLocaleString(),
      sub: t(`${stats?.activeOrders ?? 0} active now`, `${stats?.activeOrders ?? 0} نشط الآن`),
      icon: ShoppingBag,
      gradient: "from-blue-500 to-indigo-600",
      shadow: "shadow-blue-500/30",
    },
    {
      label: t("Avg. Order Value", "متوسط قيمة الطلب"),
      value: `SSP ${aov.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      sub: t("All-time average", "المتوسط الكلي"),
      icon: TrendingUp,
      gradient: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-500/30",
    },
    {
      label: t("Fleet Utilization", "استخدام الأسطول"),
      value: trucksTotal > 0 ? `${Math.round(((stats?.trucksActive ?? 0) / trucksTotal) * 100)}%` : "—",
      sub: t(`${stats?.trucksActive ?? 0}/${trucksTotal} on duty`, `${stats?.trucksActive ?? 0}/${trucksTotal} في الخدمة`),
      icon: Truck,
      gradient: "from-purple-500 to-fuchsia-600",
      shadow: "shadow-purple-500/30",
    },
  ];

  const miniStats = [
    { label: t("Pending", "معلق"), value: stats?.pendingOrders ?? 0, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100", href: "/admin/orders" },
    { label: t("Delivered today", "تم التسليم اليوم"), value: stats?.deliveredToday ?? 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-100", href: "/admin/orders" },
    { label: t("Farmers", "المزارعون"), value: stats?.totalFarmers ?? 0, icon: Leaf, color: "text-emerald-600", bg: "bg-emerald-100", href: "/admin/farmers" },
    { label: t("Retailers", "التجار"), value: stats?.totalRetailers ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-100", href: "/admin/retailers" },
    { label: t("Products", "المنتجات"), value: stats?.totalProducts ?? 0, icon: Package, color: "text-indigo-600", bg: "bg-indigo-100", href: "/admin/products" },
    { label: t("Trucks available", "شاحنات متاحة"), value: trucksAvailable, icon: Truck, color: "text-purple-600", bg: "bg-purple-100", href: "/admin/trucks" },
  ];

  const quickActions = [
    { label: t("Add truck", "إضافة شاحنة"), icon: Plus, href: "/admin/trucks/add", tone: "bg-primary text-primary-foreground" },
    { label: t("Pricing rules", "قواعد التسعير"), icon: Tag, href: "/admin/pricing", tone: "bg-card border border-border text-foreground hover:bg-muted" },
    { label: t("Analytics", "التحليلات"), icon: BarChart3, href: "/admin/analytics", tone: "bg-card border border-border text-foreground hover:bg-muted" },
    { label: t("All orders", "كل الطلبات"), icon: Eye, href: "/admin/orders", tone: "bg-card border border-border text-foreground hover:bg-muted" },
  ];

  const today = new Date().toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20 md:pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              {t("Command Center", "مركز القيادة")}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              {t(`Welcome back, ${user?.name?.split(" ")[0] ?? "Admin"}`, `مرحباً بعودتك، ${user?.name?.split(" ")[0] ?? "أدمن"}`)}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {today} · {t("Here's what's happening across AgriMarket today", "إليك ما يحدث في أجريماركت اليوم")}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {quickActions.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.label}
                  onClick={() => setLocation(a.href)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow ${a.tone}`}
                  data-testid={`quick-action-${a.label}`}
                >
                  <Icon className="w-4 h-4" />
                  {a.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Hero KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {heroKpis.map((k, i) => {
            const Icon = k.icon;
            return (
              <motion.div
                key={k.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${k.gradient} p-5 text-white shadow-lg ${k.shadow}`}
              >
                <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
                <div className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-white/5" />
                <div className="relative flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/80">{k.label}</p>
                    <p className={`text-2xl font-extrabold tracking-tight ${isLoading ? "animate-pulse" : ""}`}>
                      {isLoading ? "—" : k.value}
                    </p>
                    <p className="text-[11px] font-medium text-white/80">{k.sub}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
          {miniStats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.button
                key={s.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.04 }}
                onClick={() => setLocation(s.href)}
                className="bg-card border border-border rounded-xl p-3.5 text-left hover:border-primary/40 hover:shadow-sm transition-all group"
                data-testid={`mini-stat-${s.label}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xl font-extrabold text-foreground leading-tight">{s.value}</p>
                <p className="text-[11px] font-medium text-muted-foreground mt-0.5">{s.label}</p>
              </motion.button>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Order volume */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-card border border-border rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  {t("Order volume", "حجم الطلبات")}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("Last 30 days", "آخر 30 يوماً")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{t("Total", "الإجمالي")}</p>
                <p className="text-lg font-extrabold text-foreground">
                  {orderTrend.reduce((s, p) => s + p.orders, 0)}
                </p>
              </div>
            </div>
            {orderTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={orderTrend} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#orderGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex flex-col items-center justify-center text-muted-foreground">
                <BarChart3 className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">{t("No data yet", "لا توجد بيانات بعد")}</p>
              </div>
            )}
          </motion.div>

          {/* Top products */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card border border-border rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  {t("Top products", "أفضل المنتجات")}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">{t("By volume", "حسب الحجم")}</p>
              </div>
            </div>
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="quantity" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex flex-col items-center justify-center text-muted-foreground">
                <Package className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm">{t("No data yet", "لا توجد بيانات بعد")}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Bottom row: Recent orders + Low stock */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent orders */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary" />
                {t("Recent orders", "أحدث الطلبات")}
              </h2>
              <button
                onClick={() => setLocation("/admin/orders")}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                data-testid="view-all-orders"
              >
                {t("View all", "عرض الكل")}
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
            {recentOrders.length > 0 ? (
              <div className="divide-y divide-border">
                {recentOrders.map((o) => {
                  const s = STATUS_STYLES[o.status] ?? STATUS_STYLES.pending;
                  return (
                    <button
                      key={o.id}
                      onClick={() => setLocation(`/admin/orders/${o.id}`)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors text-left"
                      data-testid={`recent-order-${o.id}`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        #{o.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {o.retailerName ?? t("Unknown retailer", "تاجر غير معروف")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {o.items.length} {t("items", "عناصر")} · {timeAgo(o.createdAt, lang)}
                          {o.truckPlate && <span> · {o.truckPlate}</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-bold text-foreground hidden sm:block">
                          SSP {o.totalSSP.toLocaleString()}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${s.bg} ${s.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {t(s.label[0], s.label[1])}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 py-12 text-center text-muted-foreground">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{t("No orders yet", "لا توجد طلبات بعد")}</p>
              </div>
            )}
          </motion.div>

          {/* Low stock */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-card border border-border rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-red-50 to-transparent">
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                {t("Low stock", "مخزون منخفض")}
              </h2>
              {lowStock && lowStock.length > 0 && (
                <span className="text-[11px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  {lowStock.length}
                </span>
              )}
            </div>
            {lowStock && lowStock.length > 0 ? (
              <div className="divide-y divide-border">
                {lowStock.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3" data-testid={`low-stock-${p.id}`}>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{p.farmerName}</p>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-sm font-extrabold text-red-600">
                        {p.quantity}
                        <span className="text-[10px] font-medium text-muted-foreground ml-0.5">{p.unit}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                        {t("left", "متبقٍ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-10 text-center text-muted-foreground">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-500/40" />
                <p className="text-sm font-semibold">{t("All stocked up", "كل شيء متوفر")}</p>
                <p className="text-xs mt-1">{t("No alerts right now", "لا تنبيهات حالياً")}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
