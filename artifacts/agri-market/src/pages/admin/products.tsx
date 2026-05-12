import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useLang } from "@/contexts/LangContext";
import {
  useListProducts,
  getListProductsQueryKey,
  useListCategories,
  getListCategoriesQueryKey,
  useToggleProductAvailability,
  useDeleteProduct,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { resolveImageSrc } from "@/lib/image-url";
import {
  Search,
  Package,
  Leaf,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const GRADE_STYLES: Record<string, string> = {
  A: "bg-emerald-100 text-emerald-700",
  B: "bg-blue-100 text-blue-700",
  C: "bg-amber-100 text-amber-700",
};

export default function AdminProducts() {
  const { t, lang } = useLang();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [availability, setAvailability] = useState<"all" | "available" | "soldout">("all");

  const params = useMemo(
    () => ({
      categoryId,
      search: search.trim() || undefined,
      available: availability === "all" ? undefined : availability === "available",
    }),
    [categoryId, search, availability],
  );

  const { data, isLoading } = useListProducts(params, {
    query: { queryKey: getListProductsQueryKey(params) },
  });
  const { data: categories } = useListCategories({ query: { queryKey: getListCategoriesQueryKey() } });

  const toggleAvail = useToggleProductAvailability();
  const deleteProduct = useDeleteProduct();

  const products = data?.products ?? [];

  const stats = useMemo(() => {
    const total = products.length;
    const available = products.filter((p) => p.available).length;
    const lowStock = products.filter((p) => p.quantity > 0 && p.quantity < 20).length;
    const outOfStock = products.filter((p) => p.quantity <= 0).length;
    return { total, available, lowStock, outOfStock };
  }, [products]);

  const handleToggle = (id: number) => {
    toggleAvail.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey(params) });
          toast({ title: t("Availability updated", "تم تحديث التوفر") });
        },
      },
    );
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(t(`Delete "${name}"? This cannot be undone.`, `حذف "${name}"؟ لا يمكن التراجع.`))) return;
    deleteProduct.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey(params) });
          toast({ title: t("Product deleted", "تم حذف المنتج") });
        },
        onError: () =>
          toast({
            title: t("Could not delete", "تعذر الحذف"),
            description: t("Try again later", "حاول مرة أخرى لاحقاً"),
            variant: "destructive",
          }),
      },
    );
  };

  const heroStats = [
    { label: t("Total products", "إجمالي المنتجات"), value: stats.total, icon: Package, tint: "text-indigo-600 bg-indigo-100" },
    { label: t("Available", "متاح"), value: stats.available, icon: CheckCircle, tint: "text-green-600 bg-green-100" },
    { label: t("Low stock", "مخزون منخفض"), value: stats.lowStock, icon: AlertTriangle, tint: "text-amber-600 bg-amber-100" },
    { label: t("Out of stock", "نفد المخزون"), value: stats.outOfStock, icon: XCircle, tint: "text-red-600 bg-red-100" },
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-7xl mx-auto pb-20 md:pb-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            {t("Catalog", "الكتالوج")}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            {t("All products", "كل المنتجات")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t(
              "Browse, filter, and manage every product listed on AgriMarket.",
              "تصفح وفلتر وأدر كل منتج مدرج في أجريماركت.",
            )}
          </p>
        </motion.div>

        {/* Stat strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {heroStats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.tint}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-extrabold text-foreground leading-none">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{s.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Filter bar */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-4 flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("Search products, farmers, categories…", "ابحث عن منتجات أو مزارعين أو فئات…")}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              data-testid="input-search"
            />
          </div>

          <div className="flex gap-2 items-center">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <select
                value={categoryId ?? ""}
                onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                className="appearance-none pl-9 pr-9 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 cursor-pointer"
                data-testid="select-category"
              >
                <option value="">{t("All categories", "كل الفئات")}</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {lang === "ar" ? c.nameAr : c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>

            <div className="inline-flex rounded-xl border border-border bg-background p-1">
              {(["all", "available", "soldout"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setAvailability(v)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    availability === v
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`filter-availability-${v}`}
                >
                  {v === "all" && t("All", "الكل")}
                  {v === "available" && t("Available", "متاح")}
                  {v === "soldout" && t("Sold out", "نفد")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table / cards */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 animate-pulse flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-16 text-center">
              <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="font-semibold text-foreground">
                {t("No products match your filters", "لا توجد منتجات مطابقة")}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("Try clearing filters or search.", "جرب مسح الفلاتر أو البحث.")}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <table className="w-full hidden md:table">
                <thead className="bg-muted/40 border-b border-border">
                  <tr className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="text-left px-5 py-3">{t("Product", "المنتج")}</th>
                    <th className="text-left px-3 py-3">{t("Farmer", "المزارع")}</th>
                    <th className="text-left px-3 py-3">{t("Category", "الفئة")}</th>
                    <th className="text-right px-3 py-3">{t("Stock", "المخزون")}</th>
                    <th className="text-right px-3 py-3">{t("Price", "السعر")}</th>
                    <th className="text-center px-3 py-3">{t("Grade", "الجودة")}</th>
                    <th className="text-center px-3 py-3">{t("Status", "الحالة")}</th>
                    <th className="text-right px-5 py-3">{t("Actions", "إجراءات")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((p, i) => {
                    const isLow = p.quantity > 0 && p.quantity < 20;
                    const isOut = p.quantity <= 0;
                    return (
                      <motion.tr
                        key={p.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-muted/30 transition-colors"
                        data-testid={`product-row-${p.id}`}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                              {resolveImageSrc(p.imageUrl) ? (
                                <img src={resolveImageSrc(p.imageUrl)!} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <Leaf className="w-5 h-5 text-primary/50" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-foreground truncate">
                                {lang === "ar" ? p.nameAr : p.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground">#{p.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-foreground">
                          <p className="font-medium truncate max-w-[140px]">{p.farmerName ?? "—"}</p>
                          {p.farmName && (
                            <p className="text-[11px] text-muted-foreground truncate max-w-[140px]">{p.farmName}</p>
                          )}
                        </td>
                        <td className="px-3 py-3 text-sm text-muted-foreground">{p.categoryName ?? "—"}</td>
                        <td className="px-3 py-3 text-right">
                          <p className={`font-bold text-sm ${isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-foreground"}`}>
                            {p.quantity}
                            <span className="text-[11px] font-medium text-muted-foreground ml-0.5">{p.unit}</span>
                          </p>
                          {isLow && !isOut && (
                            <p className="text-[10px] font-bold text-amber-600 uppercase">{t("Low", "منخفض")}</p>
                          )}
                          {isOut && <p className="text-[10px] font-bold text-red-600 uppercase">{t("Out", "نفد")}</p>}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <p className="font-bold text-sm text-foreground">SSP {p.priceSSP.toLocaleString()}</p>
                          <p className="text-[11px] text-muted-foreground">${p.priceUSD.toFixed(2)}</p>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${GRADE_STYLES[p.qualityGrade ?? ""] ?? "bg-muted"}`}>
                            {p.qualityGrade}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              p.available ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${p.available ? "bg-green-500" : "bg-red-500"}`} />
                            {p.available ? t("Active", "نشط") : t("Sold out", "نفد")}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleToggle(p.id)}
                              className="p-2 rounded-lg hover:bg-muted transition-colors"
                              title={p.available ? t("Mark sold out", "تحديد كنافد") : t("Mark available", "تحديد كمتاح")}
                              data-testid={`button-toggle-${p.id}`}
                            >
                              {p.available ? (
                                <ToggleRight className="w-5 h-5 text-green-600" />
                              ) : (
                                <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                              title={t("Delete", "حذف")}
                              data-testid={`button-delete-${p.id}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-border">
                {products.map((p, i) => {
                  const isLow = p.quantity > 0 && p.quantity < 20;
                  const isOut = p.quantity <= 0;
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="p-4 flex gap-3"
                      data-testid={`product-card-${p.id}`}
                    >
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {resolveImageSrc(p.imageUrl) ? (
                          <img src={resolveImageSrc(p.imageUrl)!} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Leaf className="w-6 h-6 text-primary/50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {lang === "ar" ? p.nameAr : p.name}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              p.available ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                            }`}
                          >
                            <span className={`w-1 h-1 rounded-full ${p.available ? "bg-green-500" : "bg-red-500"}`} />
                            {p.available ? t("Active", "نشط") : t("Sold out", "نفد")}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {p.farmerName ?? "—"} · {p.categoryName ?? "—"}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-xs font-bold ${isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-foreground"}`}>
                            {p.quantity} {p.unit}
                          </span>
                          <span className="text-xs font-bold text-foreground">SSP {p.priceSSP.toLocaleString()}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${GRADE_STYLES[p.qualityGrade ?? ""] ?? "bg-muted"}`}>
                            {p.qualityGrade}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          onClick={() => handleToggle(p.id)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                          data-testid={`button-toggle-mobile-${p.id}`}
                        >
                          {p.available ? (
                            <ToggleRight className="w-5 h-5 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                          data-testid={`button-delete-mobile-${p.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/30">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {t(
                    `Showing ${products.length} of ${data?.total ?? products.length} products`,
                    `عرض ${products.length} من ${data?.total ?? products.length} منتج`,
                  )}
                </p>
                <button
                  onClick={() => setLocation("/admin/pricing")}
                  className="text-xs font-bold text-primary hover:underline"
                  data-testid="link-pricing-rules"
                >
                  {t("Manage pricing rules →", "إدارة قواعد التسعير ←")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
