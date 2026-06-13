import { AppLayout } from "@/components/Layout";
import { UsersDirectory } from "@/components/admin/UsersDirectory";
import { Tractor } from "lucide-react";

export default function AdminFarmers() {
  return (
    <AppLayout>
      <UsersDirectory
        role="farmer"
        title="Farmers"
        titleAr="المزارعون"
        icon={<Tractor className="w-5 h-5 text-primary" />}
        headerIconClass="bg-primary/10"
        userIcon={(size) => {
          const box = size === "lg" ? "w-14 h-14 rounded-2xl" : size === "sm" ? "w-9 h-9 rounded-lg" : "w-12 h-12 rounded-xl";
          const icon = size === "lg" ? "w-7 h-7" : size === "sm" ? "w-4 h-4" : "w-6 h-6";
          return (
            <div className={`${box} bg-green-100 flex items-center justify-center shrink-0`}>
              <Tractor className={`${icon} text-green-600`} />
            </div>
          );
        }}
        viewStorageKey="agrimarket_admin_farmers_view"
        testIdPrefix="farmer"
        showFarmName
      />
    </AppLayout>
  );
}
