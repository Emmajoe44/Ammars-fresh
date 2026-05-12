import { useLocation } from "wouter";
import { useLang } from "@/contexts/LangContext";
import { useListTrucks, getListTrucksQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plus, Truck, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  in_transit: "bg-orange-100 text-orange-700",
  maintenance: "bg-red-100 text-red-700",
};

export default function AdminTrucks() {
  const { t } = useLang();
  const [, setLocation] = useLocation();
  const { data: trucks, isLoading } = useListTrucks({ query: { queryKey: getListTrucksQueryKey() } });

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-extrabold text-foreground">{t("Truck Fleet", "أسطول الشاحنات")}</h1>
          <Button onClick={() => setLocation("/admin/trucks/new")} className="gap-2" data-testid="button-add-truck">
            <Plus className="w-4 h-4" />
            {t("Add Truck", "إضافة شاحنة")}
          </Button>
        </div>

        {/* Fleet summary */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: t("Available", "متاحة"), count: trucks?.filter(t => t.status === "available").length ?? 0, color: "text-green-600", bg: "bg-green-50 border-green-100" },
            { label: t("In Transit", "في الطريق"), count: trucks?.filter(t => t.status === "in_transit").length ?? 0, color: "text-orange-600", bg: "bg-orange-50 border-orange-100" },
            { label: t("Maintenance", "صيانة"), count: trucks?.filter(t => t.status === "maintenance").length ?? 0, color: "text-red-600", bg: "bg-red-50 border-red-100" },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} border rounded-2xl p-4 text-center`}>
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Simple coordinate map visualization */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-5 overflow-hidden">
          <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            {t("GPS Overview", "نظرة GPS")}
          </h2>
          <div className="relative bg-primary/5 rounded-xl h-48 border border-primary/10">
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-4">
              {[...Array(32)].map((_, i) => <div key={i} className="border-[0.5px] border-primary/5" />)}
            </div>
            {(trucks ?? []).filter(tr => tr.lat && tr.lng).map(tr => {
              const x = ((tr.lng! + 35) / 10) * 100;
              const y = ((10 - (tr.lat! - 4)) / 10) * 100;
              return (
                <div
                  key={tr.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${Math.max(5, Math.min(95, x))}%`, top: `${Math.max(5, Math.min(95, y))}%` }}
                  title={`${tr.plateNumber} — ${tr.driverName}`}
                  data-testid={`truck-pin-${tr.id}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-md ${tr.status === "available" ? "bg-green-500" : tr.status === "in_transit" ? "bg-orange-500" : "bg-red-500"}`}>
                    <Truck className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              );
            })}
            {(trucks ?? []).filter(tr => tr.lat && tr.lng).length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                {t("No GPS data available", "لا توجد بيانات GPS")}
              </div>
            )}
          </div>
        </div>

        {/* Truck list */}
        {isLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}</div>
        ) : (
          <div className="space-y-3">
            {(trucks ?? []).map((truck, i) => (
              <motion.div
                key={truck.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4"
                data-testid={`truck-card-${truck.id}`}
              >
                <div className={`w-12 h-12 rounded-xl ${truck.status === "available" ? "bg-green-100" : truck.status === "in_transit" ? "bg-orange-100" : "bg-red-100"} flex items-center justify-center flex-shrink-0`}>
                  <Truck className={`w-6 h-6 ${truck.status === "available" ? "text-green-600" : truck.status === "in_transit" ? "text-orange-600" : "text-red-600"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-foreground">{truck.plateNumber}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[truck.status]}`}>
                      {truck.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mt-0.5">{truck.driverName}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" />{truck.driverPhone}
                  </p>
                </div>
                {truck.lat && truck.lng && (
                  <div className="text-right text-xs text-muted-foreground flex-shrink-0">
                    <MapPin className="w-3 h-3 inline mr-0.5" />
                    <span>{truck.lat.toFixed(2)}, {truck.lng.toFixed(2)}</span>
                    {truck.currentOrderId && <p className="mt-0.5">Order #{truck.currentOrderId}</p>}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
