import { useRouter } from "next/navigation";
import { useLang } from "@/contexts/LangContext";
import { useCreateTruck, getListTrucksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/Layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Truck } from "lucide-react";

const schema = z.object({
  plateNumber: z.string().min(1, "Plate number required"),
  driverName: z.string().min(1, "Driver name required"),
  driverPhone: z.string().min(1, "Driver phone required"),
});

export default function AdminAddTruck() {
  const { t } = useLang();
  const { push: setLocation } = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createTruck = useCreateTruck();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { plateNumber: "", driverName: "", driverPhone: "" },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    createTruck.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTrucksQueryKey() });
        toast({ title: t("Truck added!", "تم إضافة الشاحنة!") });
        setLocation("/admin/trucks");
      },
    });
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-5">
          <button onClick={() => setLocation("/admin/trucks")} className="p-2 rounded-xl hover:bg-muted" data-testid="button-back">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-extrabold text-foreground">{t("Add Truck", "إضافة شاحنة")}</h1>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground">{t("Register a new truck in the fleet", "تسجيل شاحنة جديدة في الأسطول")}</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="plateNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Plate Number", "رقم اللوحة")}</FormLabel>
                  <FormControl><Input placeholder="e.g. SSA-001-JUB" data-testid="input-plate" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="driverName" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Driver Name", "اسم السائق")}</FormLabel>
                  <FormControl><Input placeholder="Full name" data-testid="input-driver-name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="driverPhone" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Driver Phone", "هاتف السائق")}</FormLabel>
                  <FormControl><Input placeholder="+211 9XX XXX XXX" data-testid="input-driver-phone" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={createTruck.isPending} data-testid="button-submit">
                {createTruck.isPending ? t("Adding...", "جاري الإضافة...") : t("Add Truck", "إضافة الشاحنة")}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </AppLayout>
  );
}
