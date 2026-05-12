import { useRoute } from "wouter";
import { useLang } from "@/contexts/LangContext";
import { useGetOrder, getGetOrderQueryKey, useListTrucks, getListTrucksQueryKey, useAssignTruckToOrder, useUpdateOrder } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Truck, MapPin, Package } from "lucide-react";

export default function AdminOrderDetail() {
  const { t } = useLang();
  const [, params] = useRoute("/admin/orders/:id");
  const id = parseInt(params?.id ?? "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useGetOrder(id, { query: { enabled: !!id, queryKey: getGetOrderQueryKey(id) } });
  const { data: trucks } = useListTrucks({ query: { queryKey: getListTrucksQueryKey() } });
  const assignTruck = useAssignTruckToOrder();
  const updateOrder = useUpdateOrder();

  const availableTrucks = trucks?.filter(t => t.status === "available") ?? [];

  const handleAssign = (truckId: number) => {
    assignTruck.mutate({ id, data: { truckId } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(id) });
        toast({ title: t("Truck assigned!", "تم التعيين!") });
      },
    });
  };

  const handleStatus = (status: string) => {
    updateOrder.mutate({ id, data: { status: status as any } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetOrderQueryKey(id) });
        toast({ title: t("Status updated", "تم تحديث الحالة") });
      },
    });
  };

  if (isLoading) return <AppLayout><div className="p-6"><div className="h-64 bg-muted rounded-2xl animate-pulse" /></div></AppLayout>;
  if (!order) return <AppLayout><div className="p-6 text-center text-muted-foreground">Order not found</div></AppLayout>;

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-extrabold text-foreground mb-5">{t("Order", "طلب")} #{order.id}</h1>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="font-bold mb-2">{t("Customer", "العميل")}</h3>
            <p className="text-sm text-foreground">{order.retailerName}</p>
            {order.deliveryLocation && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{order.deliveryLocation}</p>}
          </div>

          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="font-bold mb-3">{t("Items", "المنتجات")}</h3>
            <div className="space-y-2">
              {(order.items ?? []).map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-foreground">{item.productName} × {item.quantity} {item.unit}</span>
                  <span className="font-semibold text-primary">SSP {(item.priceSSP * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">SSP {order.totalSSP?.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2"><Truck className="w-4 h-4 text-primary" />{t("Logistics", "اللوجستيات")}</h3>
            {order.truckPlate ? (
              <div>
                <p className="text-sm font-semibold">{order.truckPlate} — {order.driverName}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("Status", "الحالة")}: {order.status}</p>
              </div>
            ) : (
              <>
                {availableTrucks.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-muted-foreground">{t("No truck assigned yet", "لم يتم تعيين شاحنة")}</p>
                    <Select onValueChange={v => handleAssign(parseInt(v))}>
                      <SelectTrigger data-testid="select-assign-truck"><SelectValue placeholder={t("Select truck", "اختر شاحنة")} /></SelectTrigger>
                      <SelectContent>
                        {availableTrucks.map(tr => <SelectItem key={tr.id} value={String(tr.id)}>{tr.plateNumber} — {tr.driverName}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ) : <p className="text-sm text-muted-foreground">{t("No trucks available", "لا توجد شاحنات متاحة")}</p>}
              </>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="font-bold mb-3">{t("Update Status", "تحديث الحالة")}</h3>
            <div className="flex flex-wrap gap-2">
              {["confirmed", "assigned", "in_transit", "delivered", "cancelled"].map(s => (
                <Button key={s} size="sm" variant={order.status === s ? "default" : "outline"} onClick={() => handleStatus(s)} data-testid={`button-status-${s}`}>
                  {s.replace("_", " ")}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
