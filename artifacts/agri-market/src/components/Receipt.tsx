import { Leaf } from "lucide-react";

interface ReceiptItem {
  productName?: string | null;
  quantity: number;
  unit?: string | null;
  priceSSP: number;
  priceUSD: number;
}

interface ReceiptOrder {
  id: number;
  status: string;
  createdAt: string;
  retailerName?: string | null;
  deliveryLocation?: string | null;
  driverName?: string | null;
  truckPlate?: string | null;
  currency?: string;
  totalSSP?: number;
  totalUSD?: number;
  items?: ReceiptItem[];
}

interface ReceiptProps {
  order: ReceiptOrder;
  variant?: "receipt" | "invoice";
}

export function Receipt({ order, variant = "receipt" }: ReceiptProps) {
  const useUSD = order.currency === "USD";
  const fmt = (ssp: number, usd: number) =>
    useUSD ? `$${usd.toFixed(2)}` : `SSP ${ssp.toLocaleString()}`;
  const title = variant === "invoice" ? "INVOICE" : "RECEIPT";

  return (
    <div className="print-only print-area bg-white text-black p-8 max-w-3xl mx-auto font-sans">
      <div className="flex items-start justify-between border-b-2 border-black pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center">
            <Leaf className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">AgriMarket South Sudan</h1>
            <p className="text-xs text-gray-600">Farm to market — Juba, South Sudan</p>
            <p className="text-xs text-gray-600">support@agrimarket.ss</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-extrabold tracking-wider">{title}</h2>
          <p className="text-sm font-semibold mt-1">#{order.id}</p>
          <p className="text-xs text-gray-600">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
        <div>
          <p className="text-xs uppercase font-bold text-gray-500 mb-1">Bill to</p>
          <p className="font-semibold">{order.retailerName || "Customer"}</p>
          {order.deliveryLocation && <p className="text-gray-700">{order.deliveryLocation}</p>}
        </div>
        <div className="text-right">
          <p className="text-xs uppercase font-bold text-gray-500 mb-1">Status</p>
          <p className="font-semibold capitalize">{order.status.replace("_", " ")}</p>
          {order.truckPlate && (
            <p className="text-gray-700 mt-2 text-xs">
              Truck: {order.truckPlate}
              {order.driverName ? ` — ${order.driverName}` : ""}
            </p>
          )}
        </div>
      </div>

      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b-2 border-black text-left">
            <th className="py-2 font-bold">Item</th>
            <th className="py-2 font-bold text-right">Qty</th>
            <th className="py-2 font-bold text-right">Unit price</th>
            <th className="py-2 font-bold text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {(order.items ?? []).map((item, i) => (
            <tr key={i} className="border-b border-gray-300">
              <td className="py-2">{item.productName || "—"}</td>
              <td className="py-2 text-right">{item.quantity} {item.unit}</td>
              <td className="py-2 text-right">{fmt(item.priceSSP, item.priceUSD)}</td>
              <td className="py-2 text-right font-semibold">
                {fmt(item.priceSSP * item.quantity, item.priceUSD * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="py-3 text-right font-bold text-base">Total</td>
            <td className="py-3 text-right font-extrabold text-lg">
              {fmt(order.totalSSP ?? 0, order.totalUSD ?? 0)}
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="border-t border-gray-300 pt-4 text-xs text-gray-600 text-center">
        <p>Thank you for shopping with AgriMarket South Sudan.</p>
        <p className="mt-1">This {variant} was generated on {new Date().toLocaleString()}.</p>
      </div>
    </div>
  );
}
