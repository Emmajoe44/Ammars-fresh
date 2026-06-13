import { useEffect, useState, useCallback, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Leaf,
  Menu,
  X,
  Globe,
  LayoutDashboard,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/LangContext";
import { useAuth } from "@/contexts/AuthContext";
import { brand } from "@/lib/brand";
import { motion, AnimatePresence } from "framer-motion";

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hash, setHash] = useState("");
  const location = usePathname();
  const { push: setLocation } = useRouter();
  const { t, lang, setLang } = useLang();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [location]);

  useEffect(() => {
    if (location !== "/" || !window.location.hash) return;
    const id = window.location.hash.replace(/^#/, "");
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => window.clearTimeout(t);
  }, [location]);

  const scrollToHash = useCallback((targetHash: string) => {
    const id = targetHash.replace(/^#/, "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", `/#${id}`);
      setHash(`#${id}`);
    }
  }, []);

  const links = [
    { href: "/", label: t("Home", "الرئيسية"), hash: null },
    { href: "/#products", label: t("Products", "المنتجات"), hash: "#products" },
    { href: "/about", label: t("About", "من نحن"), hash: null },
    { href: "/contact", label: t("Contact", "اتصل بنا"), hash: null },
  ];

  const isLinkActive = (href: string, linkHash: string | null) => {
    if (linkHash) return location === "/" && hash === linkHash;
    if (href === "/") return location === "/" && !hash;
    return location === href;
  };

  const handleNavClick = (href: string, linkHash: string | null, e: MouseEvent<HTMLAnchorElement>) => {
    if (linkHash && location === "/") {
      e.preventDefault();
      scrollToHash(linkHash);
      setOpen(false);
    } else {
      setOpen(false);
    }
  };

  const navTestId = (href: string) => {
    if (href === "/") return "home";
    if (href.startsWith("/#")) return href.slice(2);
    return href.replace("/", "");
  };

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
          <Link
            href="/about"
            className="hidden sm:inline-flex items-center gap-1 font-bold underline-offset-2 hover:underline"
            aria-label={t("Learn more about live truck tracking for retailers", "اعرف المزيد عن تتبع الشاحنات المباشر للتجار")}
          >
            {t("Learn about truck tracking", "تعرّف على تتبع الشاحنات")}
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
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
              <span className="font-extrabold text-[17px] text-foreground tracking-tight">{brand.name}</span>
              <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase mt-0.5">
                South Sudan
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {links.map((l) => {
              const active = isLinkActive(l.href, l.hash);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={(e) => handleNavClick(l.href, l.hash, e)}
                  className={`relative px-4 py-2 text-[14px] font-semibold rounded-lg transition-colors ${
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`nav-link-${navTestId(l.href)}`}
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
                    onClick={(e) => handleNavClick(l.href, l.hash, e)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-semibold transition-colors ${
                      isLinkActive(l.href, l.hash)
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {l.label}
                    <ArrowRight className="w-4 h-4 opacity-40" />
                  </Link>
                ))}

                {user ? (
                  <Button
                    onClick={() => {
                      goDashboard();
                      setOpen(false);
                    }}
                    className="mt-2 w-full font-semibold"
                    data-testid="button-dashboard-mobile"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    {t("Dashboard", "لوحة التحكم")}
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setLocation("/register");
                      setOpen(false);
                    }}
                    className="mt-2 w-full font-semibold"
                    data-testid="button-getstarted-mobile"
                  >
                    {t("Get started", "ابدأ الآن")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}

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
