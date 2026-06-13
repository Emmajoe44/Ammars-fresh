import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import { useGetProduct, getGetProductQueryKey, useUpdateProduct, useListCategories, getListProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/Layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { useExchangeRates } from "@/contexts/ExchangeRatesContext";
import { usdToSsp, usdToUsg } from "@/lib/exchange-rate";

const schema = z.object({
  name: z.string().min(1, "Product name required"),
  nameAr: z.string().min(1, "Arabic name required"),
  categoryId: z.coerce.number().min(1, "Category required"),
  quantity: z.coerce.number().min(0.1, "Quantity required"),
  unit: z.string().min(1, "Unit required"),
  priceSSP: z.coerce.number().min(0, "SSP price required"),
  priceUSD: z.coerce.number().min(0, "USD price required"),
  harvestDate: z.string().optional(),
  qualityGrade: z.enum(["A", "B", "C"]),
  available: z.boolean(),
});

export default function FarmerEditProduct() {
  const { user } = useAuth();
  const { t } = useLang();
  const params = useParams<{ id: string }>();
  const id = parseInt(params?.id ?? "0");
  const { push: setLocation } = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: product, isLoading } = useGetProduct(id, { query: { enabled: !!id, queryKey: getGetProductQueryKey(id) } });
  const { data: categories } = useListCategories();
  const updateProduct = useUpdateProduct();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [rates] = useExchangeRates();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      nameAr: "",
      categoryId: 1,
      quantity: 0,
      unit: "kg",
      priceSSP: 0,
      priceUSD: 0,
      harvestDate: "",
      qualityGrade: "A",
      available: true,
    },
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

  const onSubmit = (values: z.infer<typeof schema>) => {
    updateProduct.mutate(
      {
        id,
        data: {
          ...values,
          harvestDate: values.harvestDate || null,
          imageUrl: imageUrl ?? null,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey({ farmerId: user?.id }) });
          queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(id) });
          toast({ title: t("Product updated!", "تم تحديث المنتج!") });
          setLocation("/farmer/products");
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.error ?? err?.message ?? "Failed to update";
          toast({ title: t("Could not save product", "تعذر حفظ المنتج"), description: msg, variant: "destructive" });
        },
      },
    );
  };

  if (isLoading || !product) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="h-96 bg-muted rounded-2xl animate-pulse" />
        </div>
      </AppLayout>
    );
  }

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
                  <Select onValueChange={(v) => field.onChange(parseInt(v, 10))} value={String(field.value)}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>{(categories ?? []).map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
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
              <div className="space-y-2">
                <FormField control={form.control} name="priceUSD" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Price (USD)", "السعر بالدولار")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        data-testid="input-price-usd"
                        {...field}
                        onChange={e => {
                          const usd = parseFloat(e.target.value) || 0;
                          field.onChange(usd);
                          form.setValue("priceSSP", usdToSsp(usd, rates));
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="priceSSP" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>{t("Price (SSP) — auto", "السعر بالجنيه — تلقائي")}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        @ {rates.usdToSsp.toLocaleString()} SSP/USD · USG {usdToUsg(form.watch("priceUSD") || 0, rates).toLocaleString()}
                      </span>
                    </FormLabel>
                    <FormControl><Input type="number" data-testid="input-price-ssp" readOnly className="bg-muted/40" {...field} /></FormControl>
                  </FormItem>
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
