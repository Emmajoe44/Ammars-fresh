import { useLang } from "@/contexts/LangContext";
import { useListUsers, getListUsersQueryKey, useUpdateUser } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, ShoppingBag, ToggleRight, ToggleLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminRetailers() {
  const { t } = useLang();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const params = { role: "retailer" as const };
  const { data, isLoading } = useListUsers(params, { query: { queryKey: getListUsersQueryKey(params) } });
  const updateUser = useUpdateUser();

  const handleToggle = (id: number, isActive: boolean) => {
    updateUser.mutate({ id, data: { isActive: !isActive } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey(params) });
        toast({ title: t(isActive ? "User deactivated" : "User activated", isActive ? "تم إيقاف المستخدم" : "تم تنشيط المستخدم") });
      },
    });
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">{t("Retailers", "التجار")}</h1>
            <p className="text-sm text-muted-foreground">{data?.total ?? 0} {t("registered", "مسجل")}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}</div>
        ) : (
          <div className="space-y-3">
            {(data?.users ?? []).map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4"
                data-testid={`retailer-card-${user.id}`}
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-foreground">{user.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {user.isActive ? t("Active", "نشط") : t("Inactive", "غير نشط")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {user.location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{user.location}</p>}
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{user.phone}</p>
                  </div>
                </div>
                <button onClick={() => handleToggle(user.id, user.isActive ?? false)} className="p-2 rounded-lg hover:bg-muted transition-colors flex-shrink-0" data-testid={`button-toggle-${user.id}`}>
                  {user.isActive ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
