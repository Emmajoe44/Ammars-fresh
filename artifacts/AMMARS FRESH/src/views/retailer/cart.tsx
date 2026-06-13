import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import { useCart } from "@/contexts/CartContext";
import { useCreateOrder } from "@workspace/api-client-react";
import { AppLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, Trash2, ShoppingBasket, MapPin, Leaf, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { resolveImageSrc } from "@/lib/image-url";
import { formatLineTotal, formatOrderTotal, formatProductPrice, priceDisplayClassName } from "@/lib/format-price";
import { useExchangeRates } from "@/contexts/ExchangeRatesContext";
import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext";
import { CurrencyToggle } from "@/components/retailer/CurrencyToggle";
import { RETAILER_PAGE_SHELL } from "@/components/retailer/product-grid";

export default function RetailerCart() {
  const { user } = useAuth();
  const { t } = useLang();
  const { items, removeItem, updateQuantity, clearCart, totalSSP, totalUSD, count } = useCart();
  const { currency } = useDisplayCurrency();
  const [rates] = useExchangeRates();
  const [location, setLocationText] = useState(user?.location ?? "");
  const { push: setRoute } = useRouter();
  const { toast } = useToast();
  const createOrder = useCreateOrder();

  const handlePlaceOrder = () => {
    if (items.length === 0) return;
    createOrder.mutate(
      {
        data: {
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            quantity: i.quantity,
            unit: i.unit,
            priceSSP: i.priceSSP,
            priceUSD: i.priceUSD,
          })),
          currency,
          deliveryLocation: location || null,
        },
      },
      {
      onSuccess: (order) => {
        clearCart();
        toast({
          title: t("Order placed!", "تم الطلب!"),
          description: t(`Order #${order.id} confirmed`, `طلب #${order.id} مؤكد`),
        });
        if (order?.id) {
          setRoute(`/retailer/orders/${order.id}`);
        } else {
          setRoute("/retailer/orders");
        }
      },
        onError: () => {
          toast({ title: t("Order failed", "فشل الطلب"), variant: "destructive" });
        },
      },
    );
  };

  if (items.length === 0) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-5">
            <ShoppingBasket className="w-12 h-12 text-primary/50" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{t("Your cart is empty", "السلة فارغة")}</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm">
            {t("Browse products to add items to your cart", "تصفح المنتجات لإضافة عناصر إلى سلتك")}
          </p>
          <Button size="lg" onClick={() => setRoute("/retailer/products")} data-testid="button-browse-products">
            {t("Browse Products", "تصفح المنتجات")}
            <ArrowRight className="w-4 h-4 ms-2" />
          </Button>
        </div>
      </AppLayout>
    );
  }

  const orderTotal = formatOrderTotal(currency, totalSSP, totalUSD, rates);

  return (
    <AppLayout>
      <div className={`${RETAILER_PAGE_SHELL} lg:pb-8`}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
            {t("Cart", "السلة")}{" "}
            <span className="text-primary">({count})</span>
          </h1>
          <Button variant="outline" size="sm" onClick={() => setRoute("/retailer/products")}>
            {t("Continue shopping", "متابعة التسوق")}
          </Button>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_400px] lg:gap-8 lg:items-start">
          {/* Items */}
          <div className="space-y-3 mb-6 lg:mb-0">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="bg-card border border-border rounded-2xl p-4 flex gap-4 shadow-sm"
                  data-testid={`cart-item-${item.productId}`}
                >
                  <div className="w-20 h-20 rounded-xl bg-primary/5 flex-shrink-0 overflow-hidden">
                    {resolveImageSrc(item.imageUrl) ? (
                      <img src={resolveImageSrc(item.imageUrl)!} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Leaf className="w-8 h-8 text-primary/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatProductPrice(currency, item, item.unit, rates)}
                    </p>
                    <p className={`${priceDisplayClassName} mt-1`}>
                      {formatLineTotal(currency, item, rates)}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80"
                        data-testid={`button-decrease-${item.productId}`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm" data-testid={`qty-${item.productId}`}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80"
                        data-testid={`button-increase-${item.productId}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 ms-auto"
                        data-testid={`button-remove-${item.productId}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Checkout sidebar */}
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  {t("Delivery location", "موقع التسليم")}
                </label>
                <Input
                  value={location}
                  onChange={(e) => setLocationText(e.target.value)}
                  placeholder={t("e.g. Konyo Konyo Market, Juba", "مثال: سوق كونيو كونيو، جوبا")}
                  data-testid="input-delivery-location"
                />
              </div>

              <CurrencyToggle label={t("Pay with:", "ادفع بـ:")} />

              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("Items", "المنتجات")}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("Currency", "العملة")}</span>
                  <span className="font-semibold">{currency}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="font-bold text-lg">{t("You pay", "أنت تدفع")}</span>
                  <span className={`text-xl ${priceDisplayClassName}`} data-testid="text-total">
                    {orderTotal}
                  </span>
                </div>
              </div>

              <Button
                className="w-full font-bold text-base py-6 shadow-md shadow-primary/20"
                onClick={handlePlaceOrder}
                disabled={createOrder.isPending || items.length === 0}
                data-testid="button-place-order"
              >
                {createOrder.isPending
                  ? t("Placing Order...", "جاري الطلب...")
                  : t(`Pay ${orderTotal} & Place Order`, `ادفع ${orderTotal} وقدم الطلب`)}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
