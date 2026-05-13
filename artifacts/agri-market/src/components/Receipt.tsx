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
  const items = order.items ?? [];
  const itemCount = items.reduce((n, i) => n + Number(i.quantity || 0), 0);
  const total = useUSD ? (order.totalUSD ?? 0) : (order.totalSSP ?? 0);

  return (
    <div className="print-only print-area bg-white text-black mx-auto" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", maxWidth: "720px", padding: "0" }}>
      {/* Letterhead */}
      <div style={{ borderBottom: "3px double #000", paddingBottom: "12px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.5px" }}>AgriMarket</div>
            <div style={{ fontSize: "10px", color: "#555", letterSpacing: "1px", textTransform: "uppercase", marginTop: "2px" }}>South Sudan · Farm to market</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "3px" }}>{title}</div>
            <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>
              No. <span style={{ fontWeight: 700, color: "#000" }}>{String(order.id).padStart(6, "0")}</span>
            </div>
            <div style={{ fontSize: "11px", color: "#555" }}>
              {new Date(order.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" })}
              {" · "}
              {new Date(order.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>
      </div>

      {/* Items table — the focus */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px 6px", borderBottom: "2px solid #000", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase" }}>Description</th>
            <th style={{ textAlign: "right", padding: "8px 6px", borderBottom: "2px solid #000", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", width: "90px" }}>Qty</th>
            <th style={{ textAlign: "right", padding: "8px 6px", borderBottom: "2px solid #000", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", width: "110px" }}>Unit price</th>
            <th style={{ textAlign: "right", padding: "8px 6px", borderBottom: "2px solid #000", fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase", width: "120px" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const unitPrice = useUSD ? item.priceUSD : item.priceSSP;
            const lineTotal = unitPrice * Number(item.quantity || 0);
            return (
              <tr key={i}>
                <td style={{ padding: "10px 6px", borderBottom: "1px solid #e5e5e5", verticalAlign: "top" }}>
                  <div style={{ fontWeight: 600 }}>{item.productName || "Item"}</div>
                </td>
                <td style={{ padding: "10px 6px", borderBottom: "1px solid #e5e5e5", textAlign: "right", verticalAlign: "top", whiteSpace: "nowrap" }}>
                  {Number(item.quantity).toLocaleString()} {item.unit || ""}
                </td>
                <td style={{ padding: "10px 6px", borderBottom: "1px solid #e5e5e5", textAlign: "right", verticalAlign: "top", whiteSpace: "nowrap" }}>
                  {fmt(item.priceSSP, item.priceUSD)}
                </td>
                <td style={{ padding: "10px 6px", borderBottom: "1px solid #e5e5e5", textAlign: "right", verticalAlign: "top", whiteSpace: "nowrap", fontWeight: 600 }}>
                  {fmt(item.priceSSP * Number(item.quantity || 0), item.priceUSD * Number(item.quantity || 0))}
                </td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: "20px", textAlign: "center", color: "#888", fontStyle: "italic" }}>No items</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "14px" }}>
        <table style={{ fontSize: "12px", minWidth: "260px" }}>
          <tbody>
            <tr>
              <td style={{ padding: "4px 8px", color: "#555" }}>Items</td>
              <td style={{ padding: "4px 8px", textAlign: "right" }}>{items.length}</td>
            </tr>
            <tr>
              <td style={{ padding: "4px 8px", color: "#555" }}>Total quantity</td>
              <td style={{ padding: "4px 8px", textAlign: "right" }}>{itemCount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style={{ padding: "10px 8px", borderTop: "2px solid #000", fontSize: "13px", fontWeight: 800, letterSpacing: "1px", textTransform: "uppercase" }}>Total</td>
              <td style={{ padding: "10px 8px", borderTop: "2px solid #000", textAlign: "right", fontSize: "16px", fontWeight: 800 }}>
                {fmt(order.totalSSP ?? total, order.totalUSD ?? total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "32px", paddingTop: "10px", borderTop: "1px solid #ccc", textAlign: "center", fontSize: "10px", color: "#666", letterSpacing: "0.5px" }}>
        Thank you for your business · AgriMarket South Sudan
      </div>
    </div>
  );
}
