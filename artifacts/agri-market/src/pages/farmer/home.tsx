import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import { useGetFarmerStats, getGetFarmerStatsQueryKey, useListProducts, getListProductsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Plus, TrendingUp, Package, ShoppingBag, BarChart3, Leaf } from "lucide-react";

export default function FarmerHome() {
  const { user } = useAuth();
  const { t } = useLang();
  const [, setLocation] = useLocation();

  const { data: stats, isLoading } = useGetFarmerStats({ query: { queryKey: getGetFarmerStatsQueryKey() } });
  const { data: products } = useListProducts(
    { farmerId: user?.id, available: true },
    { query: { queryKey: getListProductsQueryKey({ farmerId: user?.id, available: true }) } }
  );

  const statCards = [
    { label: t("Total Products", "إجمالي المنتجات"), value: stats?.totalProducts ?? 0, icon: Package, color: "text-primary", bg: "bg-primary/10" },
    { label: t("Active Products", "منتجات نشطة"), value: stats?.activeProducts ?? 0, icon: Leaf, color: "text-green-600", bg: "bg-green-100" },
    { label: t("Orders This Month", "طلبات الشهر"), value: stats?.ordersThisMonth ?? 0, icon: ShoppingBag, color: "text-secondary", bg: "bg-secondary/10" },
    { label: t("Revenue (SSP)", "الإيرادات"), value: stats ? `SSP ${stats.totalSalesSSP.toLocaleString()}` : "0", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-100" },
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-6 pb-20 md:pb-8 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">{t("My Farm", "مزرعتي")}</h1>
              <p className="text-muted-foreground text-sm">{user?.farmName ?? user?.name}</p>
            </div>
            <Button onClick={() => setLocation("/farmer/products/new")} className="gap-2" data-testid="button-add-product">
              <Plus className="w-4 h-4" />
              {t("Add Product", "أضف منتجاً")}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {statCards.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
                  className="bg-card border border-border rounded-2xl p-4"
                  data-testid={`stat-card-${i}`}
                >
                  <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <p className={`font-extrabold text-xl ${isLoading ? "animate-pulse bg-muted rounded w-16 h-6" : ""}`}>
                    {isLoading ? "" : s.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Top products */}
          {stats?.topProducts && stats.topProducts.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  {t("Top Products", "أفضل المنتجات")}
                </h2>
              </div>
              <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                {stats.topProducts.map((p, i) => (
                  <div key={p.productId} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-muted-foreground w-5">#{i + 1}</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{p.productName}</p>
                        <p className="text-xs text-muted-foreground">{p.totalQuantity} kg {t("sold", "مباع")}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-primary">SSP {p.totalSSP?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Active products quick view */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-foreground">{t("Active Listings", "القوائم النشطة")}</h2>
              <button onClick={() => setLocation("/farmer/products")} className="text-primary text-sm font-medium hover:underline">
                {t("Manage all", "إدارة الكل")}
              </button>
            </div>
            {(products?.products ?? []).slice(0, 3).map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-card border border-border rounded-xl mb-2" data-testid={`listing-${p.id}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-primary/50" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.quantity} {p.unit} · SSP {p.priceSSP?.toLocaleString()}/{p.unit}</p>
                  </div>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">{t("Active", "نشط")}</span>
              </div>
            ))}
          </section>
        </motion.div>
      </div>
    </AppLayout>
  );
}
