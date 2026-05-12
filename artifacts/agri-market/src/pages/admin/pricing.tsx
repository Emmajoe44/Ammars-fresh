import { useLang } from "@/contexts/LangContext";
import { useListPricing, getListPricingQueryKey, useCreatePricingRule, useListCategories } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/Layout";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tag, Plus } from "lucide-react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  categoryId: z.coerce.number().min(1),
  minPriceSSP: z.coerce.number().min(0),
  maxPriceSSP: z.coerce.number().min(0),
  minPriceUSD: z.coerce.number().min(0),
  maxPriceUSD: z.coerce.number().min(0),
});

export default function AdminPricing() {
  const { t } = useLang();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: pricing, isLoading } = useListPricing({ query: { queryKey: getListPricingQueryKey() } });
  const { data: categories } = useListCategories();
  const createRule = useCreatePricingRule();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { categoryId: 0, minPriceSSP: 0, maxPriceSSP: 0, minPriceUSD: 0, maxPriceUSD: 0 },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    createRule.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPricingQueryKey() });
        toast({ title: t("Pricing rule added!", "تم إضافة قاعدة التسعير!") });
        form.reset();
        setShowForm(false);
      },
    });
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Tag className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">{t("Pricing Rules", "قواعد التسعير")}</h1>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2" data-testid="button-add-rule">
            <Plus className="w-4 h-4" />
            {t("Add Rule", "إضافة قاعدة")}
          </Button>
        </div>

        {showForm && (
          <div className="bg-card border border-border rounded-2xl p-5 mb-5">
            <h2 className="font-bold mb-4">{t("New Pricing Rule", "قاعدة تسعير جديدة")}</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="categoryId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Category", "الفئة")}</FormLabel>
                    <Select onValueChange={v => field.onChange(parseInt(v))}>
                      <FormControl><SelectTrigger data-testid="select-category"><SelectValue placeholder={t("Select category", "اختر الفئة")} /></SelectTrigger></FormControl>
                      <SelectContent>{(categories ?? []).map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="minPriceSSP" render={({ field }) => (
                    <FormItem><FormLabel>{t("Min SSP/kg", "الحد الأدنى بالجنيه")}</FormLabel><FormControl><Input type="number" data-testid="input-min-ssp" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="maxPriceSSP" render={({ field }) => (
                    <FormItem><FormLabel>{t("Max SSP/kg", "الحد الأقصى بالجنيه")}</FormLabel><FormControl><Input type="number" data-testid="input-max-ssp" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="minPriceUSD" render={({ field }) => (
                    <FormItem><FormLabel>{t("Min USD/kg", "الحد الأدنى بالدولار")}</FormLabel><FormControl><Input type="number" step="0.01" data-testid="input-min-usd" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="maxPriceUSD" render={({ field }) => (
                    <FormItem><FormLabel>{t("Max USD/kg", "الحد الأقصى بالدولار")}</FormLabel><FormControl><Input type="number" step="0.01" data-testid="input-max-usd" {...field} /></FormControl></FormItem>
                  )} />
                </div>
                <Button type="submit" className="w-full" disabled={createRule.isPending} data-testid="button-submit-rule">
                  {createRule.isPending ? t("Saving...", "جاري الحفظ...") : t("Save Rule", "حفظ القاعدة")}
                </Button>
              </form>
            </Form>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />)}</div>
        ) : pricing?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Tag className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="font-semibold text-foreground">{t("No pricing rules yet", "لا توجد قواعد تسعير")}</p>
            <p className="text-sm text-muted-foreground">{t("Add rules to control price ranges", "أضف قواعد للتحكم في نطاقات الأسعار")}</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-5 px-4 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground border-b border-border">
              <span>{t("Category", "الفئة")}</span>
              <span>{t("Min SSP", "الحد الأدنى")}</span>
              <span>{t("Max SSP", "الحد الأقصى")}</span>
              <span>{t("Min USD", "الحد الأدنى")}</span>
              <span>{t("Max USD", "الحد الأقصى")}</span>
            </div>
            {(pricing ?? []).map(rule => (
              <div key={rule.id} className="grid grid-cols-5 px-4 py-3 border-b border-border last:border-0 text-sm" data-testid={`pricing-rule-${rule.id}`}>
                <span className="font-medium text-foreground">{rule.categoryName}</span>
                <span className="text-muted-foreground">SSP {rule.minPriceSSP}</span>
                <span className="text-muted-foreground">SSP {rule.maxPriceSSP}</span>
                <span className="text-muted-foreground">${rule.minPriceUSD}</span>
                <span className="text-muted-foreground">${rule.maxPriceUSD}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
