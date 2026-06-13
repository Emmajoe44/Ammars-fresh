import { useState } from "react";
import { useLang } from "@/contexts/LangContext";
import { useCart } from "@/contexts/CartContext";
import { useListProducts, getListProductsQueryKey, useListCategories } from "@workspace/api-client-react";
import { AppLayout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Leaf, LayoutGrid, List, ShoppingBasket } from "lucide-react";
import { resolveImageSrc } from "@/lib/image-url";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { CurrencyToggle } from "@/components/retailer/CurrencyToggle";
import { RetailerProductCard } from "@/components/retailer/RetailerProductCard";
import { RETAILER_PAGE_SHELL, RETAILER_PRODUCT_GRID } from "@/components/retailer/product-grid";
import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext";
import { formatProductPrice, priceDisplayClassName } from "@/lib/format-price";
import { useExchangeRates } from "@/contexts/ExchangeRatesContext";

export default function RetailerProducts() {
  const { t, lang } = useLang();
  const { addItem } = useCart();
  const { toast } = useToast();
  const { currency } = useDisplayCurrency();
  const [rates] = useExchangeRates();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [view, setView] = useState<"grid" | "list">(() => {
    if (typeof window === "undefined") return "grid";
    return (localStorage.getItem("agrimarket_products_view") as "grid" | "list") || "grid";
  });
  const setViewPersist = (v: "grid" | "list") => {
    setView(v);
    if (typeof window !== "undefined") localStorage.setItem("agrimarket_products_view", v);
  };

  const params = {
    search: search || undefined,
    categoryId: selectedCategory,
    available: true,
  };

  const { data, isLoading } = useListProducts(params, {
    query: { queryKey: getListProductsQueryKey(params) },
  });
  const { data: categories } = useListCategories();

  const handleAddToCart = (product: NonNullable<typeof data>["products"][0]) => {
    addItem({
      productId: product.id,
      productName: product.name,
      quantity: 1,
      unit: product.unit,
      priceSSP: product.priceSSP,
      priceUSD: product.priceUSD,
      imageUrl: product.imageUrl,
    });
    toast({ title: t("Added to cart", "أضيف للسلة"), description: lang === "ar" ? product.nameAr : product.name });
  };

  return (
    <AppLayout>
      <div className={RETAILER_PAGE_SHELL}>
        <div className="mb-5">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground mb-4">{t("Browse Products", "تصفح المنتجات")}</h1>

          <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("Search products...", "ابحث عن منتجات...")}
                className="ps-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-products"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <CurrencyToggle />
              <div className="flex rounded-lg border border-border overflow-hidden shrink-0" role="group" aria-label={t("View mode", "وضع العرض")}>
                <button
                  onClick={() => setViewPersist("grid")}
                  className={`px-2.5 py-1.5 transition-colors ${view === "grid" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
                  aria-label={t("Grid view", "عرض الشبكة")}
                  data-testid="button-view-grid"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewPersist("list")}
                  className={`px-2.5 py-1.5 transition-colors ${view === "list" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
                  aria-label={t("List view", "عرض القائمة")}
                  data-testid="button-view-list"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!selectedCategory ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
              data-testid="button-filter-all"
            >
              {t("All", "الكل")}
            </button>
            {(categories ?? []).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? undefined : cat.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedCategory === cat.id ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
                data-testid={`button-filter-category-${cat.id}`}
              >
                {lang === "ar" ? cat.nameAr : cat.name}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className={view === "grid" ? RETAILER_PRODUCT_GRID : "flex flex-col gap-3"}>
            {[...Array(12)].map((_, i) => (
              <div key={i} className={view === "grid" ? "aspect-[3/4] bg-muted rounded-2xl animate-pulse" : "h-24 bg-muted rounded-2xl animate-pulse"} />
            ))}
          </div>
        ) : data?.products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Leaf className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="font-semibold text-foreground">{t("No products found", "لا توجد منتجات")}</p>
            <p className="text-sm text-muted-foreground">{t("Try a different search", "جرب بحثاً مختلفاً")}</p>
          </div>
        ) : view === "grid" ? (
          <div className={RETAILER_PRODUCT_GRID}>
            <AnimatePresence>
              {(data?.products ?? []).map((product, i) => (
                <RetailerProductCard key={product.id} product={product} index={i} onAdd={() => handleAddToCart(product)} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {(data?.products ?? []).map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-card border border-border rounded-2xl p-3 flex items-center gap-4"
                  data-testid={`card-product-${product.id}`}
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-primary/8 overflow-hidden flex-shrink-0">
                    {resolveImageSrc(product.imageUrl) ? (
                      <img src={resolveImageSrc(product.imageUrl)!} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Leaf className="w-7 h-7 text-primary/25" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 items-center">
                    <div>
                      <div className="flex items-start gap-2">
                        <p className="font-semibold text-sm text-foreground leading-tight truncate">
                          {lang === "ar" ? product.nameAr : product.name}
                        </p>
                        <Badge variant="outline" className="text-[10px] shrink-0">{product.qualityGrade}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{product.farmName ?? product.farmerName}</p>
                      <p className={`${priceDisplayClassName} mt-1`}>
                        {formatProductPrice(currency, product, product.unit, rates)}
                      </p>
                    </div>
                    <Button size="sm" className="justify-self-end" onClick={() => handleAddToCart(product)} data-testid={`button-add-cart-${product.id}`}>
                      <ShoppingBasket className="w-3.5 h-3.5 me-1.5" />
                      {t("Add", "أضف")}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
