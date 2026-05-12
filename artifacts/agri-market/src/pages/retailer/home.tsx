import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import { useCart } from "@/contexts/CartContext";
import { useListCategories, useListFeaturedProducts, useListOrders, getListOrdersQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShoppingBasket, RefreshCw, ArrowRight, Carrot, Apple, Wheat, Sprout, Leaf, Package } from "lucide-react";

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
  const [, setLocation] = useLocation();

  const { data: categories, isLoading: catsLoading } = useListCategories();
  const { data: featured, isLoading: featuredLoading } = useListFeaturedProducts();
  const { data: ordersData } = useListOrders({ status: "delivered" }, { query: { queryKey: getListOrdersQueryKey({ status: "delivered" }) } });

  const lastOrders = ordersData?.orders?.slice(0, 2) ?? [];

  return (
    <AppLayout>
      <div className="p-4 md:p-6 pb-20 md:pb-8 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-foreground">
              {t("Good morning", "صباح الخير")}, {user?.name?.split(" ")[0]}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{t("What are you buying today?", "ماذا تشتري اليوم؟")}</p>
          </div>

          {/* Categories */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-foreground">{t("Categories", "الفئات")}</h2>
              <button onClick={() => setLocation("/retailer/products")} className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                {t("See all", "عرض الكل")} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {catsLoading ? (
              <div className="grid grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {(categories ?? []).map((cat, i) => (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setLocation(`/retailer/products?categoryId=${cat.id}`)}
                    className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-2xl hover:border-primary/40 hover:bg-primary/5 transition-all"
                    data-testid={`button-category-${cat.id}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <CategoryIcon name={cat.icon} className="w-5 h-5 text-primary" />
                    </div>
                    <div>
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
            <section className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-primary" />
                  {t("Order Again", "اطلب مجدداً")}
                </h2>
              </div>
              <div className="space-y-2">
                {lastOrders.map(order => (
                  <button
                    key={order.id}
                    onClick={() => setLocation(`/retailer/orders/${order.id}`)}
                    className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:border-primary/40 transition-all"
                    data-testid={`button-reorder-${order.id}`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t("Order", "طلب")} #{order.id} — {order.items?.length ?? 0} {t("items", "منتجات")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {order.currency === "SSP" ? `SSP ${order.totalSSP?.toLocaleString()}` : `$${order.totalUSD?.toFixed(2)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShoppingBasket className="w-4 h-4 text-primary" />
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Featured Products */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-foreground">{t("Featured Products", "منتجات مميزة")}</h2>
              <button onClick={() => setLocation("/retailer/products")} className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                {t("View all", "عرض الكل")} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {featuredLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-muted rounded-2xl animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {(featured ?? []).slice(0, 6).map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3"
                    data-testid={`card-product-${product.id}`}
                  >
                    <div className="w-full h-24 rounded-xl bg-primary/8 flex items-center justify-center">
                      <Leaf className="w-10 h-10 text-primary/30" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-foreground leading-tight">{lang === "ar" ? product.nameAr : product.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{product.farmName ?? product.farmerName}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-primary font-bold text-sm">SSP {product.priceSSP?.toLocaleString()}/{product.unit}</span>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{product.qualityGrade}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        addItem({ productId: product.id, productName: product.name, quantity: 1, unit: product.unit, priceSSP: product.priceSSP, priceUSD: product.priceUSD });
                        setLocation("/retailer/cart");
                      }}
                      data-testid={`button-add-to-cart-${product.id}`}
                    >
                      <ShoppingBasket className="w-3.5 h-3.5 mr-1.5" />
                      {t("Add to Cart", "أضف للسلة")}
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </motion.div>
      </div>
    </AppLayout>
  );
}
