"use client";

import { useRouter } from "next/navigation";
import { useListFeaturedProducts } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import { resolveImageSrc } from "@/lib/image-url";
import { useExchangeRates } from "@/contexts/ExchangeRatesContext";
import { formatPriceDisplay, priceDisplayClassName } from "@/lib/format-price";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, ShoppingBasket } from "lucide-react";

export function PublicProductShowcase() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const { push: setLocation } = useRouter();
  const { data: products, isLoading } = useListFeaturedProducts();
  const [rates] = useExchangeRates();

  const goShop = () => {
    if (user?.role === "retailer") {
      setLocation("/retailer/products");
      return;
    }
    setLocation("/login?role=retailer");
  };

  if (!isLoading && (!products || products.length === 0)) {
    return (
      <section id="products" className="py-16 lg:py-24 bg-background border-t border-border scroll-mt-28">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{t("Marketplace", "السوق")}</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            {t("Fresh from the farm", "طازج من المزرعة")}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            {t(
              "Featured products will appear here once farmers list produce.",
              "ستظهر المنتجات المميزة هنا عندما يضيف المزارعون منتجاتهم.",
            )}
          </p>
          <Button variant="outline" onClick={goShop} className="mt-6 font-semibold" data-testid="button-browse-products">
            {t("Browse all products", "تصفح كل المنتجات")}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-16 lg:py-24 bg-background border-t border-border scroll-mt-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{t("Marketplace", "السوق")}</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              {t("Fresh from the farm", "طازج من المزرعة")}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl">
              {t(
                "Browse available produce from verified farmers across South Sudan.",
                "تصفح المنتجات المتاحة من مزارعين موثوقين في جميع أنحاء جنوب السودان.",
              )}
            </p>
          </div>
          <Button variant="outline" onClick={goShop} className="shrink-0 font-semibold" data-testid="button-browse-products">
            {t("Browse all products", "تصفح كل المنتجات")}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(products ?? []).map((product, i) => {
              const imageSrc = resolveImageSrc(product.imageUrl);
              const name = lang === "ar" ? product.nameAr : product.name;
              return (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.35 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  data-testid={`landing-product-${product.id}`}
                >
                  <div className="aspect-[4/3] bg-primary/5 flex items-center justify-center overflow-hidden">
                    {imageSrc ? (
                      <img src={imageSrc} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <Leaf className="w-12 h-12 text-primary/25" />
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1 gap-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-sm text-foreground leading-snug line-clamp-2">{name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {product.farmName ?? product.farmerName ?? product.categoryName}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      <p className={`${priceDisplayClassName} pr-1 overflow-x-auto`}>
                        {formatPriceDisplay(product, rates, product.unit)}
                      </p>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold shrink-0">
                        {product.qualityGrade}
                      </span>
                    </div>
                    <Button size="sm" className="w-full mt-1" onClick={goShop} data-testid={`button-order-product-${product.id}`}>
                      <ShoppingBasket className="w-3.5 h-3.5 mr-1.5" />
                      {user?.role === "retailer"
                        ? t("View in shop", "عرض في المتجر")
                        : t("Sign in to order", "سجل للطلب")}
                    </Button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
