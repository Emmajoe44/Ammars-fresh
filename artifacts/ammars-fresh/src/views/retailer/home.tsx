import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import { useCart } from "@/contexts/CartContext";
import { useListCategories, useListFeaturedProducts, useListOrders, getListOrdersQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShoppingBasket, RefreshCw, ArrowRight, Carrot, Apple, Wheat, Sprout, Leaf, Package } from "lucide-react";
import { CurrencyToggle } from "@/components/retailer/CurrencyToggle";
import { RetailerProductCard } from "@/components/retailer/RetailerProductCard";
import { RETAILER_PAGE_SHELL, RETAILER_PRODUCT_GRID } from "@/components/retailer/product-grid";
import { formatOrderTotal } from "@/lib/format-price";
import { useExchangeRates } from "@/contexts/ExchangeRatesContext";
import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Carrot, Apple, Wheat, Bean: Sprout, Leaf, Database: Package,
};

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] ?? Leaf;
  return <Icon className={className} />;
}

export default function RetailerHome() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const { addItem } = useCart();
  const { push: setLocation } = useRouter();
  const [rates] = useExchangeRates();
  const { currency } = useDisplayCurrency();

  const { data: categories, isLoading: catsLoading } = useListCategories();
  const { data: featured, isLoading: featuredLoading } = useListFeaturedProducts();
  const { data: ordersData } = useListOrders({ status: "delivered" }, { query: { queryKey: getListOrdersQueryKey({ status: "delivered" }) } });

  const lastOrders = ordersData?.orders?.slice(0, 2) ?? [];

  return (
    <AppLayout>
      <div className={RETAILER_PAGE_SHELL}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
                {t("Good morning", "صباح الخير")}, {user?.name?.split(" ")[0]}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">{t("What are you buying today?", "ماذا تشتري اليوم؟")}</p>
            </div>
            <CurrencyToggle />
          </div>

          {/* Categories */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg text-foreground">{t("Categories", "الفئات")}</h2>
              <button onClick={() => setLocation("/retailer/products")} className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                {t("See all", "عرض الكل")} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {catsLoading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {(categories ?? []).map((cat, i) => (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setLocation(`/retailer/products?categoryId=${cat.id}`)}
                    className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-2xl hover:border-primary/40 hover:bg-primary/5 transition-all"
                    data-testid={`button-category-${cat.id}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <CategoryIcon name={cat.icon} className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-foreground leading-tight">{lang === "ar" ? cat.nameAr : cat.name}</p>
                      <p className="text-[10px] text-muted-foreground">{cat.productCount} {t("items", "منتج")}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </section>

          {/* Order Again */}
          {lastOrders.length > 0 && (
            <section className="mb-8">
              <h2 className="font-bold text-lg text-foreground flex items-center gap-2 mb-3">
                <RefreshCw className="w-4 h-4 text-primary" />
                {t("Order Again", "اطلب مجدداً")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lastOrders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setLocation(`/retailer/orders/${order.id}`)}
                    className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:border-primary/40 transition-all text-start"
                    data-testid={`button-reorder-${order.id}`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t("Order", "طلب")} #{order.id} — {order.items?.length ?? 0} {t("items", "منتجات")}
                      </p>
                      <p className="text-sm text-primary font-bold mt-0.5">
                        {formatOrderTotal(
                          (order.currency as "SSP" | "USD" | "USG") ?? currency,
                          order.totalSSP ?? 0,
                          order.totalUSD ?? 0,
                          rates,
                        )}
                      </p>
                    </div>
                    <ShoppingBasket className="w-5 h-5 text-primary shrink-0" />
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Featured Products */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-foreground">{t("Featured Products", "منتجات مميزة")}</h2>
              <button onClick={() => setLocation("/retailer/products")} className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                {t("View all", "عرض الكل")} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {featuredLoading ? (
              <div className={RETAILER_PRODUCT_GRID}>
                {[...Array(8)].map((_, i) => <div key={i} className="aspect-[3/4] bg-muted rounded-2xl animate-pulse" />)}
              </div>
            ) : (
              <div className={RETAILER_PRODUCT_GRID}>
                {(featured ?? []).map((product, i) => (
                  <RetailerProductCard
                    key={product.id}
                    product={product}
                    index={i}
                    compact
                    onAdd={() => {
                      addItem({
                        productId: product.id,
                        productName: product.name,
                        quantity: 1,
                        unit: product.unit,
                        priceSSP: product.priceSSP,
                        priceUSD: product.priceUSD,
                        imageUrl: product.imageUrl,
                      });
                      setLocation("/retailer/cart");
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </motion.div>
      </div>
    </AppLayout>
  );
}
