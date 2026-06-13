import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import { useGetFarmerStats, getGetFarmerStatsQueryKey, useListProducts, getListProductsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Plus, TrendingUp, Package, ShoppingBag, BarChart3, Leaf, Tractor } from "lucide-react";
import { ProfileAvatar } from "@/components/ProfilePhotoUpload";
import { resolveImageSrc } from "@/lib/image-url";

export default function FarmerHome() {
  const { user } = useAuth();
  const { t } = useLang();
  const { push: setLocation } = useRouter();

  const { data: stats, isLoading } = useGetFarmerStats({ query: { queryKey: getGetFarmerStatsQueryKey() } });
  const { data: products } = useListProducts(
    { farmerId: user?.id, available: true },
    { query: { queryKey: getListProductsQueryKey({ farmerId: user?.id, available: true }) } },
  );

  const statCards = [
    {
      label: t("Total Products", "إجمالي المنتجات"),
      value: stats?.totalProducts ?? 0,
      icon: Package,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: t("Active Products", "منتجات نشطة"),
      value: stats?.activeProducts ?? 0,
      icon: Leaf,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: t("Orders This Month", "طلبات الشهر"),
      value: stats?.ordersThisMonth ?? 0,
      icon: ShoppingBag,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      label: t("Revenue (SSP)", "الإيرادات (جنيه)"),
      value: stats ? `SSP ${stats.totalSalesSSP.toLocaleString()}` : "SSP 0",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-6 pb-20 md:pb-8 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 min-w-0">
              <ProfileAvatar
                avatarUrl={user?.avatarUrl}
                fallbackIcon={<Tractor className="w-7 h-7 text-primary" />}
              />
              <div className="min-w-0">
                <h1 className="text-2xl font-extrabold text-foreground truncate">{t("My Farm", "مزرعتي")}</h1>
                <p className="text-muted-foreground text-sm truncate">{user?.farmName ?? user?.name}</p>
              </div>
            </div>
            <Button onClick={() => setLocation("/farmer/products/new")} className="gap-2 shrink-0" data-testid="button-add-product">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t("Add Product", "أضف منتجاً")}</span>
              <span className="sm:hidden">{t("Add", "إضافة")}</span>
            </Button>
          </div>

          {/* Stats — single row */}
          <div className="bg-card border border-border rounded-2xl p-3 mb-6 overflow-x-auto">
            <div className="grid grid-cols-4 gap-2 min-w-[520px] sm:min-w-0">
              {statCards.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col items-center text-center px-2 py-3 rounded-xl bg-muted/30"
                    data-testid={`stat-card-${i}`}
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
                        <p className="text-xs text-muted-foreground">
                          {p.totalQuantity} {t("sold", "مباع")}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-primary">SSP {p.totalSSP?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-foreground">{t("Active Listings", "القوائم النشطة")}</h2>
              <button
                type="button"
                onClick={() => setLocation("/farmer/products")}
                className="text-primary text-sm font-medium hover:underline"
              >
                {t("Manage all", "إدارة الكل")}
              </button>
            </div>
            {(products?.products ?? []).slice(0, 3).map((p) => {
              const imageSrc = resolveImageSrc(p.imageUrl);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-card border border-border rounded-xl mb-2"
                  data-testid={`listing-${p.id}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                      {imageSrc ? (
                        <img src={imageSrc} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <Leaf className="w-5 h-5 text-primary/50" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.quantity} {p.unit} · SSP {p.priceSSP?.toLocaleString()}/{p.unit}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700 shrink-0">
                    {t("Active", "نشط")}
                  </span>
                </div>
              );
            })}
            {(products?.products ?? []).length === 0 && (
              <div className="text-center py-8 bg-card border border-border rounded-xl text-muted-foreground text-sm">
                <p>{t("No active listings yet", "لا توجد قوائم نشطة بعد")}</p>
                <Button variant="link" className="mt-1" onClick={() => setLocation("/farmer/products/new")}>
                  {t("Add your first product", "أضف منتجك الأول")}
                </Button>
              </div>
            )}
          </section>
        </motion.div>
      </div>
    </AppLayout>
  );
}
