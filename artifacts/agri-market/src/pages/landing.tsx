import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import {
  Leaf, ShoppingBasket, Tractor, LayoutDashboard, ArrowRight,
  Truck, MapPin, ShieldCheck, Sparkles, BarChart3, Languages,
  Wallet, PackageCheck, Users, CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { PublicNav } from "@/components/PublicNav";
import { PublicFooter } from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const [, setLocation] = useLocation();

  const goDashboard = () => {
    if (!user) return setLocation("/register");
    if (user.role === "retailer") setLocation("/retailer");
    else if (user.role === "farmer") setLocation("/farmer");
    else setLocation("/admin");
  };

  const roles = [
    {
      key: "retailer",
      icon: ShoppingBasket,
      title: t("I am a Retailer", "أنا تاجر"),
      desc: t("Source fresh produce daily, track delivery in real time.", "اطلب منتجات طازجة يومياً وتتبع التوصيل مباشرة."),
      tone: "from-amber-500/15 to-amber-500/5 text-amber-600",
      action: () => setLocation("/login?role=retailer"),
    },
    {
      key: "farmer",
      icon: Tractor,
      title: t("I am a Farmer", "أنا مزارع"),
      desc: t("Reach city retailers, set fair prices, grow your sales.", "اصل إلى تجار المدن، حدد أسعارك العادلة، وزد مبيعاتك."),
      tone: "from-primary/20 to-primary/5 text-primary",
      action: () => setLocation("/login?role=farmer"),
    },
    {
      key: "admin",
      icon: LayoutDashboard,
      title: t("Admin Login", "دخول الإدارة"),
      desc: t("Manage trucks, pricing, and platform analytics.", "إدارة الشاحنات والتسعير وتحليلات المنصة."),
      tone: "from-slate-200 to-slate-100 text-slate-700 dark:from-slate-700/40 dark:to-slate-700/10 dark:text-slate-200",
      action: () => setLocation("/login?role=admin"),
    },
  ];

  const features = [
    { icon: Truck, title: t("Live truck tracking", "تتبع الشاحنات المباشر"), desc: t("Step-by-step delivery updates from farm to market.", "تحديثات توصيل مرحلية من المزرعة إلى السوق.") },
    { icon: ShieldCheck, title: t("Verified farms", "مزارع موثقة"), desc: t("Quality grade on every product, every order.", "درجة جودة على كل منتج وكل طلب.") },
    { icon: Wallet, title: t("SSP & USD pricing", "السعر بالجنيه والدولار"), desc: t("Toggle between currencies anywhere in the app.", "تبديل بين العملات في أي مكان داخل التطبيق.") },
    { icon: Languages, title: t("English + Arabic", "إنجليزي + عربي"), desc: t("Full RTL support across the entire platform.", "دعم كامل للكتابة من اليمين عبر المنصة.") },
    { icon: BarChart3, title: t("Demand analytics", "تحليلات الطلب"), desc: t("Charts for sales, top products, and category trends.", "رسوم بيانية للمبيعات والمنتجات الأكثر مبيعاً.") },
    { icon: MapPin, title: t("Built for South Sudan", "مصمم لجنوب السودان"), desc: t("Local categories, currencies, and logistics routes.", "فئات وعملات وطرق لوجستية محلية.") },
  ];

  const steps = [
    { n: "01", icon: Users, title: t("Create your account", "أنشئ حسابك"), desc: t("Sign up as a retailer, farmer, or get an admin invite.", "سجل كتاجر أو مزارع، أو اطلب دعوة كمشرف.") },
    { n: "02", icon: PackageCheck, title: t("List or shop produce", "اعرض أو اشتر المنتجات"), desc: t("Farmers list harvest with photos. Retailers browse & order.", "يعرض المزارعون منتجاتهم بالصور. يتصفح التجار ويطلبون.") },
    { n: "03", icon: Truck, title: t("Track to delivery", "تتبع حتى التسليم"), desc: t("Admin assigns trucks. Everyone sees live status.", "يخصص المشرف الشاحنات. الجميع يرى الحالة مباشرة.") },
  ];

  const stats = [
    { value: "10+", label: t("Categories", "فئة") },
    { value: "24/7", label: t("Marketplace", "سوق") },
    { value: "EN/AR", label: t("Languages", "اللغات") },
    { value: "SSP/USD", label: t("Currencies", "العملات") },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={lang === "ar" ? "rtl" : "ltr"}>
      <PublicNav />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="absolute inset-0 -z-0 opacity-60 [background-image:radial-gradient(circle_at_1px_1px,theme(colors.primary/12)_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="relative max-w-7xl mx-auto px-6 pt-14 pb-20 lg:pt-20 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                {t("Live truck tracking — now available", "تتبع الشاحنات المباشر — متاح الآن")}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.05] tracking-tight">
                {t("South Sudan's", "سوق جنوب السودان")}
                <br />
                <span className="text-primary">{t("Fresh Produce", "للمنتجات الطازجة")}</span>
                <br />
                {t("Marketplace", "")}
              </h1>
              <p className="text-muted-foreground text-lg mt-5 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {t(
                  "Connecting farmers, retailers, and logistics — from farm to market across South Sudan.",
                  "يربط المزارعين والتجار واللوجستيات — من المزرعة إلى السوق في جميع أنحاء جنوب السودان."
                )}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button size="lg" onClick={goDashboard} className="font-semibold shadow-md shadow-primary/20 group" data-testid="button-hero-primary">
                  {user ? t("Go to dashboard", "اذهب إلى لوحة التحكم") : t("Get started free", "ابدأ مجاناً")}
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => setLocation("/about")} className="font-semibold" data-testid="button-hero-secondary">
                  {t("Learn more", "اعرف المزيد")}
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mt-10 max-w-md mx-auto lg:mx-0 pt-6 border-t border-border">
                {stats.map((s) => (
                  <div key={s.label} className="text-center lg:text-left">
                    <div className="text-xl font-extrabold text-foreground tracking-tight">{s.value}</div>
                    <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Decorative card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative hidden lg:block"
            >
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl" />
              <div className="relative bg-card border border-border rounded-3xl shadow-2xl shadow-black/5 p-6 backdrop-blur">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shadow-primary/30">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-sm">{t("Order #1247 · In transit", "طلب #1247 · قيد التوصيل")}</div>
                    <div className="text-xs text-muted-foreground">{t("Truck SS-014 · ETA 14 min", "شاحنة SS-014 · المتوقع 14 د")}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: t("Order placed", "تم الطلب"), done: true },
                    { label: t("Picked from farm", "تم الاستلام من المزرعة"), done: true },
                    { label: t("On the way", "في الطريق"), done: true, active: true },
                    { label: t("Delivered", "تم التسليم"), done: false },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        step.done ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      } ${step.active ? "ring-4 ring-primary/20" : ""}`}>
                        {step.done ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                      </div>
                      <div className={`flex-1 text-sm font-medium ${step.done ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-5 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t("Total", "المجموع")}</span>
                  <span className="font-extrabold text-foreground">SSP 47,500</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ROLE PICKER */}
      <section className="py-16 lg:py-20 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">{t("Choose your role", "اختر دورك")}</h2>
            <p className="text-muted-foreground mt-2">{t("Three portals — one platform.", "ثلاث بوابات — منصة واحدة.")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {roles.map((r, i) => {
              const Icon = r.icon;
              return (
                <motion.button
                  key={r.key}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                  onClick={r.action}
                  className="group flex flex-col items-start gap-4 p-6 bg-card rounded-2xl border border-border shadow-sm hover:shadow-xl hover:border-primary/40 transition-all text-left"
                  data-testid={`button-${r.key}-entry`}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${r.tone} flex items-center justify-center`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground text-lg">{r.title}</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{r.desc}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all">
                    {t("Continue", "متابعة")}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.button>
              );
            })}
          </div>
          <p className="mt-8 text-center text-muted-foreground text-sm">
            {t("New here?", "جديد هنا؟")}{" "}
            <button onClick={() => setLocation("/register")} className="text-primary font-semibold hover:underline" data-testid="link-register">
              {t("Create an account", "أنشئ حساباً")}
            </button>
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 lg:py-24 bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              {t("Built for the field", "مصمم للميدان")}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight max-w-2xl mx-auto leading-tight">
              {t("Everything you need to move produce", "كل ما تحتاجه لنقل المنتجات")}
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              {t("Designed for South Sudan's farmers, retailers, and logistics teams.", "مصمم لمزارعي وتجار وفرق لوجستيات جنوب السودان.")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="bg-card rounded-2xl border border-border p-6 hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 lg:py-24 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              {t("How it works", "كيف يعمل")}
            </h2>
            <p className="text-muted-foreground mt-3">{t("From signup to delivery in three steps.", "من التسجيل إلى التسليم في ثلاث خطوات.")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="relative bg-card rounded-2xl border border-border p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl font-extrabold text-primary/30 tracking-tight">{s.n}</span>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-bold text-foreground text-lg">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{s.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-background border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 text-white p-10 lg:p-14 shadow-2xl shadow-primary/20"
          >
            <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-amber-300/20 blur-3xl" />
            <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Leaf className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider opacity-90">{t("Get started today", "ابدأ اليوم")}</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight">
                  {t("Ready to bring your produce to market?", "مستعد لإيصال منتجاتك إلى السوق؟")}
                </h2>
                <p className="mt-3 text-white/85 max-w-xl">
                  {t("Join AgriMarket free — no setup fees, no commissions on your first month.", "انضم إلى AgriMarket مجاناً — بدون رسوم إعداد، بدون عمولات في شهرك الأول.")}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
                <Button size="lg" variant="secondary" onClick={() => setLocation("/register")} className="font-semibold bg-white text-primary hover:bg-white/90" data-testid="button-cta-register">
                  {t("Create account", "أنشئ حساباً")}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => setLocation("/contact")} className="font-semibold border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white" data-testid="button-cta-contact">
                  {t("Talk to sales", "تحدث إلى المبيعات")}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
