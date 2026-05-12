import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import { useListProducts, getListProductsQueryKey, useToggleProductAvailability, useDeleteProduct } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Leaf, ToggleLeft, ToggleRight, LayoutGrid, List } from "lucide-react";
import { resolveImageSrc } from "@/lib/image-url";
import { motion } from "framer-motion";

export default function FarmerProducts() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [view, setView] = useState<"grid" | "list">(() => {
    if (typeof window === "undefined") return "list";
    return (localStorage.getItem("agrimarket_products_view") as "grid" | "list") || "list";
  });
  const setViewPersist = (v: "grid" | "list") => {
    setView(v);
    if (typeof window !== "undefined") localStorage.setItem("agrimarket_products_view", v);
  };

  const params = { farmerId: user?.id };
  const { data, isLoading } = useListProducts(params, { query: { queryKey: getListProductsQueryKey(params) } });
  const toggleAvail = useToggleProductAvailability();
  const deleteProduct = useDeleteProduct();

  const handleToggle = (id: number) => {
    toggleAvail.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey(params) });
        toast({ title: t("Availability updated", "تم تحديث التوفر") });
      },
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(t(`Delete "${name}"?`, `حذف "${name}"؟`))) return;
    deleteProduct.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey(params) });
        toast({ title: t("Product deleted", "تم حذف المنتج") });
      },
    });
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 pb-20 md:pb-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4 gap-2">
          <h1 className="text-2xl font-extrabold text-foreground">{t("My Products", "منتجاتي")}</h1>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border overflow-hidden" role="group" aria-label={t("View mode", "وضع العرض")}>
              <button
                onClick={() => setViewPersist("grid")}
                className={`px-2.5 py-1.5 transition-colors ${view === "grid" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
                aria-label={t("Grid view", "عرض الشبكة")}
                title={t("Grid view", "عرض الشبكة")}
                data-testid="button-view-grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewPersist("list")}
                className={`px-2.5 py-1.5 transition-colors ${view === "list" ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
                aria-label={t("List view", "عرض القائمة")}
                title={t("List view", "عرض القائمة")}
                data-testid="button-view-list"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <Button onClick={() => setLocation("/farmer/products/new")} size="sm" className="gap-1.5" data-testid="button-add-product">
              <Plus className="w-4 h-4" />
              {t("Add", "أضف")}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />)}</div>
        ) : data?.products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Leaf className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="font-semibold text-foreground mb-2">{t("No products yet", "لا توجد منتجات")}</p>
            <Button onClick={() => setLocation("/farmer/products/new")} data-testid="button-add-first-product">
              {t("Add your first product", "أضف منتجك الأول")}
            </Button>
          </div>
        ) : view === "list" ? (
          <div className="space-y-3">
            {(data?.products ?? []).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3"
                data-testid={`product-card-${product.id}`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {resolveImageSrc(product.imageUrl) ? (
                    <img src={resolveImageSrc(product.imageUrl)!} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Leaf className="w-6 h-6 text-primary/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-foreground truncate">{lang === "ar" ? product.nameAr : product.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${product.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {product.available ? t("Active", "نشط") : t("Sold Out", "نفد")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{product.quantity} {product.unit} · SSP {product.priceSSP?.toLocaleString()}/{product.unit}</p>
                  <p className="text-xs text-muted-foreground">{product.categoryName} · Grade {product.qualityGrade}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleToggle(product.id)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    data-testid={`button-toggle-${product.id}`}
                    title={product.available ? t("Mark as sold out", "تحديد كنافد") : t("Mark as available", "تحديد كمتاح")}
                  >
                    {product.available ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                  </button>
                  <button
                    onClick={() => setLocation(`/farmer/products/${product.id}/edit`)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    data-testid={`button-edit-${product.id}`}
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                    data-testid={`button-delete-${product.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {(data?.products ?? []).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-card border border-border rounded-2xl p-3 flex flex-col gap-2"
                data-testid={`product-card-${product.id}`}
              >
                <div className="w-full h-24 rounded-xl bg-primary/8 flex items-center justify-center overflow-hidden">
                  {resolveImageSrc(product.imageUrl) ? (
                    <img src={resolveImageSrc(product.imageUrl)!} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Leaf className="w-8 h-8 text-primary/30" />
                  )}
                </div>
                <div className="flex items-start justify-between gap-1">
                  <p className="font-semibold text-sm text-foreground leading-tight truncate">{lang === "ar" ? product.nameAr : product.name}</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${product.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {product.available ? t("Active", "نشط") : t("Out", "نفد")}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{product.quantity} {product.unit} · Grade {product.qualityGrade}</p>
                <p className="text-primary font-bold text-sm">SSP {product.priceSSP?.toLocaleString()}/{product.unit}</p>
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <button onClick={() => handleToggle(product.id)} className="p-1.5 rounded-lg hover:bg-muted" data-testid={`button-toggle-grid-${product.id}`} title={product.available ? t("Mark as sold out", "تحديد كنافد") : t("Mark as available", "تحديد كمتاح")}>
                    {product.available ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                  </button>
                  <button onClick={() => setLocation(`/farmer/products/${product.id}/edit`)} className="p-1.5 rounded-lg hover:bg-muted" data-testid={`button-edit-grid-${product.id}`}>
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button onClick={() => handleDelete(product.id, product.name)} className="p-1.5 rounded-lg hover:bg-destructive/10" data-testid={`button-delete-grid-${product.id}`}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
