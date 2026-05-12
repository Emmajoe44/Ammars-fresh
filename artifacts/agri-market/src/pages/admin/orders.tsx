import { useState } from "react";
import { useLocation } from "wouter";
import { useLang } from "@/contexts/LangContext";
import { useListOrders, getListOrdersQueryKey, useListTrucks, getListTrucksQueryKey, useAssignTruckToOrder, useUpdateOrder } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/Layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Truck } from "lucide-react";
import { motion } from "framer-motion";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  assigned: "bg-purple-100 text-purple-800",
  in_transit: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrders() {
  const { t } = useLang();
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const params = statusFilter !== "all" ? { status: statusFilter as any } : {};
  const { data, isLoading } = useListOrders(params, { query: { queryKey: getListOrdersQueryKey(params) } });
  const { data: trucks } = useListTrucks({ query: { queryKey: getListTrucksQueryKey() } });
  const assignTruck = useAssignTruckToOrder();
  const updateOrder = useUpdateOrder();

  const handleAssignTruck = (orderId: number, truckId: number) => {
    assignTruck.mutate({ id: orderId, data: { truckId } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey(params) });
        toast({ title: t("Truck assigned!", "تم تعيين الشاحنة!") });
      },
    });
  };

  const handleConfirm = (orderId: number) => {
    updateOrder.mutate({ id: orderId, data: { status: "confirmed" } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey(params) });
        toast({ title: t("Order confirmed", "تم تأكيد الطلب") });
      },
    });
  };

  const availableTrucks = trucks?.filter(t => t.status === "available") ?? [];

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-extrabold text-foreground">{t("All Orders", "جميع الطلبات")}</h1>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40" data-testid="select-status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All statuses", "جميع الحالات")}</SelectItem>
              {["pending", "confirmed", "assigned", "in_transit", "delivered", "cancelled"].map(s => (
                <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />)}</div>
        ) : (
          <div className="space-y-3">
            {(data?.orders ?? []).map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-card border border-border rounded-2xl p-4"
                data-testid={`order-row-${order.id}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-foreground">
                      {t("Order", "طلب")} #{order.id} — {order.retailerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.items?.length ?? 0} {t("items", "منتجات")} · {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[order.status]}`}>
                      {order.status.replace("_", " ")}
                    </span>
                    <button onClick={() => setLocation(`/admin/orders/${order.id}`)} className="p-1.5 rounded-lg hover:bg-muted" data-testid={`button-view-${order.id}`}>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-primary">
                    {order.currency === "SSP" ? `SSP ${order.totalSSP?.toLocaleString()}` : `$${order.totalUSD?.toFixed(2)}`}
                  </span>
                  {order.deliveryLocation && (
                    <span className="text-xs text-muted-foreground">{order.deliveryLocation}</span>
                  )}
                  {order.status === "pending" && (
                    <Button size="sm" variant="outline" onClick={() => handleConfirm(order.id)} className="ml-auto" data-testid={`button-confirm-${order.id}`}>
                      {t("Confirm", "تأكيد")}
                    </Button>
                  )}
                  {order.status === "confirmed" && availableTrucks.length > 0 && (
                    <div className="flex items-center gap-2 ml-auto">
                      <Truck className="w-4 h-4 text-muted-foreground" />
                      <Select onValueChange={v => handleAssignTruck(order.id, parseInt(v))}>
                        <SelectTrigger className="h-8 w-44 text-xs" data-testid={`select-truck-${order.id}`}>
                          <SelectValue placeholder={t("Assign truck", "تعيين شاحنة")} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTrucks.map(tr => (
                            <SelectItem key={tr.id} value={String(tr.id)}>{tr.plateNumber} — {tr.driverName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {order.truckPlate && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg ml-auto flex items-center gap-1">
                      <Truck className="w-3 h-3" /> {order.truckPlate}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
