import { useState } from "react";
import { useLocation } from "wouter";
import { useLang } from "@/contexts/LangContext";
import { useCart } from "@/contexts/CartContext";
import { useListProducts, getListProductsQueryKey, useListCategories } from "@workspace/api-client-react";
import { AppLayout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingBasket, Leaf, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function RetailerProducts() {
  const { t, lang } = useLang();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [currency, setCurrency] = useState<"SSP" | "USD">("SSP");

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
    });
    toast({ title: t("Added to cart", "أضيف للسلة"), description: lang === "ar" ? product.nameAr : product.name });
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 pb-20 md:pb-8 max-w-2xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-extrabold text-foreground mb-3">{t("Browse Products", "تصفح المنتجات")}</h1>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("Search products...", "ابحث عن منتجات...")}
              className="pl-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
              data-testid="input-search-products"
            />
          </div>

          {/* Currency toggle */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-muted-foreground">{t("Price in:", "السعر بـ:")}</span>
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(["SSP", "USD"] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${currency === c ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
                  data-testid={`button-currency-${c.toLowerCase()}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!selectedCategory ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}
              data-testid="button-filter-all"
            >
              {t("All", "الكل")}
            </button>
            {(categories ?? []).map(cat => (
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
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-2xl animate-pulse" />)}
          </div>
        ) : data?.products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Leaf className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="font-semibold text-foreground">{t("No products found", "لا توجد منتجات")}</p>
            <p className="text-sm text-muted-foreground">{t("Try a different search", "جرب بحثاً مختلفاً")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence>
              {(data?.products ?? []).map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3"
                  data-testid={`card-product-${product.id}`}
                >
                  <div className="w-full h-20 rounded-xl bg-primary/8 flex items-center justify-center">
                    <Leaf className="w-8 h-8 text-primary/25" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-semibold text-sm text-foreground leading-tight">{lang === "ar" ? product.nameAr : product.name}</p>
                      <Badge variant="outline" className="text-[10px] flex-shrink-0">{product.qualityGrade}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{product.farmName ?? product.farmerName}</p>
                    <p className="text-xs text-muted-foreground">{product.quantity} {product.unit} {t("available", "متاح")}</p>
                    <p className="text-primary font-bold text-sm mt-1.5">
                      {currency === "SSP" ? `SSP ${product.priceSSP?.toLocaleString()}` : `$${product.priceUSD?.toFixed(2)}`}/{product.unit}
                    </p>
                  </div>
                  <Button size="sm" className="w-full" onClick={() => handleAddToCart(product)} data-testid={`button-add-cart-${product.id}`}>
                    <ShoppingBasket className="w-3.5 h-3.5 mr-1.5" />
                    {t("Add", "أضف")}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
