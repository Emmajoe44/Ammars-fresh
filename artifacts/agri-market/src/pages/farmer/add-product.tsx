import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import { useCreateProduct, useListCategories, getListProductsQueryKey } from "@workspace/api-client-react";
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

const schema = z.object({
  name: z.string().min(1, "Product name required"),
  nameAr: z.string().min(1, "Arabic name required"),
  categoryId: z.coerce.number().min(1, "Category required"),
  quantity: z.coerce.number().min(0.1, "Quantity required"),
  unit: z.string().min(1, "Unit required"),
  priceSSP: z.coerce.number().min(1, "SSP price required"),
  priceUSD: z.coerce.number().min(0.01, "USD price required"),
  harvestDate: z.string().optional(),
  qualityGrade: z.enum(["A", "B", "C"]),
  description: z.string().optional(),
});

export default function FarmerAddProduct() {
  const { user } = useAuth();
  const { t } = useLang();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories } = useListCategories();
  const createProduct = useCreateProduct();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", nameAr: "", categoryId: 0, quantity: 0, unit: "kg", priceSSP: 0, priceUSD: 0, harvestDate: "", qualityGrade: "A", description: "" },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    createProduct.mutate({ data: { ...values, description: values.description || null, harvestDate: values.harvestDate || null } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListProductsQueryKey({ farmerId: user?.id }) });
        toast({ title: t("Product added!", "تم إضافة المنتج!") });
        setLocation("/farmer/products");
      },
      onError: () => toast({ title: t("Failed to add product", "فشل إضافة المنتج"), variant: "destructive" }),
    });
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 pb-20 md:pb-8 max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-5">
          <button onClick={() => setLocation("/farmer/products")} className="p-2 rounded-xl hover:bg-muted" data-testid="button-back">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-extrabold text-foreground">{t("Add Product", "إضافة منتج")}</h1>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Product name (EN)", "الاسم بالإنجليزية")}</FormLabel>
                    <FormControl><Input placeholder="e.g. Tomatoes" data-testid="input-name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="nameAr" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Product name (AR)", "الاسم بالعربية")}</FormLabel>
                    <FormControl><Input placeholder="مثال: طماطم" data-testid="input-name-ar" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="categoryId" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Category", "الفئة")}</FormLabel>
                  <Select onValueChange={v => field.onChange(parseInt(v))} value={field.value ? String(field.value) : undefined}>
                    <FormControl><SelectTrigger data-testid="select-category"><SelectValue placeholder={t("Select category", "اختر الفئة")} /></SelectTrigger></FormControl>
                    <SelectContent>
                      {(categories ?? []).map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="quantity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Quantity", "الكمية")}</FormLabel>
                    <FormControl><Input type="number" step="0.1" data-testid="input-quantity" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="unit" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Unit", "الوحدة")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue="kg">
                      <FormControl><SelectTrigger data-testid="select-unit"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {["kg", "g", "ton", "bag", "box", "piece", "liter"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="priceSSP" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Price (SSP)", "السعر بالجنيه")}</FormLabel>
                    <FormControl><Input type="number" step="1" data-testid="input-price-ssp" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="priceUSD" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Price (USD)", "السعر بالدولار")}</FormLabel>
                    <FormControl><Input type="number" step="0.01" data-testid="input-price-usd" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="qualityGrade" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Quality Grade", "درجة الجودة")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue="A">
                      <FormControl><SelectTrigger data-testid="select-grade"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="A">Grade A (Premium)</SelectItem>
                        <SelectItem value="B">Grade B (Standard)</SelectItem>
                        <SelectItem value="C">Grade C (Economy)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={form.control} name="harvestDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Harvest Date", "تاريخ الحصاد")}</FormLabel>
                    <FormControl><Input type="date" data-testid="input-harvest-date" {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Description (optional)", "الوصف (اختياري)")}</FormLabel>
                  <FormControl><Input data-testid="input-description" {...field} /></FormControl>
                </FormItem>
              )} />

              <Button type="submit" className="w-full font-semibold" disabled={createProduct.isPending} data-testid="button-submit-product">
                {createProduct.isPending ? t("Adding...", "جاري الإضافة...") : t("Add Product", "إضافة المنتج")}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </AppLayout>
  );
}
