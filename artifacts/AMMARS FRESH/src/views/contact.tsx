import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, CheckCircle2 } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { PublicFooter } from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLang } from "@/contexts/LangContext";
import { useToast } from "@/hooks/use-toast";
import { brand } from "@/lib/brand";

export default function ContactPage() {
  const { t } = useLang();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      toast({
        title: t("Missing info", "معلومات ناقصة"),
        description: t("Please add your name and a message.", "يرجى إضافة اسمك ورسالتك."),
        variant: "destructive",
      });
      return;
    }
    setSubmitted(true);
    toast({
      title: t("Message sent", "تم إرسال الرسالة"),
      description: t("Our team will reply within 24 hours.", "سيرد فريقنا خلال 24 ساعة."),
    });
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  const channels = [
    {
      icon: Phone,
      label: t("Call us", "اتصل بنا"),
      value: "+211 900 000 000",
      sub: t("Mon–Sat · 8:00 – 18:00", "الإثنين-السبت · 8:00 – 18:00"),
    },
    {
      icon: Mail,
      label: t("Email", "البريد الإلكتروني"),
      value: brand.supportEmail,
      sub: t("We reply within 24 hours", "نرد خلال 24 ساعة"),
    },
    {
      icon: MapPin,
      label: t("Visit", "زرنا"),
      value: t("Juba, Central Equatoria", "جوبا، الاستوائية الوسطى"),
      sub: t("Hai Cinema, Block 4", "حي السينما، بلوك 4"),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-b border-border/60">
          <div className="max-w-4xl mx-auto px-6 py-16 sm:py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wide mb-5"
            >
              <MessageSquare className="w-3.5 h-3.5" /> {t("We're listening", "نحن نستمع")}
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
              {t("Get in touch", "تواصل معنا")}
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              {t(
                "Questions about onboarding, pricing, or partnerships? We'd love to hear from you.",
                "أسئلة حول التسجيل أو الأسعار أو الشراكات؟ نحن سعداء بالتواصل معك.",
              )}
            </p>
          </div>
        </section>

        {/* Channels + Form */}
        <section className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-5 gap-8">
          {/* Channels */}
          <div className="lg:col-span-2 space-y-4">
            {channels.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-card border border-border rounded-2xl p-5 flex gap-4 hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <c.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-0.5">{c.label}</p>
                  <p className="font-bold text-foreground truncate">{c.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
                </div>
              </motion.div>
            ))}

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex gap-3">
              <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm mb-1">{t("Fast response", "استجابة سريعة")}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t(
                    "Most messages are answered the same business day. For urgent logistics issues, please call.",
                    "يتم الرد على معظم الرسائل في نفس يوم العمل. للمشاكل العاجلة، يرجى الاتصال.",
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm"
            >
              {submitted ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-extrabold mb-2">{t("Thanks for reaching out!", "شكرًا لتواصلك!")}</h3>
                  <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                    {t(
                      "We've received your message and will get back to you within 24 hours.",
                      "لقد استلمنا رسالتك وسنرد عليك خلال 24 ساعة.",
                    )}
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)} data-testid="button-send-another">
                    {t("Send another message", "إرسال رسالة أخرى")}
                  </Button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-5">
                  <h2 className="text-2xl font-extrabold mb-1">{t("Send us a message", "أرسل لنا رسالة")}</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("Fill in the form and we'll respond shortly.", "املأ النموذج وسنرد عليك قريبًا.")}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="mb-1.5 block">{t("Full name", "الاسم الكامل")} *</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder={t("Your name", "اسمك")}
                        data-testid="input-contact-name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="mb-1.5 block">{t("Phone", "الهاتف")}</Label>
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+211 9XX XXX XXX"
                        data-testid="input-contact-phone"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="mb-1.5 block">{t("Email", "البريد الإلكتروني")}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        data-testid="input-contact-email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject" className="mb-1.5 block">{t("Subject", "الموضوع")}</Label>
                      <Input
                        id="subject"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        placeholder={t("How can we help?", "كيف يمكننا المساعدة؟")}
                        data-testid="input-contact-subject"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message" className="mb-1.5 block">{t("Message", "الرسالة")} *</Label>
                    <Textarea
                      id="message"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder={t("Tell us a bit about what you need…", "أخبرنا قليلاً عما تحتاجه…")}
                      rows={5}
                      data-testid="input-contact-message"
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full sm:w-auto" data-testid="button-send-message">
                    <Send className="w-4 h-4 mr-2" />
                    {t("Send message", "إرسال الرسالة")}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
