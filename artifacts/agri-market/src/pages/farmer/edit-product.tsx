import { useRoute, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import { useGetProduct, getGetProductQueryKey, useUpdateProduct, useListCategories, getListProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/Layout";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";

export default function FarmerEditProduct() {
  const { user } = useAuth();
  const { t } = useLang();
  const [, params] = useRoute("/farmer/products/:id/edit");
  const id = parseInt(params?.id ?? "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: product, isLoading } = useGetProduct(id, { query: { enabled: !!id, queryKey: getGetProductQueryKey(id) } });
  const { data: categories } = useListCategories();
  const updateProduct = useUpdateProduct();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { name: "", nameAr: "", categoryId: 0, quantity: 0, unit: "kg", priceSSP: 0, priceUSD: 0, harvestDate: "", qualityGrade: "A" as "A" | "B" | "C", available: true },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        nameAr: product.nameAr,
        categoryId: product.categoryId,
        quantity: product.quantity,
        unit: product.unit,
        priceSSP: product.priceSSP,
        priceUSD: product.priceUSD,
        harvestDate: product.harvestDate ?? "",
        qualityGrade: product.qualityGrade as "A" | "B" | "C",
        available: product.available,
      });
      setImageUrl(product.imageUrl ?? null);
    }
  }, [product]);

  const onSubmit = (values: any) => {
    updateProduct.mutate({ id, data: { ...values, harvestDate: values.harvestDate || null, imageUrl: imageUrl ?? null } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey({ farmerId: user?.id }) });
        queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(id) });
        toast({ title: t("Product updated!", "تم تحديث المنتج!") });
        setLocation("/farmer/products");
      },
    });
  };

  if (isLoading) return <AppLayout><div className="p-6"><div className="h-96 bg-muted rounded-2xl animate-pulse" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="p-4 md:p-6 pb-20 md:pb-8 max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-5">
          <button onClick={() => setLocation("/farmer/products")} className="p-2 rounded-xl hover:bg-muted">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-extrabold text-foreground">{t("Edit Product", "تعديل المنتج")}</h1>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <ImageUpload value={imageUrl} onChange={setImageUrl} label={t("Product image", "صورة المنتج")} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>{t("Name (EN)", "الاسم إنجليزي")}</FormLabel><FormControl><Input data-testid="input-name" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="nameAr" render={({ field }) => (
                  <FormItem><FormLabel>{t("Name (AR)", "الاسم عربي")}</FormLabel><FormControl><Input data-testid="input-name-ar" {...field} /></FormControl></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="categoryId" render={({ field }) => (
                <FormItem><FormLabel>{t("Category", "الفئة")}</FormLabel>
                  <Select onValueChange={v => field.onChange(parseInt(v))} value={field.value ? String(field.value) : undefined}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>{(categories ?? []).map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="quantity" render={({ field }) => (
                  <FormItem><FormLabel>{t("Quantity", "الكمية")}</FormLabel><FormControl><Input type="number" step="0.1" data-testid="input-quantity" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="unit" render={({ field }) => (
                  <FormItem><FormLabel>{t("Unit", "الوحدة")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{["kg", "g", "ton", "bag", "box", "piece", "liter"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="priceSSP" render={({ field }) => (
                  <FormItem><FormLabel>SSP</FormLabel><FormControl><Input type="number" data-testid="input-price-ssp" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="priceUSD" render={({ field }) => (
                  <FormItem><FormLabel>USD</FormLabel><FormControl><Input type="number" step="0.01" data-testid="input-price-usd" {...field} /></FormControl></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="qualityGrade" render={({ field }) => (
                <FormItem><FormLabel>{t("Quality Grade", "درجة الجودة")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="A">Grade A</SelectItem><SelectItem value="B">Grade B</SelectItem><SelectItem value="C">Grade C</SelectItem></SelectContent>
                  </Select>
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={updateProduct.isPending} data-testid="button-save">
                {updateProduct.isPending ? t("Saving...", "جاري الحفظ...") : t("Save Changes", "حفظ التغييرات")}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </AppLayout>
  );
}
