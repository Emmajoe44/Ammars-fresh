import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import { brand } from "@/lib/brand";
import { useCart } from "@/contexts/CartContext";
import {
  Home, Package, ShoppingCart, ClipboardList, User,
  LayoutDashboard, Truck, Users, BarChart3, Tag,
  LogOut, Globe, Leaf
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
  { label: "Profile", labelAr: "الملف", icon: User, href: "/admin/profile" },
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
  const location = usePathname();

  if (!user) return <>{children}</>;

  const nav = navForRole(user.role);
  const rootHrefs = ["/retailer", "/farmer", "/admin"];

  const isItemActive = (href: string) =>
    location === href || (!rootHrefs.includes(href) && location.startsWith(href));

  return (
    <div className="flex flex-col min-h-screen bg-background" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Top nav */}
      <header className="no-print sticky top-0 z-30 bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
        <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-white whitespace-nowrap">{brand.name}</span>
          </div>

          <div className="hidden md:flex items-center gap-3 flex-1 justify-end">
            <div className="hidden lg:flex flex-col items-end leading-tight mr-2">
              <p className="font-semibold text-sm truncate max-w-[140px]">{user.name}</p>
              <p className="text-[11px] text-sidebar-foreground/70 capitalize">{user.role}</p>
            </div>
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-sidebar-foreground/80 hover:bg-sidebar-accent/60 transition-colors"
              data-testid="button-toggle-language"
            >
              <Globe className="w-4 h-4" />
              <span>{lang === "en" ? "العربية" : "English"}</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-sidebar-foreground/80 hover:bg-destructive/20 hover:text-destructive transition-colors"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
              <span>{t("Sign Out", "تسجيل الخروج")}</span>
            </button>
          </div>

          <div className="flex md:hidden items-center gap-1">
            <button onClick={() => setLang(lang === "en" ? "ar" : "en")} className="p-1.5 rounded hover:bg-sidebar-accent/40" data-testid="button-mobile-lang">
              <Globe className="w-4 h-4" />
            </button>
            <button onClick={logout} className="p-1.5 rounded hover:bg-destructive/20" data-testid="button-mobile-logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <nav className="flex items-center gap-1 px-2 sm:px-4 overflow-x-auto border-t border-sidebar-border/60 scrollbar-none">
          {nav.map(item => {
            const active = isItemActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors relative",
                  active
                    ? "border-sidebar-primary text-white"
                    : "border-transparent text-sidebar-foreground/75 hover:text-white hover:border-sidebar-border"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{lang === "ar" ? item.labelAr : item.label}</span>
                {item.href === "/retailer/cart" && count > 0 && (
                  <span className="ml-1 bg-sidebar-primary text-sidebar-primary-foreground text-[10px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center font-bold">{count}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}
