"use client";

import { useParams, useRouter } from "next/navigation";
import { useLang } from "@/contexts/LangContext";
import {
  useGetTruck,
  getGetTruckQueryKey,
  useUpdateTruck,
  getListTrucksQueryKey,
} from "@workspace/api-client-react";
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
import { ChevronLeft, Truck, MapPin, Package } from "lucide-react";
import { useEffect } from "react";

const schema = z.object({
  plateNumber: z.string().min(1, "Plate number required"),
  driverName: z.string().min(1, "Driver name required"),
  driverPhone: z.string().min(1, "Driver phone required"),
  status: z.enum(["available", "in_transit", "maintenance"]),
  lat: z.string().optional(),
  lng: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AdminEditTruck() {
  const { t } = useLang();
  const params = useParams<{ id: string }>();
  const id = parseInt(params?.id ?? "0");
  const { push: setLocation } = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: truck, isLoading } = useGetTruck(id, {
    query: { enabled: !!id, queryKey: getGetTruckQueryKey(id) },
  });
  const updateTruck = useUpdateTruck();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      plateNumber: "",
      driverName: "",
      driverPhone: "",
      status: "available",
      lat: "",
      lng: "",
    },
  });

  useEffect(() => {
    if (truck) {
      form.reset({
        plateNumber: truck.plateNumber,
        driverName: truck.driverName,
        driverPhone: truck.driverPhone,
        status: truck.status as FormValues["status"],
        lat: truck.lat != null ? String(truck.lat) : "",
        lng: truck.lng != null ? String(truck.lng) : "",
      });
    }
  }, [truck, form]);

  const onSubmit = (values: FormValues) => {
    const lat = values.lat?.trim() ? parseFloat(values.lat) : null;
    const lng = values.lng?.trim() ? parseFloat(values.lng) : null;
    updateTruck.mutate(
      {
        id,
        data: {
          plateNumber: values.plateNumber,
          driverName: values.driverName,
          driverPhone: values.driverPhone,
          status: values.status,
          lat: lat != null && Number.isFinite(lat) ? lat : null,
          lng: lng != null && Number.isFinite(lng) ? lng : null,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTrucksQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTruckQueryKey(id) });
          toast({ title: t("Truck updated!", "تم تحديث الشاحنة!") });
          setLocation("/admin/trucks");
        },
        onError: () => {
          toast({ title: t("Update failed", "فشل التحديث"), variant: "destructive" });
        },
      },
    );
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 max-w-lg mx-auto">
          <div className="h-64 bg-muted rounded-2xl animate-pulse" />
        </div>
      </AppLayout>
    );
  }

  if (!truck) {
    return (
      <AppLayout>
        <div className="p-6 max-w-lg mx-auto text-center text-muted-foreground">
          {t("Truck not found", "الشاحنة غير موجودة")}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={() => setLocation("/admin/trucks")}
            className="p-2 rounded-xl hover:bg-muted"
            data-testid="button-back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-extrabold text-foreground">{t("Edit Truck", "تعديل الشاحنة")}</h1>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-foreground">{truck.plateNumber}</p>
              <p className="text-xs text-muted-foreground">ID #{truck.id}</p>
            </div>
          </div>
          {truck.currentOrderId && (
            <p className="mt-3 text-sm text-muted-foreground flex items-center gap-1.5">
              <Package className="w-4 h-4" />
              {t("Assigned to order", "معينة للطلب")} #{truck.currentOrderId}
            </p>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="plateNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Plate Number", "رقم اللوحة")}</FormLabel>
                    <FormControl>
                      <Input data-testid="input-plate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="driverName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Driver Name", "اسم السائق")}</FormLabel>
                    <FormControl>
                      <Input data-testid="input-driver-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="driverPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Driver Phone", "هاتف السائق")}</FormLabel>
                    <FormControl>
                      <Input data-testid="input-driver-phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Status", "الحالة")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">{t("Available", "متاحة")}</SelectItem>
                        <SelectItem value="in_transit">{t("In Transit", "في الطريق")}</SelectItem>
                        <SelectItem value="maintenance">{t("Maintenance", "صيانة")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="lat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {t("Latitude", "خط العرض")}
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="4.85" data-testid="input-lat" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lng"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Longitude", "خط الطول")}</FormLabel>
                      <FormControl>
                        <Input placeholder="31.60" data-testid="input-lng" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full" disabled={updateTruck.isPending} data-testid="button-submit">
                {updateTruck.isPending ? t("Saving...", "جاري الحفظ...") : t("Save Changes", "حفظ التغييرات")}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </AppLayout>
  );
}
