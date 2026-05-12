import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import {
  Home, Package, ShoppingCart, ClipboardList, User,
  LayoutDashboard, Truck, Users, BarChart3, Tag,
  LogOut, Globe, Leaf, ChevronRight, Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem { label: string; labelAr: string; icon: React.ComponentType<{ className?: string }>; href: string; }

const retailerNav: NavItem[] = [
  { label: "Home", labelAr: "الرئيسية", icon: Home, href: "/retailer" },
  { label: "Products", labelAr: "المنتجات", icon: Package, href: "/retailer/products" },
  { label: "Cart", labelAr: "السلة", icon: ShoppingCart, href: "/retailer/cart" },
  { label: "Orders", labelAr: "الطلبات", icon: ClipboardList, href: "/retailer/orders" },
  { label: "Profile", labelAr: "الملف", icon: User, href: "/retailer/profile" },
];

const farmerNav: NavItem[] = [
  { label: "Dashboard", labelAr: "لوحة التحكم", icon: Home, href: "/farmer" },
  { label: "Products", labelAr: "المنتجات", icon: Package, href: "/farmer/products" },
  { label: "Sales", labelAr: "المبيعات", icon: BarChart3, href: "/farmer/sales" },
  { label: "Profile", labelAr: "الملف", icon: User, href: "/farmer/profile" },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", labelAr: "لوحة التحكم", icon: LayoutDashboard, href: "/admin" },
  { label: "Orders", labelAr: "الطلبات", icon: ClipboardList, href: "/admin/orders" },
  { label: "Products", labelAr: "المنتجات", icon: Package, href: "/admin/products" },
  { label: "Trucks", labelAr: "الشاحنات", icon: Truck, href: "/admin/trucks" },
  { label: "Analytics", labelAr: "التحليلات", icon: BarChart3, href: "/admin/analytics" },
  { label: "Pricing", labelAr: "التسعير", icon: Tag, href: "/admin/pricing" },
  { label: "Farmers", labelAr: "المزارعون", icon: Leaf, href: "/admin/farmers" },
  { label: "Retailers", labelAr: "التجار", icon: Users, href: "/admin/retailers" },
];

function navForRole(role: string) {
  if (role === "retailer") return retailerNav;
  if (role === "farmer") return farmerNav;
  return adminNav;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLang();
  const { count } = useCart();
  const [location] = useLocation();

  if (!user) return <>{children}</>;

  const nav = navForRole(user.role);

  return (
    <div className="flex min-h-screen bg-background" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-30">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white">AgriMarket</span>
        </div>

        <div className="px-4 py-3 border-b border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/60 uppercase tracking-wider mb-1">{t("Signed in as", "مسجل كـ")}</p>
          <p className="font-semibold text-sm truncate">{user.name}</p>
          <p className="text-xs text-sidebar-foreground/70 capitalize">{user.role}</p>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {nav.map(item => {
            const isActive = location === item.href || (item.href !== "/" && item.href !== "/retailer" && item.href !== "/farmer" && item.href !== "/admin" && location.startsWith(item.href));
            const exactActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <a className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  exactActive || (item.href !== "/retailer" && item.href !== "/farmer" && item.href !== "/admin" && isActive)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{lang === "ar" ? item.labelAr : item.label}</span>
                  {item.href === "/retailer/cart" && count > 0 && (
                    <span className="ml-auto bg-sidebar-primary text-sidebar-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{count}</span>
                  )}
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3 space-y-2">
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60 transition-colors"
            data-testid="button-toggle-language"
          >
            <Globe className="w-4 h-4" />
            <span>{lang === "en" ? "العربية" : "English"}</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-destructive/20 hover:text-destructive transition-colors"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
            <span>{t("Sign Out", "تسجيل الخروج")}</span>
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-sidebar text-sidebar-foreground flex items-center justify-between px-4 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5" />
          <span className="font-bold text-base">AgriMarket</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setLang(lang === "en" ? "ar" : "en")} className="p-1.5 rounded hover:bg-sidebar-accent/40" data-testid="button-mobile-lang">
            <Globe className="w-4 h-4" />
          </button>
          <button onClick={logout} className="p-1.5 rounded hover:bg-destructive/20" data-testid="button-mobile-logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64 mt-14 md:mt-0 min-h-screen">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border flex">
        {nav.slice(0, 5).map(item => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <a className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-2 px-1 text-xs transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                <Icon className="w-5 h-5" />
                <span className="text-[10px] leading-tight">{lang === "ar" ? item.labelAr : item.label}</span>
                {item.href === "/retailer/cart" && count > 0 && (
                  <span className="absolute top-1 right-2 bg-primary text-primary-foreground text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{count}</span>
                )}
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
