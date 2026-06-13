"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  useListUsers,
  getListUsersQueryKey,
  useUpdateUser,
  type User,
  type ListUsersRole,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLang } from "@/contexts/LangContext";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Phone,
  ToggleRight,
  ToggleLeft,
  LayoutGrid,
  List as ListIcon,
  Table as TableIcon,
} from "lucide-react";
import { motion } from "framer-motion";

type ViewMode = "grid" | "list" | "table";
type StatusFilter = "all" | "active" | "inactive";

type Props = {
  role: ListUsersRole;
  title: string;
  titleAr: string;
  icon: ReactNode;
  headerIconClass: string;
  userIcon: (size?: "sm" | "md" | "lg") => ReactNode;
  viewStorageKey: string;
  testIdPrefix: string;
  showFarmName?: boolean;
};

function ActiveBadge({ active, t }: { active: boolean; t: (en: string, ar: string) => string }) {
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
        active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      {active ? t("Active", "نشط") : t("Inactive", "غير نشط")}
    </span>
  );
}

export function UsersDirectory({
  role,
  title,
  titleAr,
  icon,
  headerIconClass,
  userIcon,
  viewStorageKey,
  testIdPrefix,
  showFarmName = false,
}: Props) {
  const { t } = useLang();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const params = { role };
  const { data, isLoading } = useListUsers(params, { query: { queryKey: getListUsersQueryKey(params) } });
  const updateUser = useUpdateUser();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [view, setView] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "grid";
    const saved = localStorage.getItem(viewStorageKey);
    return saved === "grid" || saved === "list" || saved === "table" ? saved : "grid";
  });

  const setViewPersist = (mode: ViewMode) => {
    setView(mode);
    if (typeof window !== "undefined") localStorage.setItem(viewStorageKey, mode);
  };

  const users = data?.users ?? [];
  const filteredUsers = useMemo(() => {
    if (statusFilter === "all") return users;
    if (statusFilter === "active") return users.filter((u) => u.isActive !== false);
    return users.filter((u) => u.isActive === false);
  }, [users, statusFilter]);

  const statusFilters: { key: StatusFilter; label: string }[] = [
    { key: "all", label: t("All", "الكل") },
    { key: "active", label: t("Active", "نشط") },
    { key: "inactive", label: t("Inactive", "غير نشط") },
  ];

  const handleToggle = (id: number, isActive: boolean) => {
    updateUser.mutate(
      { id, data: { isActive: !isActive } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListUsersQueryKey(params) });
          toast({
            title: t(
              isActive ? "User deactivated" : "User activated",
              isActive ? "تم إيقاف المستخدم" : "تم تنشيط المستخدم",
            ),
          });
        },
      },
    );
  };

  const ToggleButton = ({ user }: { user: User }) => (
    <button
      type="button"
      onClick={() => handleToggle(user.id, user.isActive ?? false)}
      className="p-2 rounded-lg hover:bg-muted transition-colors"
      data-testid={`button-toggle-${user.id}`}
      title={user.isActive ? t("Deactivate", "إيقاف") : t("Activate", "تنشيط")}
    >
      {user.isActive ? (
        <ToggleRight className="w-5 h-5 text-green-600" />
      ) : (
        <ToggleLeft className="w-5 h-5 text-muted-foreground" />
      )}
    </button>
  );

  const UserMeta = ({ user, compact }: { user: User; compact?: boolean }) => (
    <div className={`flex ${compact ? "flex-wrap" : "flex-col"} items-start gap-x-3 gap-y-1`}>
      {showFarmName && user.farmName && (
        <p className={`${compact ? "text-xs" : "text-sm"} text-foreground`}>{user.farmName}</p>
      )}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {user.location && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />
            {user.location}
          </p>
        )}
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Phone className="w-3 h-3 shrink-0" />
          {user.phone}
        </p>
        {user.currency && (
          <p className="text-xs text-muted-foreground">{user.currency}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${headerIconClass}`}>
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">{t(title, titleAr)}</h1>
            <p className="text-sm text-muted-foreground">
              {data?.total ?? 0} {t("registered", "مسجل")}
            </p>
          </div>
        </div>
        <div
          className="inline-flex rounded-xl border border-border bg-background p-1 self-start sm:self-auto"
          role="group"
          aria-label={t("View mode", "وضع العرض")}
        >
          <button
            type="button"
            onClick={() => setViewPersist("grid")}
            className={`px-2.5 py-1.5 rounded-lg transition-colors ${view === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            aria-label={t("Card view", "عرض البطاقات")}
            title={t("Card view", "عرض البطاقات")}
            data-testid={`button-${testIdPrefix}-view-grid`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewPersist("list")}
            className={`px-2.5 py-1.5 rounded-lg transition-colors ${view === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            aria-label={t("List view", "عرض القائمة")}
            title={t("List view", "عرض القائمة")}
            data-testid={`button-${testIdPrefix}-view-list`}
          >
            <ListIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewPersist("table")}
            className={`px-2.5 py-1.5 rounded-lg transition-colors ${view === "table" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            aria-label={t("Table view", "عرض الجدول")}
            title={t("Table view", "عرض الجدول")}
            data-testid={`button-${testIdPrefix}-view-table`}
          >
            <TableIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        {statusFilters.map((s) => {
          const count =
            s.key === "all"
              ? users.length
              : s.key === "active"
                ? users.filter((u) => u.isActive !== false).length
                : users.filter((u) => u.isActive === false).length;
          const active = statusFilter === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setStatusFilter(s.key)}
              className={`rounded-2xl p-4 text-center border transition-colors ${
                active ? "bg-primary/10 border-primary/30" : "bg-card border-border hover:bg-muted/50"
              }`}
              data-testid={`filter-${testIdPrefix}-${s.key}`}
            >
              <p className={`text-2xl font-extrabold ${active ? "text-primary" : "text-foreground"}`}>{count}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-border">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 animate-pulse flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center opacity-40 ${headerIconClass}`}>
              {icon}
            </div>
            <p>{t("No users match this filter", "لا يوجد مستخدمون يطابقون هذا التصفية")}</p>
          </div>
        ) : view === "grid" ? (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user, i) => (
              <motion.article
                key={user.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="border border-border rounded-2xl p-4 flex flex-col gap-3 bg-background hover:shadow-md transition-shadow"
                data-testid={`${testIdPrefix}-card-${user.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  {userIcon("lg")}
                  <ActiveBadge active={user.isActive !== false} t={t} />
                </div>
                <div>
                  <p className="font-bold text-lg text-foreground">{user.name}</p>
                  <UserMeta user={user} />
                </div>
                <div className="flex justify-end pt-2 border-t border-border">
                  <ToggleButton user={user} />
                </div>
              </motion.article>
            ))}
          </div>
        ) : view === "list" ? (
          <div className="divide-y divide-border">
            {filteredUsers.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                data-testid={`${testIdPrefix}-list-${user.id}`}
              >
                {userIcon()}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-foreground">{user.name}</p>
                    <ActiveBadge active={user.isActive !== false} t={t} />
                  </div>
                  <UserMeta user={user} compact />
                </div>
                <ToggleButton user={user} />
              </motion.div>
            ))}
          </div>
        ) : (
          <>
            <table className="w-full hidden md:table">
              <thead className="bg-muted/40 border-b border-border">
                <tr className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="text-left px-5 py-3">{t("Name", "الاسم")}</th>
                  {showFarmName && <th className="text-left px-3 py-3">{t("Farm", "المزرعة")}</th>}
                  <th className="text-left px-3 py-3">{t("Phone", "الهاتف")}</th>
                  <th className="text-left px-3 py-3">{t("Location", "الموقع")}</th>
                  {!showFarmName && <th className="text-left px-3 py-3">{t("Currency", "العملة")}</th>}
                  <th className="text-center px-3 py-3">{t("Status", "الحالة")}</th>
                  <th className="text-right px-5 py-3">{t("Actions", "إجراءات")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-muted/30 transition-colors"
                    data-testid={`${testIdPrefix}-row-${user.id}`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {userIcon("sm")}
                        <span className="font-semibold text-sm">{user.name}</span>
                      </div>
                    </td>
                    {showFarmName && (
                      <td className="px-3 py-3 text-sm text-muted-foreground">{user.farmName ?? "—"}</td>
                    )}
                    <td className="px-3 py-3 text-sm text-muted-foreground">{user.phone}</td>
                    <td className="px-3 py-3 text-sm text-muted-foreground">{user.location ?? "—"}</td>
                    {!showFarmName && (
                      <td className="px-3 py-3 text-sm text-muted-foreground">{user.currency ?? "—"}</td>
                    )}
                    <td className="px-3 py-3 text-center">
                      <ActiveBadge active={user.isActive !== false} t={t} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <ToggleButton user={user} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            <div className="md:hidden divide-y divide-border">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 space-y-2" data-testid={`${testIdPrefix}-row-mobile-${user.id}`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {userIcon("sm")}
                      <span className="font-bold truncate">{user.name}</span>
                    </div>
                    <ActiveBadge active={user.isActive !== false} t={t} />
                  </div>
                  <UserMeta user={user} compact />
                  <div className="flex justify-end">
                    <ToggleButton user={user} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
