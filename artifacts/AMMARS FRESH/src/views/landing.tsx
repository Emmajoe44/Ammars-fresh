import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import {
  Leaf,
  ShoppingBasket,
  Tractor,
  ArrowRight,
  Truck,
  MapPin,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Languages,
  Wallet,
  PackageCheck,
  Users,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { PublicNav } from "@/components/PublicNav";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicProductShowcase } from "@/components/PublicProductShowcase";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { currenciesDisplay, currenciesInlineClassName } from "@/lib/currency-labels";

const HERO_IMAGES = [
  { src: "/demo-products/tomatoes.jpg", alt: "Tomatoes", className: "col-span-1 row-span-2" },
  { src: "/demo-products/bananas.jpg", alt: "Bananas", className: "col-span-1" },
  { src: "/demo-products/mangoes.jpg", alt: "Mangoes", className: "col-span-1" },
  { src: "/demo-products/sorghum.jpg", alt: "Sorghum", className: "col-span-1 row-span-2" },
];

function HeroVisual({ t }: { t: (en: string, ar: string) => string }) {
  return (
    <div className="relative hidden lg:block">
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/15 via-transparent to-secondary/15 blur-2xl" />
      <div className="relative grid grid-cols-2 grid-rows-3 gap-3 h-[420px]">
        {HERO_IMAGES.map((img, i) => (
          <motion.div
            key={img.src}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.45 }}
            className={`${img.className} rounded-2xl overflow-hidden border border-border/60 shadow-lg shadow-primary/5`}
          >
            <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="col-span-1 rounded-2xl bg-card border border-border p-4 flex flex-col justify-center shadow-md"
        >
          <div className="flex items-center gap-2 text-primary mb-2">
            <Truck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">{t("Live logistics", "لوجستيات مباشرة")}</span>
          </div>
          <p className="text-sm font-semibold text-foreground leading-snug">
            {t("Farm → truck → market", "مزرعة ← شاحنة ← سوق")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{brand.city}, {brand.country}</p>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.65, duration: 0.4 }}
        className="absolute -bottom-4 -left-4 rtl:left-auto rtl:-right-4 bg-card border border-border rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{t("Grade A produce", "منتجات درجة أ")}</p>
          <p className="text-xs text-muted-foreground">{t("Verified farmers", "مزارعون موثوقون")}</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const { push: setLocation } = useRouter();

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
      iconBg: "from-amber-500/20 to-amber-500/5 text-amber-600",
      cardBorder: "border-amber-200/60 hover:border-amber-400/50",
      action: () => setLocation("/login?role=retailer"),
    },
    {
      key: "farmer",
      icon: Tractor,
      title: t("I am a Farmer", "أنا مزارع"),
      desc: t("Reach city retailers, set fair prices, grow your sales.", "اصل إلى تجار المدن، حدد أسعارك العادلة، وزد مبيعاتك."),
      iconBg: "from-primary/25 to-primary/5 text-primary",
      cardBorder: "border-primary/25 hover:border-primary/50",
      action: () => setLocation("/login?role=farmer"),
    },
  ];

  const features = [
    { icon: Truck, title: t("Live truck tracking", "تتبع الشاحنات المباشر"), desc: t("Step-by-step delivery updates from farm to market.", "تحديثات توصيل مرحلية من المزرعة إلى السوق."), highlight: true },
    { icon: ShieldCheck, title: t("Verified farms", "مزارع موثقة"), desc: t("Quality grade on every product, every order.", "درجة جودة على كل منتج وكل طلب."), highlight: false },
    { icon: Wallet, title: t(`${currenciesDisplay()} pricing`, "تسعير متعدد العملات"), desc: t("Toggle between currencies anywhere in the app.", "تبديل بين العملات في أي مكان داخل التطبيق."), highlight: false },
    { icon: Languages, title: t("English + Arabic", "إنجليزي + عربي"), desc: t("Full RTL support across the entire platform.", "دعم كامل للكتابة من اليمين عبر المنصة."), highlight: false },
    { icon: BarChart3, title: t("Demand analytics", "تحليلات الطلب"), desc: t("Charts for sales, top products, and category trends.", "رسوم بيانية للمبيعات والمنتجات الأكثر مبيعاً."), highlight: false },
    { icon: MapPin, title: t("Built for South Sudan", "مصمم لجنوب السودان"), desc: t("Local categories, currencies, and logistics routes.", "فئات وعملات وطرق لوجستية محلية."), highlight: true },
  ];

  const steps = [
    { n: "01", icon: Users, title: t("Create your account", "أنشئ حسابك"), desc: t("Sign up as a retailer, farmer, or get an admin invite.", "سجل كتاجر أو مزارع، أو اطلب دعوة كمشرف.") },
    { n: "02", icon: PackageCheck, title: t("List or shop produce", "اعرض أو اشتر المنتجات"), desc: t("Farmers list harvest with photos. Retailers browse & order.", "يعرض المزارعون منتجاتهم بالصور. يتصفح التجار ويطلبون.") },
    { n: "03", icon: Truck, title: t("Track to delivery", "تتبع حتى التسليم"), desc: t("Admin assigns trucks. Everyone sees live status.", "يخصص المشرف الشاحنات. الجميع يرى الحالة مباشرة.") },
  ];

  const trustItems = [
    { icon: MapPin, label: t(`${brand.city}, ${brand.country}`, `${brand.city}، جنوب السودان`) },
    { icon: Wallet, label: currenciesDisplay(), inline: true },
    { icon: Truck, label: t("Live delivery tracking", "تتبع التوصيل المباشر") },
    { icon: ShieldCheck, label: t("Verified quality grades", "درجات جودة موثقة") },
  ];

  const stats = [
    { value: "10+", label: t("Categories", "فئة") },
    { value: "24/7", label: t("Marketplace", "سوق") },
    { value: "EN/AR", label: t("Languages", "اللغات") },
    { value: currenciesDisplay(), label: t("Currencies", "العملات"), inline: true },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col" dir={lang === "ar" ? "rtl" : "ltr"}>
      <PublicNav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,hsl(var(--primary)/0.12),transparent)]" />
        <div className="absolute top-24 -right-32 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center lg:text-start"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-5">
                <Sparkles className="w-3.5 h-3.5" />
                {t(brand.tagline, brand.taglineAr)}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-foreground leading-[1.08] tracking-tight">
                {lang === "ar" ? (
                  <>
                    <span className="text-primary">{brand.nameAr}</span>
                    <br />
                    {t("Fresh produce marketplace", "سوق المنتجات الطازجة")}
                  </>
                ) : (
                  <>
                    {brand.name}
                    <br />
                    <span className="text-primary">{t("Fresh produce", "منتجات طازجة")}</span>
                    {" "}{t("for South Sudan", "لجنوب السودان")}
                  </>
                )}
              </h1>
              <p className="text-muted-foreground text-lg mt-5 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {t(
                  `Connecting farmers, retailers, and logistics in ${brand.city} and beyond — from farm to market with ${currenciesDisplay()} pricing.`,
                  `يربط المزارعين والتجار واللوجستيات في ${brand.city} وما بعدها — من المزرعة إلى السوق بتسعير ${currenciesDisplay()}.`,
                )}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button size="lg" onClick={goDashboard} className="font-semibold shadow-md shadow-primary/20 group" data-testid="button-hero-primary">
                  {user ? t("Go to dashboard", "اذهب إلى لوحة التحكم") : t("Get started free", "ابدأ مجاناً")}
                  <ArrowRight className="w-4 h-4 ms-1.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setLocation("/#products")}
                  className="font-semibold"
                  data-testid="button-hero-secondary"
                >
                  {t("Browse produce", "تصفح المنتجات")}
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-border/80 max-w-lg mx-auto lg:mx-0">
                {stats.map((s) => (
                  <div key={s.label} className="text-center lg:text-start min-w-0">
                    <div className={`text-xl font-extrabold text-foreground tracking-tight ${"inline" in s && s.inline ? `${currenciesInlineClassName} text-sm sm:text-xl` : ""}`}>{s.value}</div>
                    <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <HeroVisual t={t} />
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-border/80 bg-muted/40">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-2.5 text-sm font-semibold text-foreground/80">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className={"inline" in item && item.inline ? currenciesInlineClassName : undefined}>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <PublicProductShowcase />

      {/* HOW IT WORKS */}
      <section className="py-16 lg:py-24 bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">{t("Simple workflow", "سير عمل بسيط")}</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              {t("How it works", "كيف يعمل")}
            </h2>
            <p className="text-muted-foreground mt-3">{t("From signup to delivery in three steps.", "من التسجيل إلى التسليم في ثلاث خطوات.")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-14 left-[16%] right-[16%] h-px bg-border" aria-hidden />
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  className="relative bg-card rounded-2xl border border-border p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-10 h-10 rounded-full bg-primary text-primary-foreground text-sm font-extrabold flex items-center justify-center shrink-0 relative z-10">
                      {s.n}
                    </span>
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

      {/* ROLE PICKER */}
      <section className="py-16 lg:py-20 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10 max-w-xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">{t("Choose your role", "اختر دورك")}</h2>
            <p className="text-muted-foreground mt-2">{t("Two portals — one platform.", "بوابتان — منصة واحدة.")}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
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
                  className={`group flex flex-col items-start gap-4 p-6 bg-card rounded-2xl border shadow-sm hover:shadow-xl transition-all text-start ${r.cardBorder}`}
                  data-testid={`button-${r.key}-entry`}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${r.iconBg} flex items-center justify-center`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground text-lg">{r.title}</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{r.desc}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all">
                    {t("Continue", "متابعة")}
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
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

      {/* FEATURES — bento grid */}
      <section className="py-16 lg:py-24 bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              {t("Built for the field", "مصمم للميدان")}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              {t("Everything you need to move produce", "كل ما تحتاجه لنقل المنتجات")}
            </h2>
            <p className="text-muted-foreground mt-3">
              {t("Designed for South Sudan's farmers, retailers, and logistics teams.", "مصمم لمزارعي وتجار وفرق لوجستيات جنوب السودان.")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className={`bg-card rounded-2xl border border-border p-6 hover:border-primary/40 hover:shadow-md transition-all ${
                    i === 0 || i === 5 ? "lg:col-span-2" : ""
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.desc}</p>
                  {f.highlight && (
                    <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-primary">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t("Included on every plan", "متاح في كل الخطط")}
                    </div>
                  )}
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
            <div className="relative grid md:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Leaf className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider opacity-90">{t("Get started today", "ابدأ اليوم")}</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight">
                  {t("Ready to bring your produce to market?", "مستعد لإيصال منتجاتك إلى السوق؟")}
                </h2>
                <p className="mt-3 text-white/85 max-w-xl">
                  {t(`Join ${brand.name} free — no setup fees, no commissions on your first month.`, `انضم إلى ${brand.nameAr} مجاناً — بدون رسوم إعداد، بدون عمولات في شهرك الأول.`)}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
                <Button size="lg" variant="secondary" onClick={() => setLocation("/register")} className="font-semibold bg-white text-primary hover:bg-white/90" data-testid="button-cta-register">
                  {t("Create account", "أنشئ حساباً")}
                  <ArrowRight className="w-4 h-4 ms-1.5 rtl:rotate-180" />
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
