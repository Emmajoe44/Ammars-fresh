import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useLang } from "@/contexts/LangContext";
import { useCart } from "@/contexts/CartContext";
import { useCreateOrder } from "@workspace/api-client-react";
import { AppLayout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, Trash2, ShoppingBasket, MapPin, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RetailerCart() {
  const { user } = useAuth();
  const { t } = useLang();
  const { items, removeItem, updateQuantity, clearCart, totalSSP, totalUSD, count } = useCart();
  const [currency, setCurrency] = useState<"SSP" | "USD">("SSP");
  const [location, setLocationText] = useState(user?.location ?? "");
  const [, setRoute] = useLocation();
  const { toast } = useToast();
  const createOrder = useCreateOrder();

  const handlePlaceOrder = () => {
    if (items.length === 0) return;
    createOrder.mutate({
      data: {
        items: items.map(i => ({
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
    }, {
      onSuccess: (order) => {
        clearCart();
        toast({ title: t("Order placed!", "تم الطلب!"), description: t(`Order #${order.id} confirmed`, `طلب #${order.id} مؤكد`) });
        setRoute(`/retailer/orders/${order.id}`);
      },
      onError: () => {
        toast({ title: t("Order failed", "فشل الطلب"), variant: "destructive" });
      },
    });
  };

  if (items.length === 0) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
            <ShoppingBasket className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">{t("Your cart is empty", "السلة فارغة")}</h2>
          <p className="text-muted-foreground text-sm mb-6">{t("Browse products to add items", "تصفح المنتجات لإضافة عناصر")}</p>
          <Button onClick={() => setRoute("/retailer/products")} data-testid="button-browse-products">{t("Browse Products", "تصفح المنتجات")}</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 pb-24 md:pb-8 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-extrabold text-foreground">{t("Cart", "السلة")} ({count})</h1>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["SSP", "USD"] as const).map(c => (
              <button key={c} onClick={() => setCurrency(c)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${currency === c ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
                data-testid={`button-currency-${c.toLowerCase()}`}
              >{c}</button>
            ))}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <AnimatePresence>
            {items.map(item => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3"
                data-testid={`cart-item-${item.productId}`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-6 h-6 text-primary/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{item.productName}</p>
                  <p className="text-xs text-primary font-medium">
                    {currency === "SSP" ? `SSP ${item.priceSSP?.toLocaleString()}` : `$${item.priceUSD?.toFixed(2)}`}/{item.unit}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80" data-testid={`button-decrease-${item.productId}`}>
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-bold text-sm" data-testid={`qty-${item.productId}`}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80" data-testid={`button-increase-${item.productId}`}>
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => removeItem(item.productId)} className="w-7 h-7 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 ml-1" data-testid={`button-remove-${item.productId}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Delivery location */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary" />
            {t("Delivery location", "موقع التسليم")}
          </label>
          <Input
            value={location}
            onChange={e => setLocationText(e.target.value)}
            placeholder={t("e.g. Konyo Konyo Market, Juba", "مثال: سوق كونيو كونيو، جوبا")}
            data-testid="input-delivery-location"
          />
        </div>

        {/* Total + Place Order */}
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("Items", "المنتجات")}</span>
            <span className="font-medium">{count}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t border-border pt-3">
            <span>{t("Total", "الإجمالي")}</span>
            <span className="text-primary" data-testid="text-total">
              {currency === "SSP" ? `SSP ${totalSSP.toLocaleString()}` : `$${totalUSD.toFixed(2)}`}
            </span>
          </div>
          <Button
            className="w-full font-bold text-base py-6"
            onClick={handlePlaceOrder}
            disabled={createOrder.isPending || items.length === 0}
            data-testid="button-place-order"
          >
            {createOrder.isPending ? t("Placing Order...", "جاري الطلب...") : t("Place Order", "تقديم الطلب")}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
