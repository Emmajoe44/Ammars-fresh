import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLang } from "@/contexts/LangContext";
import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext";
import { resolveImageSrc } from "@/lib/image-url";
import { formatProductPrice, priceDisplayClassName } from "@/lib/format-price";
import { useExchangeRates } from "@/contexts/ExchangeRatesContext";
import { Leaf, ShoppingBasket } from "lucide-react";
import { motion } from "framer-motion";

export type RetailerProduct = {
  id: number;
  name: string;
  nameAr: string;
  unit: string;
  quantity: number;
  priceSSP: number;
  priceUSD: number;
  qualityGrade?: string | null;
  imageUrl?: string | null;
  farmName?: string | null;
  farmerName?: string | null;
};

type Props = {
  product: RetailerProduct;
  index?: number;
  onAdd: () => void;
  compact?: boolean;
};

export function RetailerProductCard({ product, index = 0, onAdd, compact }: Props) {
  const { t, lang } = useLang();
  const { currency } = useDisplayCurrency();
  const [rates] = useExchangeRates();
  const name = lang === "ar" ? product.nameAr : product.name;
  const imageSrc = resolveImageSrc(product.imageUrl);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col hover:border-primary/40 hover:shadow-md transition-all group"
      data-testid={`card-product-${product.id}`}
    >
      <div className={`relative w-full bg-primary/5 overflow-hidden ${compact ? "aspect-[4/3]" : "aspect-square"}`}>
        {imageSrc ? (
          <img src={imageSrc} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Leaf className="w-10 h-10 text-primary/25" />
          </div>
        )}
        <Badge variant="outline" className="absolute top-2 end-2 text-[10px] bg-background/90 backdrop-blur-sm">
          {product.qualityGrade}
        </Badge>
      </div>
      <div className="p-3 flex flex-col flex-1 gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2">{name}</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{product.farmName ?? product.farmerName}</p>
          <p className="text-[11px] text-muted-foreground">
            {product.quantity} {product.unit} {t("available", "متاح")}
          </p>
        </div>
        <p className={priceDisplayClassName}>
          {formatProductPrice(currency, product, product.unit, rates)}
        </p>
        <Button size="sm" className="w-full" onClick={onAdd} data-testid={`button-add-cart-${product.id}`}>
          <ShoppingBasket className="w-3.5 h-3.5 me-1.5" />
          {t("Add", "أضف")}
        </Button>
      </div>
    </motion.article>
  );
}
