import { motion } from "framer-motion";
import { Sprout, Users, Truck, Globe2, Target, Heart } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { PublicFooter } from "@/components/PublicFooter";
import { useLang } from "@/contexts/LangContext";
import { brand } from "@/lib/brand";

export default function AboutPage() {
  const { t } = useLang();

  const values = [
    {
      icon: Sprout,
      title: t("Empower farmers", "تمكين المزارعين"),
      desc: t(
        "Fair prices, direct buyers, and visibility into demand — so growers earn more from every harvest.",
        "أسعار عادلة ومشترون مباشرون ورؤية للطلب — ليكسب المزارعون أكثر من كل محصول.",
      ),
    },
    {
      icon: Users,
      title: t("Serve retailers", "خدمة تجار التجزئة"),
      desc: t(
        "A reliable supply of fresh produce with transparent pricing and predictable delivery times.",
        "إمداد موثوق من المنتجات الطازجة بأسعار شفافة ومواعيد تسليم متوقعة.",
      ),
    },
    {
      icon: Truck,
      title: t("Smart logistics", "لوجستيات ذكية"),
      desc: t(
        "Live truck tracking, route planning and assignment built for South Sudan's roads.",
        "تتبع حي للشاحنات وتخطيط للمسارات مصمم لطرق جنوب السودان.",
      ),
    },
  ];

  const stats = [
    { value: "1.2k+", label: t("Farmers onboard", "مزارع مسجل") },
    { value: "350+", label: t("Retailers served", "تاجر تجزئة") },
    { value: "8", label: t("States covered", "ولاية مغطاة") },
    { value: "24/7", label: t("Support team", "فريق دعم") },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="absolute inset-0 -z-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.18),transparent_55%)]" />
          </div>
          <div className="relative max-w-4xl mx-auto px-6 py-20 sm:py-28 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide mb-6"
            >
              <Heart className="w-3.5 h-3.5" /> {t("Built in Juba", "صنع في جوبا")}
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5"
            >
              {t("From the field", "من الحقل")}{" "}
              <span className="text-primary">{t("to the market", "إلى السوق")}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              {t(
                brand.mission ??
                  `${brand.name} is ${brand.country}'s digital marketplace for fresh produce — built to give farmers a fair price, retailers a steady supply, and the country a stronger food system.`,
                brand.missionAr ??
                  `${brand.nameAr} هو السوق الرقمي للمنتجات الطازجة في جنوب السودان — لمنح المزارعين سعرًا عادلاً، وتجار التجزئة إمدادًا مستقرًا، ونظامًا غذائيًا أقوى للبلاد.`,
              )}
            </motion.p>
          </div>
        </section>

        {/* Stats strip */}
        <section className="border-y border-border/60 bg-card">
          <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-extrabold text-primary">{s.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">{t("What we do", "ما نقوم به")}</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold">{t("A marketplace built for South Sudan", "سوق مصمم لجنوب السودان")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <v.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Mission */}
        <section className="bg-muted/30 border-y border-border/60">
          <div className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">{t("Our mission", "مهمتنا")}</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
                {t(
                  "Make fresh food trade fair, fast, and visible.",
                  "جعل تجارة الأغذية الطازجة عادلة وسريعة وواضحة.",
                )}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  "Smallholder farmers feed the country, but they often sell at the wrong price, to the wrong buyer, at the wrong time. We're closing that gap with simple tools that work in low-bandwidth conditions and in two languages.",
                  "صغار المزارعين يطعمون البلاد، لكنهم غالبًا يبيعون بسعر خاطئ، لمشترٍ خاطئ، في وقت خاطئ. نحن نسد هذه الفجوة بأدوات بسيطة تعمل في ظروف الاتصال المحدود وبلغتين.",
                )}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Globe2, label: t("Bilingual EN / AR", "ثنائي اللغة") },
                { icon: Target, label: t("Transparent pricing", "تسعير شفاف") },
                { icon: Truck, label: t("Fleet visibility", "رؤية الأسطول") },
                { icon: Sprout, label: t("Fair to farmers", "عادل للمزارعين") },
              ].map((f) => (
                <div key={f.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
