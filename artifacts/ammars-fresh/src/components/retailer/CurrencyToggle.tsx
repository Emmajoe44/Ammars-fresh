import { brand } from "@/lib/brand";
import { useLang } from "@/contexts/LangContext";
import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext";

type Props = {
  className?: string;
  /** Override label; defaults to "Price in:" */
  label?: string;
};

export function CurrencyToggle({ className = "", label }: Props) {
  const { t } = useLang();
  const { currency, setCurrency } = useDisplayCurrency();
  const labelText = label ?? t("Price in:", "السعر بـ:");

  return (
    <div className={`flex items-center gap-2 ${className}`} role="group" aria-label={labelText}>
      <span className="text-sm text-muted-foreground whitespace-nowrap">{labelText}</span>
      <div className="flex flex-nowrap rounded-lg border border-border overflow-hidden shrink-0">
        {brand.currencies.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setCurrency(code)}
            className={`px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              currency === code ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"
            }`}
            data-testid={`button-currency-${code.toLowerCase()}`}
            aria-pressed={currency === code}
          >
            {code}
          </button>
        ))}
      </div>
    </div>
  );
}
