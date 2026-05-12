import { useRoute } from "wouter";
import { useLang } from "@/contexts/LangContext";
import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/Layout";
import { Package, Truck, Check, Clock, X, MapPin, RefreshCw } from "lucide-react";

const steps = ["pending", "confirmed", "assigned", "in_transit", "delivered"];
const stepIcons = [Clock, Check, Package, Truck, Check];

export default function RetailerOrderDetail() {
  const { t } = useLang();
  const [, params] = useRoute("/retailer/orders/:id");
  const id = parseInt(params?.id ?? "0");
  const { data: order, isLoading, dataUpdatedAt } = useGetOrder(id, {
    query: {
      enabled: !!id,
      queryKey: getGetOrderQueryKey(id),
      refetchInterval: (q) => {
        const status = (q.state.data as { status?: string } | undefined)?.status;
        if (status === "delivered" || status === "cancelled") return false;
        return 15000;
      },
      refetchOnWindowFocus: true,
    },
  });

  if (isLoading) return <AppLayout><div className="p-6"><div className="h-48 bg-muted rounded-2xl animate-pulse" /></div></AppLayout>;
  if (!order) return <AppLayout><div className="p-6 text-center text-muted-foreground">{t("Order not found", "الطلب غير موجود")}</div></AppLayout>;

  const currentStep = steps.indexOf(order.status);

  return (
    <AppLayout>
      <div className="p-4 md:p-6 pb-20 md:pb-8 max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-foreground">{t("Order", "طلب")} #{order.id}</h1>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
            <span>{new Date(order.createdAt).toLocaleString()}</span>
            {order.status !== "delivered" && order.status !== "cancelled" && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold" title={`Updated ${new Date(dataUpdatedAt).toLocaleTimeString()}`}>
                <RefreshCw className="w-3 h-3 animate-spin [animation-duration:3s]" />
                {t("Live", "مباشر")}
              </span>
            )}
          </div>
        </div>

        {/* Status tracker */}
        {order.status !== "cancelled" && (
          <div className="bg-card border border-border rounded-2xl p-5 mb-4">
            <h3 className="font-bold mb-4">{t("Order Status", "حالة الطلب")}</h3>
            <div className="relative">
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-muted" />
              {steps.map((step, i) => {
                const Icon = stepIcons[i];
                const done = i <= currentStep;
                return (
                  <div key={step} className="flex items-center gap-4 mb-4 last:mb-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-2 ${done ? "bg-primary border-primary text-white" : "bg-card border-border text-muted-foreground"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-sm font-medium capitalize ${done ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.replace("_", " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Driver info */}
        {order.driverName && (
          <div className="bg-card border border-border rounded-2xl p-4 mb-4">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              {t("Driver Info", "معلومات السائق")}
            </h3>
            <p className="text-sm text-foreground">{order.driverName}</p>
            <p className="text-xs text-muted-foreground">{order.truckPlate}</p>
          </div>
        )}

        {/* Delivery location */}
        {order.deliveryLocation && (
          <div className="bg-card border border-border rounded-2xl p-4 mb-4">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              {t("Delivery Location", "موقع التسليم")}
            </h3>
            <p className="text-sm text-foreground">{order.deliveryLocation}</p>
          </div>
        )}

        {/* Items */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-4">
          <h3 className="font-bold mb-3">{t("Items", "المنتجات")} ({order.items?.length ?? 0})</h3>
          <div className="space-y-3">
            {(order.items ?? []).map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.productName}</p>
                  <p className="text-xs text-muted-foreground">{item.quantity} {item.unit}</p>
                </div>
                <p className="text-sm font-semibold text-primary">
                  {order.currency === "SSP" ? `SSP ${(item.priceSSP * item.quantity).toLocaleString()}` : `$${(item.priceUSD * item.quantity).toFixed(2)}`}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold text-base border-t border-border pt-3 mt-1">
            <span>{t("Total", "الإجمالي")}</span>
            <span className="text-primary">
              {order.currency === "SSP" ? `SSP ${order.totalSSP?.toLocaleString()}` : `$${order.totalUSD?.toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
