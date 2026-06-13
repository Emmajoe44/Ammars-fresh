import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/contexts/LangContext";
import { useListTrucks, getListTrucksQueryKey, type Truck } from "@workspace/api-client-react";
import { AppLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Truck as TruckIcon,
  MapPin,
  Phone,
  Pencil,
  LayoutGrid,
  List as ListIcon,
  Table as TableIcon,
} from "lucide-react";
import { motion } from "framer-motion";

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  in_transit: "bg-orange-100 text-orange-700",
  maintenance: "bg-red-100 text-red-700",
};

const statusIconStyles: Record<string, { box: string; icon: string }> = {
  available: { box: "bg-green-100", icon: "text-green-600" },
  in_transit: { box: "bg-orange-100", icon: "text-orange-600" },
  maintenance: { box: "bg-red-100", icon: "text-red-600" },
};

type StatusFilter = "all" | "available" | "in_transit" | "maintenance";
type ViewMode = "grid" | "list" | "table";

function formatGps(truck: Truck) {
  if (truck.lat != null && truck.lng != null) {
    return `${truck.lat.toFixed(2)}, ${truck.lng.toFixed(2)}`;
  }
  return null;
}

export default function AdminTrucks() {
  const { t } = useLang();
  const { push: setLocation } = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [view, setView] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "grid";
    const saved = localStorage.getItem("agrimarket_admin_trucks_view");
    return saved === "grid" || saved === "list" || saved === "table" ? saved : "grid";
  });
  const { data: trucks, isLoading } = useListTrucks({ query: { queryKey: getListTrucksQueryKey() } });

  const setViewPersist = (mode: ViewMode) => {
    setView(mode);
    if (typeof window !== "undefined") localStorage.setItem("agrimarket_admin_trucks_view", mode);
  };

  const filteredTrucks = useMemo(() => {
    const list = trucks ?? [];
    if (statusFilter === "all") return list;
    return list.filter((tr) => tr.status === statusFilter);
  }, [trucks, statusFilter]);

  const statusFilters: { key: StatusFilter; label: string }[] = [
    { key: "all", label: t("All", "الكل") },
    { key: "available", label: t("Available", "متاحة") },
    { key: "in_transit", label: t("In Transit", "في الطريق") },
    { key: "maintenance", label: t("Maintenance", "صيانة") },
  ];

  const goEdit = (id: number) => setLocation(`/admin/trucks/${id}`);

  const StatusBadge = ({ status }: { status: string }) => (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[status] ?? "bg-muted"}`}>
      {status.replace("_", " ")}
    </span>
  );

  const TruckIconBox = ({ status, size = "md" }: { status: string; size?: "sm" | "md" | "lg" }) => {
    const styles = statusIconStyles[status] ?? { box: "bg-muted", icon: "text-muted-foreground" };
    const box =
      size === "lg" ? "w-14 h-14 rounded-2xl" : size === "sm" ? "w-9 h-9 rounded-lg" : "w-12 h-12 rounded-xl";
    const icon = size === "lg" ? "w-7 h-7" : size === "sm" ? "w-4 h-4" : "w-6 h-6";
    return (
      <div className={`${box} ${styles.box} flex items-center justify-center shrink-0`}>
        <TruckIcon className={`${icon} ${styles.icon}`} />
      </div>
    );
  };

  const EditButton = ({ id, size = "sm" }: { id: number; size?: "sm" | "icon" }) =>
    size === "icon" ? (
      <button
        type="button"
        onClick={() => goEdit(id)}
        className="p-2 rounded-lg hover:bg-muted transition-colors"
        data-testid={`button-edit-truck-${id}`}
        title={t("Edit", "تعديل")}
      >
        <Pencil className="w-4 h-4 text-muted-foreground" />
      </button>
    ) : (
      <Button
        variant="outline"
        size="sm"
        className="shrink-0 gap-1.5"
        onClick={() => goEdit(id)}
        data-testid={`button-edit-truck-${id}`}
      >
        <Pencil className="w-3.5 h-3.5" />
        {t("Edit", "تعديل")}
      </Button>
    );

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">{t("Truck Fleet", "أسطول الشاحنات")}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t(`${trucks?.length ?? 0} trucks total`, `${trucks?.length ?? 0} شاحنة إجمالاً`)}
            </p>
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
                data-testid="button-view-grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewPersist("list")}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${view === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                aria-label={t("List view", "عرض القائمة")}
                title={t("List view", "عرض القائمة")}
                data-testid="button-view-list"
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewPersist("table")}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${view === "table" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                aria-label={t("Table view", "عرض الجدول")}
                title={t("Table view", "عرض الجدول")}
                data-testid="button-view-table"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>
            <Button onClick={() => setLocation("/admin/trucks/new")} className="gap-2 shrink-0" data-testid="button-add-truck">
              <Plus className="w-4 h-4" />
              {t("Add Truck", "إضافة شاحنة")}
            </Button>
          </div>
        </div>

        {/* Fleet summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {statusFilters.map((s) => {
            const count =
              s.key === "all"
                ? (trucks?.length ?? 0)
                : (trucks?.filter((tr) => tr.status === s.key).length ?? 0);
            const active = statusFilter === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setStatusFilter(s.key)}
                className={`rounded-2xl p-4 text-center border transition-colors ${
                  active ? "bg-primary/10 border-primary/30" : "bg-card border-border hover:bg-muted/50"
                }`}
                data-testid={`filter-trucks-${s.key}`}
              >
                <p className={`text-2xl font-extrabold ${active ? "text-primary" : "text-foreground"}`}>{count}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </button>
            );
          })}
        </div>

        {/* GPS overview */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-5 overflow-hidden">
          <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            {t("GPS Overview", "نظرة GPS")}
          </h2>
          <div className="relative bg-primary/5 rounded-xl h-48 border border-primary/10">
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-4">
              {[...Array(32)].map((_, i) => (
                <div key={i} className="border-[0.5px] border-primary/5" />
              ))}
            </div>
            {filteredTrucks
              .filter((tr) => tr.lat && tr.lng)
              .map((tr) => {
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
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center border-2 border-white shadow-md ${
                        tr.status === "available"
                          ? "bg-green-500"
                          : tr.status === "in_transit"
                            ? "bg-orange-500"
                            : "bg-red-500"
                      }`}
                    >
                      <TruckIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                );
              })}
            {filteredTrucks.filter((tr) => tr.lat && tr.lng).length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                {t("No GPS data for this filter", "لا توجد بيانات GPS لهذا التصفية")}
              </div>
            )}
          </div>
        </div>

        {/* Trucks */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-border">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 animate-pulse flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTrucks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TruckIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>{t("No trucks match this filter", "لا توجد شاحنات تطابق هذا التصفية")}</p>
            </div>
          ) : view === "grid" ? (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTrucks.map((truck, i) => {
                const gps = formatGps(truck);
                return (
                  <motion.article
                    key={truck.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border border-border rounded-2xl p-4 flex flex-col gap-3 bg-background hover:shadow-md transition-shadow"
                    data-testid={`truck-card-${truck.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <TruckIconBox status={truck.status} size="lg" />
                      <StatusBadge status={truck.status} />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-foreground">{truck.plateNumber}</p>
                      <p className="text-sm text-foreground mt-1">{truck.driverName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {truck.driverPhone}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                      {gps ? (
                        <p className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {gps}
                        </p>
                      ) : (
                        <p>{t("No GPS set", "لا يوجد GPS")}</p>
                      )}
                      {truck.currentOrderId && (
                        <p className="text-primary font-medium">Order #{truck.currentOrderId}</p>
                      )}
                    </div>
                    <EditButton id={truck.id} />
                  </motion.article>
                );
              })}
            </div>
          ) : view === "list" ? (
            <div className="divide-y divide-border">
              {filteredTrucks.map((truck, i) => {
                const gps = formatGps(truck);
                return (
                  <motion.div
                    key={truck.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                    data-testid={`truck-list-${truck.id}`}
                  >
                    <TruckIconBox status={truck.status} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-foreground">{truck.plateNumber}</p>
                        <StatusBadge status={truck.status} />
                      </div>
                      <p className="text-sm text-foreground mt-0.5">{truck.driverName}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {truck.driverPhone}
                        </span>
                        {gps && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {gps}
                          </span>
                        )}
                        {truck.currentOrderId && (
                          <span className="text-primary">Order #{truck.currentOrderId}</span>
                        )}
                      </div>
                    </div>
                    <EditButton id={truck.id} size="icon" />
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <>
              <table className="w-full hidden md:table">
                <thead className="bg-muted/40 border-b border-border">
                  <tr className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="text-left px-5 py-3">{t("Plate", "اللوحة")}</th>
                    <th className="text-left px-3 py-3">{t("Driver", "السائق")}</th>
                    <th className="text-left px-3 py-3">{t("Phone", "الهاتف")}</th>
                    <th className="text-center px-3 py-3">{t("Status", "الحالة")}</th>
                    <th className="text-left px-3 py-3">{t("GPS", "GPS")}</th>
                    <th className="text-left px-3 py-3">{t("Order", "الطلب")}</th>
                    <th className="text-right px-5 py-3">{t("Actions", "إجراءات")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTrucks.map((truck, i) => {
                    const gps = formatGps(truck);
                    return (
                      <motion.tr
                        key={truck.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-muted/30 transition-colors"
                        data-testid={`truck-row-${truck.id}`}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <TruckIconBox status={truck.status} size="sm" />
                            <span className="font-semibold text-sm">{truck.plateNumber}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm">{truck.driverName}</td>
                        <td className="px-3 py-3 text-sm text-muted-foreground">{truck.driverPhone}</td>
                        <td className="px-3 py-3 text-center">
                          <StatusBadge status={truck.status} />
                        </td>
                        <td className="px-3 py-3 text-xs text-muted-foreground">{gps ?? "—"}</td>
                        <td className="px-3 py-3 text-sm">
                          {truck.currentOrderId ? (
                            <span className="text-primary font-medium">#{truck.currentOrderId}</span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <EditButton id={truck.id} size="icon" />
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Mobile: stacked rows when table view selected */}
              <div className="md:hidden divide-y divide-border">
                {filteredTrucks.map((truck) => {
                  const gps = formatGps(truck);
                  return (
                    <div key={truck.id} className="p-4 space-y-2" data-testid={`truck-row-mobile-${truck.id}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <TruckIconBox status={truck.status} size="sm" />
                          <span className="font-bold truncate">{truck.plateNumber}</span>
                        </div>
                        <StatusBadge status={truck.status} />
                      </div>
                      <p className="text-sm">{truck.driverName}</p>
                      <p className="text-xs text-muted-foreground">{truck.driverPhone}</p>
                      {gps && <p className="text-xs text-muted-foreground">{gps}</p>}
                      <div className="flex justify-end pt-1">
                        <EditButton id={truck.id} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
