import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Leaf,
  Menu,
  X,
  Globe,
  ChevronDown,
  ShoppingBasket,
  Tractor,
  LayoutDashboard,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/LangContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location, setLocation] = useLocation();
  const { t, lang, setLang } = useLang();
  const { user } = useAuth();
  const solutionsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (solutionsRef.current && !solutionsRef.current.contains(e.target as Node)) {
        setSolutionsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const links = [
    { href: "/", label: t("Home", "الرئيسية") },
    { href: "/about", label: t("About", "من نحن") },
    { href: "/contact", label: t("Contact", "اتصل بنا") },
  ];

  const solutions = [
    {
      href: "/register",
      icon: ShoppingBasket,
      title: t("For Retailers", "للتجار"),
      desc: t("Source fresh produce daily", "اطلب منتجات طازجة يومياً"),
      tone: "text-amber-600 bg-amber-100",
    },
    {
      href: "/register",
      icon: Tractor,
      title: t("For Farmers", "للمزارعين"),
      desc: t("Sell your harvest, fair prices", "بع محاصيلك بأسعار عادلة"),
      tone: "text-primary bg-primary/10",
    },
    {
      href: "/login",
      icon: LayoutDashboard,
      title: t("For Admins", "للإداريين"),
      desc: t("Logistics command center", "مركز قيادة اللوجستيات"),
      tone: "text-secondary bg-secondary/15",
    },
  ];

  const goDashboard = () => {
    if (!user) return setLocation("/login");
    if (user.role === "retailer") setLocation("/retailer");
    else if (user.role === "farmer") setLocation("/farmer");
    else setLocation("/admin");
  };

  return (
    <div className="sticky top-0 z-40">
      {/* Announcement bar */}
      <div className="bg-foreground text-background text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-center gap-2 text-center">
          <Sparkles className="w-3.5 h-3.5 text-primary-foreground/90" />
          <span className="font-medium">
            {t(
              "New: Live truck tracking is now available for retailers",
              "جديد: تتبع الشاحنات المباشر متاح الآن للتجار",
            )}
          </span>
          <Link href="/about" className="hidden sm:inline-flex items-center gap-1 font-bold underline-offset-2 hover:underline">
            {t("Learn more", "اعرف المزيد")}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main nav */}
      <header
        className={`backdrop-blur-xl transition-all duration-200 ${
          scrolled
            ? "bg-background/85 border-b border-border shadow-sm"
            : "bg-background/60 border-b border-border/40"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0" data-testid="link-logo">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-primary/40 group-hover:scale-105 transition-all">
              <Leaf className="w-5 h-5 text-white" strokeWidth={2.5} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-background" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-[17px] text-foreground tracking-tight">AgriMarket</span>
              <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase mt-0.5">
                South Sudan
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {links.map((l) => {
              const active = location === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative px-4 py-2 text-[14px] font-semibold rounded-lg transition-colors ${
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`nav-link-${l.href.replace("/", "") || "home"}`}
                >
                  {l.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute left-3 right-3 -bottom-1 h-[3px] bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Solutions dropdown */}
            <div className="relative" ref={solutionsRef}>
              <button
                onClick={() => setSolutionsOpen((v) => !v)}
                className={`flex items-center gap-1 px-4 py-2 text-[14px] font-semibold rounded-lg transition-colors ${
                  solutionsOpen ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="button-solutions"
              >
                {t("Solutions", "الحلول")}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${solutionsOpen ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {solutionsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[360px] bg-background border border-border rounded-2xl shadow-2xl shadow-black/10 overflow-hidden"
                  >
                    <div className="p-2">
                      {solutions.map((s) => {
                        const Icon = s.icon;
                        return (
                          <Link
                            key={s.title}
                            href={s.href}
                            onClick={() => setSolutionsOpen(false)}
                            className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted transition-colors group/item"
                          >
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${s.tone}`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[14px] font-bold text-foreground">{s.title}</span>
                                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground -translate-x-1 opacity-0 group-hover/item:translate-x-0 group-hover/item:opacity-100 transition-all" />
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    <div className="px-4 py-3 bg-muted/40 border-t border-border flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {t("Not sure which fits?", "لست متأكداً أيهما يناسبك؟")}
                      </span>
                      <Link
                        href="/contact"
                        onClick={() => setSolutionsOpen(false)}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        {t("Talk to us →", "تحدث إلينا ←")}
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              data-testid="button-toggle-lang"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === "en" ? "AR" : "EN"}
            </button>

            <div className="hidden sm:block w-px h-6 bg-border mx-1" />

            {user ? (
              <Button
                size="sm"
                onClick={goDashboard}
                className="font-semibold shadow-md shadow-primary/20"
                data-testid="button-dashboard"
              >
                <LayoutDashboard className="w-4 h-4 mr-1.5" />
                {t("Dashboard", "لوحة التحكم")}
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/login")}
                  className="hidden sm:inline-flex font-semibold text-muted-foreground hover:text-foreground"
                  data-testid="button-signin-nav"
                >
                  {t("Sign in", "تسجيل الدخول")}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setLocation("/register")}
                  className="font-semibold shadow-md shadow-primary/20 group"
                  data-testid="button-getstarted-nav"
                >
                  {t("Get started", "ابدأ الآن")}
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </>
            )}

            <button
              onClick={() => setOpen((v) => !v)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors ml-1"
              aria-label="Menu"
              data-testid="button-menu-toggle"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="lg:hidden border-t border-border overflow-hidden bg-background"
            >
              <div className="px-4 py-4 flex flex-col gap-1 max-w-7xl mx-auto">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-semibold transition-colors ${
                      location === l.href
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {l.label}
                    <ArrowRight className="w-4 h-4 opacity-40" />
                  </Link>
                ))}

                <div className="mt-3 pt-3 border-t border-border">
                  <p className="px-4 mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {t("Solutions", "الحلول")}
                  </p>
                  {solutions.map((s) => {
                    const Icon = s.icon;
                    return (
                      <Link
                        key={s.title}
                        href={s.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors"
                      >
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.tone}`}
                        >
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] font-bold text-foreground">{s.title}</div>
                          <p className="text-xs text-muted-foreground">{s.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                  <button
                    onClick={() => {
                      setLang(lang === "en" ? "ar" : "en");
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors border border-border"
                  >
                    <Globe className="w-4 h-4" />
                    {lang === "en" ? "العربية" : "English"}
                  </button>
                  {!user && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setLocation("/login");
                        setOpen(false);
                      }}
                      className="flex-1 font-semibold"
                    >
                      {t("Sign in", "دخول")}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>
  );
}
