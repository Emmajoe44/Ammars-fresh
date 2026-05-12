import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Leaf, Menu, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/LangContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { t, lang, setLang } = useLang();
  const { user } = useAuth();

  const links = [
    { href: "/", label: t("Home", "الرئيسية") },
    { href: "/about", label: t("About", "من نحن") },
    { href: "/contact", label: t("Contact", "اتصل بنا") },
  ];

  const goDashboard = () => {
    if (!user) return setLocation("/login");
    if (user.role === "retailer") setLocation("/retailer");
    else if (user.role === "farmer") setLocation("/farmer");
    else setLocation("/admin");
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg sm:text-xl text-foreground">AgriMarket</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = location === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
                data-testid={`nav-link-${l.href.replace("/", "") || "home"}`}
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute left-3 right-3 -bottom-0.5 h-0.5 bg-primary rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "en" ? "ar" : "en")}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            data-testid="button-toggle-lang"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === "en" ? "AR" : "EN"}
          </button>

          {user ? (
            <Button size="sm" onClick={goDashboard} data-testid="button-dashboard">
              {t("Dashboard", "لوحة التحكم")}
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/login")}
                className="hidden sm:inline-flex"
                data-testid="button-signin-nav"
              >
                {t("Sign In", "تسجيل الدخول")}
              </Button>
              <Button size="sm" onClick={() => setLocation("/register")} data-testid="button-getstarted-nav">
                {t("Get Started", "ابدأ الآن")}
              </Button>
            </>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg hover:bg-muted/60 transition-colors"
            aria-label="Menu"
            data-testid="button-menu-toggle"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="md:hidden border-t border-border/60 overflow-hidden bg-background"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                    location === l.href ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/60"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setLang(lang === "en" ? "ar" : "en");
                  setOpen(false);
                }}
                className="px-4 py-3 rounded-lg text-sm font-semibold text-muted-foreground hover:bg-muted/60 transition-colors text-left flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                {lang === "en" ? "العربية" : "English"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
