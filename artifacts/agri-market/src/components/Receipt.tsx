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

const BRAND = "#15803d";
const BRAND_DARK = "#14532d";
const ACCENT = "#f59e0b";
const INK = "#0f172a";
const MUTED = "#64748b";
const LINE = "#e2e8f0";

export function Receipt({ order, variant = "receipt" }: ReceiptProps) {
  const useUSD = order.currency === "USD";
  const fmt = (ssp: number, usd: number) =>
    useUSD ? `$${usd.toFixed(2)}` : `SSP ${ssp.toLocaleString()}`;
  const isInvoice = variant === "invoice";
  const title = isInvoice ? "INVOICE" : "RECEIPT";
  const items = order.items ?? [];
  const itemCount = items.reduce((n, i) => n + Number(i.quantity || 0), 0);
  const subtotal = useUSD
    ? items.reduce((s, i) => s + i.priceUSD * Number(i.quantity || 0), 0)
    : items.reduce((s, i) => s + i.priceSSP * Number(i.quantity || 0), 0);
  const total = useUSD ? (order.totalUSD ?? subtotal) : (order.totalSSP ?? subtotal);
  const docNumber = `${isInvoice ? "INV" : "RCP"}-${new Date(order.createdAt).getFullYear()}-${String(order.id).padStart(6, "0")}`;
  const dateStr = new Date(order.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "2-digit" });
  const timeStr = new Date(order.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className="print-only print-area bg-white mx-auto"
      style={{
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        color: INK,
        maxWidth: "780px",
        padding: "0",
      }}
    >
      {/* HEADER — branded band */}
      <div
        style={{
          background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_DARK} 100%)`,
          color: "white",
          padding: "22px 28px",
          borderRadius: "4px 4px 0 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px", zIndex: 1 }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.18)",
              border: "2px solid rgba(255,255,255,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              fontWeight: 800,
            }}
          >
            🌾
          </div>
          <div>
            <div style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.4px", lineHeight: 1 }}>
              AgriMarket
            </div>
            <div style={{ fontSize: "10px", letterSpacing: "2.5px", textTransform: "uppercase", opacity: 0.85, marginTop: "4px" }}>
              South Sudan · Farm to market
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right", zIndex: 1 }}>
          <div style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "5px", lineHeight: 1 }}>{title}</div>
          <div style={{ fontSize: "11px", opacity: 0.9, marginTop: "6px", letterSpacing: "0.5px" }}>{docNumber}</div>
        </div>
        <div
          style={{
            position: "absolute",
            right: "-40px",
            top: "-40px",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background: ACCENT,
            opacity: 0.12,
          }}
        />
      </div>

      {/* META STRIP */}
      <div
        style={{
          background: "#f8fafc",
          borderLeft: `1px solid ${LINE}`,
          borderRight: `1px solid ${LINE}`,
          borderBottom: `1px solid ${LINE}`,
          padding: "14px 28px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "16px",
          fontSize: "11px",
        }}
      >
        <div>
          <div style={{ color: MUTED, textTransform: "uppercase", letterSpacing: "1px", fontSize: "9px", marginBottom: "3px" }}>
            {isInvoice ? "Invoice date" : "Receipt date"}
          </div>
          <div style={{ fontWeight: 700, fontSize: "12px" }}>{dateStr}</div>
          <div style={{ color: MUTED }}>{timeStr}</div>
        </div>
        <div>
          <div style={{ color: MUTED, textTransform: "uppercase", letterSpacing: "1px", fontSize: "9px", marginBottom: "3px" }}>
            Order reference
          </div>
          <div style={{ fontWeight: 700, fontSize: "12px" }}>#{String(order.id).padStart(6, "0")}</div>
          <div style={{ color: MUTED, textTransform: "capitalize" }}>{order.status.replace("_", " ")}</div>
        </div>
        <div>
          <div style={{ color: MUTED, textTransform: "uppercase", letterSpacing: "1px", fontSize: "9px", marginBottom: "3px" }}>
            Payment
          </div>
          <div style={{ fontWeight: 700, fontSize: "12px" }}>{useUSD ? "US Dollar" : "South Sudanese Pound"}</div>
          <div style={{ color: MUTED }}>{useUSD ? "USD" : "SSP"}</div>
        </div>
      </div>

      {/* BODY */}
      <div
        style={{
          padding: "22px 28px",
          borderLeft: `1px solid ${LINE}`,
          borderRight: `1px solid ${LINE}`,
        }}
      >
        {/* Bill-to */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ color: MUTED, textTransform: "uppercase", letterSpacing: "1.5px", fontSize: "9px", marginBottom: "6px", fontWeight: 700 }}>
            Billed to
          </div>
          <div style={{ fontSize: "14px", fontWeight: 700 }}>{order.retailerName || "Customer"}</div>
          {order.deliveryLocation && (
            <div style={{ fontSize: "11px", color: MUTED, marginTop: "2px" }}>{order.deliveryLocation}</div>
          )}
        </div>

        {/* Items table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ background: BRAND, color: "white" }}>
              <th style={{ textAlign: "left", padding: "10px 12px", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 700 }}>
                #
              </th>
              <th style={{ textAlign: "left", padding: "10px 12px", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 700 }}>
                Description
              </th>
              <th style={{ textAlign: "right", padding: "10px 12px", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 700, width: "90px" }}>
                Qty
              </th>
              <th style={{ textAlign: "right", padding: "10px 12px", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 700, width: "110px" }}>
                Unit price
              </th>
              <th style={{ textAlign: "right", padding: "10px 12px", fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 700, width: "120px" }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f8fafc" }}>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${LINE}`, color: MUTED, fontWeight: 600 }}>
                  {String(i + 1).padStart(2, "0")}
                </td>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${LINE}`, fontWeight: 600 }}>
                  {item.productName || "Item"}
                </td>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${LINE}`, textAlign: "right", whiteSpace: "nowrap" }}>
                  {Number(item.quantity).toLocaleString()} <span style={{ color: MUTED }}>{item.unit || ""}</span>
                </td>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${LINE}`, textAlign: "right", whiteSpace: "nowrap" }}>
                  {fmt(item.priceSSP, item.priceUSD)}
                </td>
                <td style={{ padding: "10px 12px", borderBottom: `1px solid ${LINE}`, textAlign: "right", whiteSpace: "nowrap", fontWeight: 700 }}>
                  {fmt(item.priceSSP * Number(item.quantity || 0), item.priceUSD * Number(item.quantity || 0))}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "24px", textAlign: "center", color: MUTED, fontStyle: "italic", borderBottom: `1px solid ${LINE}` }}>
                  No items
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "18px" }}>
          <table style={{ fontSize: "12px", minWidth: "300px" }}>
            <tbody>
              <tr>
                <td style={{ padding: "5px 12px", color: MUTED }}>Items</td>
                <td style={{ padding: "5px 12px", textAlign: "right" }}>{items.length}</td>
              </tr>
              <tr>
                <td style={{ padding: "5px 12px", color: MUTED }}>Total quantity</td>
                <td style={{ padding: "5px 12px", textAlign: "right" }}>{itemCount.toLocaleString()}</td>
              </tr>
              <tr>
                <td style={{ padding: "5px 12px", color: MUTED }}>Subtotal</td>
                <td style={{ padding: "5px 12px", textAlign: "right" }}>{fmt(items.reduce((s, i) => s + i.priceSSP * Number(i.quantity || 0), 0), items.reduce((s, i) => s + i.priceUSD * Number(i.quantity || 0), 0))}</td>
              </tr>
              <tr>
                <td colSpan={2} style={{ padding: "0", borderTop: `2px solid ${INK}` }} />
              </tr>
              <tr style={{ background: BRAND, color: "white" }}>
                <td style={{ padding: "12px", fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", fontSize: "12px" }}>
                  Total due
                </td>
                <td style={{ padding: "12px", textAlign: "right", fontSize: "18px", fontWeight: 800 }}>
                  {fmt(order.totalSSP ?? total, order.totalUSD ?? total)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Status badge */}
        {!isInvoice && (
          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <div
              style={{
                display: "inline-block",
                border: `2px solid ${BRAND}`,
                color: BRAND,
                padding: "8px 24px",
                borderRadius: "999px",
                fontWeight: 800,
                letterSpacing: "3px",
                fontSize: "11px",
                textTransform: "uppercase",
                transform: "rotate(-2deg)",
              }}
            >
              ✓ Paid · Thank you
            </div>
          </div>
        )}

        {/* Notes / terms */}
        <div style={{ marginTop: "28px", padding: "14px 16px", background: "#f8fafc", borderLeft: `3px solid ${ACCENT}`, fontSize: "10.5px", color: MUTED, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 700, color: INK, marginBottom: "4px", letterSpacing: "0.5px", textTransform: "uppercase", fontSize: "9px" }}>
            {isInvoice ? "Payment terms" : "Terms"}
          </div>
          {isInvoice
            ? "Payment due within 7 days of issue. Goods remain the property of AgriMarket South Sudan until paid in full. For questions about this invoice, contact billing@agrimarket.ss."
            : "This receipt confirms payment for the items listed above. Please retain it for your records. For returns or questions, contact support@agrimarket.ss within 48 hours."}
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          background: BRAND_DARK,
          color: "white",
          padding: "16px 28px",
          borderRadius: "0 0 4px 4px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "16px",
          fontSize: "10px",
        }}
      >
        <div>
          <div style={{ fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.7, fontSize: "8.5px", marginBottom: "4px" }}>
            Address
          </div>
          <div>AgriMarket Hub</div>
          <div style={{ opacity: 0.85 }}>Konyo Konyo Market, Juba</div>
          <div style={{ opacity: 0.85 }}>South Sudan</div>
        </div>
        <div>
          <div style={{ fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.7, fontSize: "8.5px", marginBottom: "4px" }}>
            Contact
          </div>
          <div>+211 900 000 000</div>
          <div style={{ opacity: 0.85 }}>support@agrimarket.ss</div>
          <div style={{ opacity: 0.85 }}>www.agrimarket.ss</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.7, fontSize: "8.5px", marginBottom: "4px" }}>
            Authorised by
          </div>
          <div style={{ borderBottom: "1px solid rgba(255,255,255,0.4)", paddingBottom: "2px", marginBottom: "2px", minHeight: "18px" }}>
            &nbsp;
          </div>
          <div style={{ opacity: 0.85, fontSize: "9px" }}>Signature & stamp</div>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "10px", fontSize: "9px", color: MUTED, letterSpacing: "1px" }}>
        AgriMarket South Sudan · Connecting farmers, retailers and logistics across the country
      </div>
    </div>
  );
}
