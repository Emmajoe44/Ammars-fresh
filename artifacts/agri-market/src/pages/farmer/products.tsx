import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import { useListProducts, getListProductsQueryKey, useToggleProductAvailability, useDeleteProduct } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Leaf, ToggleLeft, ToggleRight } from "lucide-react";
import { motion } from "framer-motion";

export default function FarmerProducts() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold text-foreground">{t("My Products", "منتجاتي")}</h1>
          <Button onClick={() => setLocation("/farmer/products/new")} size="sm" className="gap-1.5" data-testid="button-add-product">
            <Plus className="w-4 h-4" />
            {t("Add", "أضف")}
          </Button>
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
        ) : (
          <div className="space-y-3">
            {(data?.products ?? []).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3"
                data-testid={`product-card-${product.id}`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-6 h-6 text-primary/40" />
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
        )}
      </div>
    </AppLayout>
  );
}
