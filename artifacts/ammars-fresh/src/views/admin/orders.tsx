import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/contexts/LangContext";
import {
  useListOrders,
  getListOrdersQueryKey,
  useListTrucks,
  getListTrucksQueryKey,
  useAssignTruckToOrder,
  useUpdateOrder,
  type Order,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/Layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronRight,
  Truck,
  ClipboardList,
  LayoutGrid,
  List as ListIcon,
  Table as TableIcon,
  MapPin,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import { formatOrderTotal } from "@/lib/format-price";
import { useExchangeRates } from "@/contexts/ExchangeRatesContext";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  assigned: "bg-purple-100 text-purple-800",
  in_transit: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const ORDER_STATUSES = ["pending", "confirmed", "assigned", "in_transit", "delivered", "cancelled"] as const;
type ViewMode = "grid" | "list" | "table";

export default function AdminOrders() {
  const { t } = useLang();
  const { push: setLocation } = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [view, setView] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "grid";
    const saved = localStorage.getItem("agrimarket_admin_orders_view");
    return saved === "grid" || saved === "list" || saved === "table" ? saved : "grid";
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rates] = useExchangeRates();

  const params = statusFilter !== "all" ? { status: statusFilter as (typeof ORDER_STATUSES)[number] } : {};
  const { data, isLoading } = useListOrders(params, { query: { queryKey: getListOrdersQueryKey(params) } });
  const { data: trucks } = useListTrucks({ query: { queryKey: getListTrucksQueryKey() } });
  const assignTruck = useAssignTruckToOrder();
  const updateOrder = useUpdateOrder();

  const orders = data?.orders ?? [];
  const availableTrucks = trucks?.filter((tr) => tr.status === "available") ?? [];

  const setViewPersist = (mode: ViewMode) => {
    setView(mode);
    if (typeof window !== "undefined") localStorage.setItem("agrimarket_admin_orders_view", mode);
  };

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey(params) });

  const handleAssignTruck = (orderId: number, truckId: number) => {
    assignTruck.mutate(
      { id: orderId, data: { truckId } },
      {
        onSuccess: () => {
          invalidate();
          toast({ title: t("Truck assigned!", "تم تعيين الشاحنة!") });
        },
      },
    );
  };

  const handleConfirm = (orderId: number) => {
    updateOrder.mutate(
      { id: orderId, data: { status: "confirmed" } },
      {
        onSuccess: () => {
          invalidate();
          toast({ title: t("Order confirmed", "تم تأكيد الطلب") });
        },
      },
    );
  };

  const formatTotal = (order: Order) =>
    formatOrderTotal(order.currency, order.totalSSP, order.totalUSD, rates);

  const StatusBadge = ({ status }: { status: string }) => (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusColors[status] ?? "bg-muted"}`}>
      {status.replace("_", " ")}
    </span>
  );

  const OrderActions = ({ order, compact }: { order: Order; compact?: boolean }) => (
    <div className={`flex items-center gap-2 ${compact ? "flex-wrap" : "flex-wrap mt-3 pt-3 border-t border-border"}`}>
      <span className="text-sm font-semibold text-primary">{formatTotal(order)}</span>
      {order.deliveryLocation && (
        <span className="text-xs text-muted-foreground flex items-center gap-1 max-w-[200px] truncate">
          <MapPin className="w-3 h-3 shrink-0" />
          {order.deliveryLocation}
        </span>
      )}
      {order.status === "pending" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleConfirm(order.id)}
          className={compact ? "" : "ml-auto"}
          data-testid={`button-confirm-${order.id}`}
        >
          {t("Confirm", "تأكيد")}
        </Button>
      )}
      {order.status === "confirmed" && availableTrucks.length > 0 && (
        <div className={`flex items-center gap-2 ${compact ? "" : "ml-auto"}`}>
          <Truck className="w-4 h-4 text-muted-foreground shrink-0" />
          <Select onValueChange={(v) => handleAssignTruck(order.id, parseInt(v))}>
            <SelectTrigger className="h-8 w-44 text-xs" data-testid={`select-truck-${order.id}`}>
              <SelectValue placeholder={t("Assign truck", "تعيين شاحنة")} />
            </SelectTrigger>
            <SelectContent>
              {availableTrucks.map((tr) => (
                <SelectItem key={tr.id} value={String(tr.id)}>
                  {tr.plateNumber} — {tr.driverName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {order.truckPlate && (
        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg flex items-center gap-1">
          <Truck className="w-3 h-3" />
          {order.truckPlate}
        </span>
      )}
      <Button
        size="sm"
        variant="ghost"
        className={`gap-1 ${compact ? "ml-auto" : ""}`}
        onClick={() => setLocation(`/admin/orders/${order.id}`)}
        data-testid={`button-view-${order.id}`}
      >
        <Eye className="w-4 h-4" />
        {!compact && t("View", "عرض")}
      </Button>
    </div>
  );

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground">{t("All Orders", "جميع الطلبات")}</h1>
              <p className="text-sm text-muted-foreground">
                {data?.total ?? orders.length} {t("orders", "طلبات")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className="inline-flex rounded-xl border border-border bg-background p-1"
              role="group"
              aria-label={t("View mode", "وضع العرض")}
            >
              <button
                type="button"
                onClick={() => setViewPersist("grid")}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${view === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                aria-label={t("Card view", "عرض البطاقات")}
                title={t("Card view", "عرض البطاقات")}
                data-testid="button-orders-view-grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewPersist("list")}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${view === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                aria-label={t("List view", "عرض القائمة")}
                title={t("List view", "عرض القائمة")}
                data-testid="button-orders-view-list"
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewPersist("table")}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${view === "table" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                aria-label={t("Table view", "عرض الجدول")}
                title={t("Table view", "عرض الجدول")}
                data-testid="button-orders-view-table"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40" data-testid="select-status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("All statuses", "جميع الحالات")}</SelectItem>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-border">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 animate-pulse flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>{t("No orders match this filter", "لا توجد طلبات تطابق هذا التصفية")}</p>
            </div>
          ) : view === "grid" ? (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order, i) => (
                <motion.article
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border border-border rounded-2xl p-4 flex flex-col bg-background hover:shadow-md transition-shadow"
                  data-testid={`order-card-${order.id}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-bold text-foreground">
                        {t("Order", "طلب")} #{order.id}
                      </p>
                      <p className="text-sm text-foreground truncate">{order.retailerName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {order.items?.length ?? 0} {t("items", "منتجات")} ·{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <OrderActions order={order} />
                </motion.article>
              ))}
            </div>
          ) : view === "list" ? (
            <div className="divide-y divide-border">
              {orders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-4 hover:bg-muted/30 transition-colors"
                  data-testid={`order-list-${order.id}`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="font-bold text-foreground">
                        #{order.id} — {order.retailerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.items?.length ?? 0} {t("items", "منتجات")} · {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={order.status} />
                      <button
                        type="button"
                        onClick={() => setLocation(`/admin/orders/${order.id}`)}
                        className="p-2 rounded-lg hover:bg-muted"
                        data-testid={`button-view-list-${order.id}`}
                      >
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                  <OrderActions order={order} compact />
                </motion.div>
              ))}
            </div>
          ) : (
            <>
              <table className="w-full hidden md:table">
                <thead className="bg-muted/40 border-b border-border">
                  <tr className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="text-left px-5 py-3">{t("Order", "الطلب")}</th>
                    <th className="text-left px-3 py-3">{t("Retailer", "التاجر")}</th>
                    <th className="text-center px-3 py-3">{t("Items", "المنتجات")}</th>
                    <th className="text-right px-3 py-3">{t("Total", "الإجمالي")}</th>
                    <th className="text-center px-3 py-3">{t("Status", "الحالة")}</th>
                    <th className="text-left px-3 py-3">{t("Truck", "الشاحنة")}</th>
                    <th className="text-left px-3 py-3">{t("Date", "التاريخ")}</th>
                    <th className="text-right px-5 py-3">{t("Actions", "إجراءات")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-muted/30 transition-colors"
                      data-testid={`order-row-${order.id}`}
                    >
                      <td className="px-5 py-3 font-semibold text-sm">#{order.id}</td>
                      <td className="px-3 py-3 text-sm">{order.retailerName ?? "—"}</td>
                      <td className="px-3 py-3 text-sm text-center">{order.items?.length ?? 0}</td>
                      <td className="px-3 py-3 text-sm font-semibold text-primary text-right whitespace-nowrap">
                        {formatTotal(order)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-3 py-3 text-sm text-muted-foreground">{order.truckPlate ?? "—"}</td>
                      <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {order.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleConfirm(order.id)}
                              data-testid={`button-confirm-table-${order.id}`}
                            >
                              {t("Confirm", "تأكيد")}
                            </Button>
                          )}
                          {order.status === "confirmed" && availableTrucks.length > 0 && (
                            <Select onValueChange={(v) => handleAssignTruck(order.id, parseInt(v))}>
                              <SelectTrigger className="h-8 w-36 text-xs" data-testid={`select-truck-table-${order.id}`}>
                                <SelectValue placeholder={t("Assign", "تعيين")} />
                              </SelectTrigger>
                              <SelectContent>
                                {availableTrucks.map((tr) => (
                                  <SelectItem key={tr.id} value={String(tr.id)}>
                                    {tr.plateNumber}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <button
                            type="button"
                            onClick={() => setLocation(`/admin/orders/${order.id}`)}
                            className="p-2 rounded-lg hover:bg-muted"
                            data-testid={`button-view-table-${order.id}`}
                          >
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              <div className="md:hidden divide-y divide-border">
                {orders.map((order) => (
                  <div key={order.id} className="p-4 space-y-2" data-testid={`order-row-mobile-${order.id}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold">#{order.id} — {order.retailerName}</p>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm font-semibold text-primary">{formatTotal(order)}</p>
                    <OrderActions order={order} compact />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
