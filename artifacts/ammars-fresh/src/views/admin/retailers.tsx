import { AppLayout } from "@/components/Layout";
import { UsersDirectory } from "@/components/admin/UsersDirectory";
import { ShoppingBag } from "lucide-react";

export default function AdminRetailers() {
  return (
    <AppLayout>
      <UsersDirectory
        role="retailer"
        title="Retailers"
        titleAr="التجار"
        icon={<ShoppingBag className="w-5 h-5 text-secondary" />}
        headerIconClass="bg-secondary/10"
        userIcon={(size) => {
          const box = size === "lg" ? "w-14 h-14 rounded-2xl" : size === "sm" ? "w-9 h-9 rounded-lg" : "w-12 h-12 rounded-xl";
          const icon = size === "lg" ? "w-7 h-7" : size === "sm" ? "w-4 h-4" : "w-6 h-6";
          return (
            <div className={`${box} bg-secondary/10 flex items-center justify-center shrink-0`}>
              <ShoppingBag className={`${icon} text-secondary`} />
            </div>
          );
        }}
        viewStorageKey="agrimarket_admin_retailers_view"
        testIdPrefix="retailer"
      />
    </AppLayout>
  );
}
