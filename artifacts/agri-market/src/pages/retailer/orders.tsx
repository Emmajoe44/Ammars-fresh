import { useLocation } from "wouter";
import { useLang } from "@/contexts/LangContext";
import { useListOrders, getListOrdersQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  assigned: "bg-purple-100 text-purple-800 border-purple-200",
  in_transit: "bg-orange-100 text-orange-800 border-orange-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function RetailerOrders() {
  const { t } = useLang();
  const [, setLocation] = useLocation();
  const { data, isLoading } = useListOrders({}, { query: { queryKey: getListOrdersQueryKey({}) } });

  return (
    <AppLayout>
      <div className="p-4 md:p-6 pb-20 md:pb-8 max-w-lg mx-auto">
        <h1 className="text-2xl font-extrabold text-foreground mb-4">{t("My Orders", "طلباتي")}</h1>

        {isLoading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}</div>
        ) : data?.orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardList className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="font-semibold text-foreground">{t("No orders yet", "لا توجد طلبات")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(data?.orders ?? []).map((order, i) => (
              <motion.button
                key={order.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => setLocation(`/retailer/orders/${order.id}`)}
                className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:border-primary/40 transition-all text-left"
                data-testid={`button-order-${order.id}`}
              >
                <div>
                  <p className="font-bold text-foreground">
                    {t("Order", "طلب")} #{order.id}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {order.items?.length ?? 0} {t("items", "منتجات")} · {order.currency === "SSP" ? `SSP ${order.totalSSP?.toLocaleString()}` : `$${order.totalUSD?.toFixed(2)}`}
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border ${statusColors[order.status] ?? ""}`} data-testid={`status-order-${order.id}`}>
                    {order.status.replace("_", " ")}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
