import Link from "next/link";
import { Leaf, Mail, Phone, MapPin } from "lucide-react";
import { useLang } from "@/contexts/LangContext";
import { brand } from "@/lib/brand";

export function PublicFooter() {
  const { t } = useLang();
  return (
    <footer className="border-t border-border/60 bg-muted/30 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-lg">{brand.name}</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t(
              "Connecting farmers, retailers, and logistics across South Sudan.",
              "نربط المزارعين وتجار التجزئة والخدمات اللوجستية في جنوب السودان.",
            )}
          </p>
        </div>
        <div>
          <h4 className="font-bold text-sm mb-3 uppercase tracking-wide text-foreground">{t("Explore", "استكشف")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-primary transition-colors">{t("Home", "الرئيسية")}</Link></li>
            <li><Link href="/#products" className="hover:text-primary transition-colors">{t("Products", "المنتجات")}</Link></li>
            <li><Link href="/about" className="hover:text-primary transition-colors">{t("About", "من نحن")}</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">{t("Contact", "اتصل بنا")}</Link></li>
            <li><Link href="/login" className="hover:text-primary transition-colors">{t("Sign In", "تسجيل الدخول")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm mb-3 uppercase tracking-wide text-foreground">{t("Get in touch", "تواصل معنا")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> +211 900 000 000</li>
            <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> {brand.supportEmail}</li>
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Juba, South Sudan</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {brand.name} — {t(`Powering ${brand.country}'s agricultural trade`, "تمكين التجارة الزراعية في جنوب السودان")}
      </div>
    </footer>
  );
}
