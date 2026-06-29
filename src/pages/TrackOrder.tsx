import { useState, useEffect } from "react";
import { useStore, type Order } from "../store/StoreContext";
import { useRouter } from "../store/useRouter";
import { formatNaira } from "../store/data";
import { Button, Input } from "../components/ui";
import { Icon } from "../components/Icons";
import { CONTACT } from "../data/content";
import { cn } from "../utils/cn";

const statusColor: Record<string, string> = {
  "Awaiting Payment": "bg-amber-100 text-amber-700",
  "Payment Confirmed": "bg-blue-100 text-blue-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-indigo-100 text-indigo-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export function TrackOrder() {
  const { orders } = useStore();
  const { route } = useRouter();
  const [query, setQuery] = useState(route.query.order || "");
  const [result, setResult] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);

  const doSearch = (id: string) => {
    const found = orders.find((o) => o.id.toLowerCase() === id.trim().toLowerCase());
    setResult(found || null);
    setSearched(true);
  };

  useEffect(() => {
    if (route.query.order) doSearch(route.query.order);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Order Tracking</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">Track Your Order</h1>
        <p className="mt-3 text-ink/60">Enter your order number to see live status and delivery details.</p>
        <p className="mt-1 text-xs text-ash">Try a sample: GS-10455 or GS-10428</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); doSearch(query); }} className="mt-8 flex gap-3">
        <div className="flex-1"><Input value={query} onChange={setQuery} placeholder="e.g. GS-10455" /></div>
        <Button type="submit" variant="dark">Track</Button>
      </form>

      {searched && !result && (
        <div className="mt-10 border border-cream py-12 text-center">
          <Icon.box className="mx-auto h-12 w-12 text-ash" />
          <p className="mt-4 text-ink/60">No order found with that number. Please check and try again.</p>
        </div>
      )}

      {result && (
        <div className="mt-10 border border-cream">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream bg-cream/40 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-ash">Order</p>
              <p className="font-display text-lg font-semibold">{result.id}</p>
            </div>
            <span className={cn("px-3 py-1 text-xs font-semibold uppercase tracking-wider", statusColor[result.status])}>{result.status}</span>
          </div>

          {/* timeline */}
          <div className="px-6 py-8">
            <div className="relative flex justify-between">
              <div className="absolute left-0 right-0 top-3 h-0.5 bg-cream" />
              <div className="absolute left-0 top-3 h-0.5 bg-gold" style={{ width: `${(result.tracking.filter((t) => t.done).length - 1) / (result.tracking.length - 1) * 100}%` }} />
              {result.tracking.map((t) => (
                <div key={t.label} className="relative flex flex-1 flex-col items-center text-center">
                  <div className={cn("z-10 grid h-7 w-7 place-items-center rounded-full border-2 bg-white", t.done ? "border-gold text-gold" : "border-ash text-ash")}>
                    {t.done ? <Icon.check className="h-3.5 w-3.5" /> : <span className="h-2 w-2 rounded-full bg-ash" />}
                  </div>
                  <p className={cn("mt-2 text-[11px] font-medium", t.done ? "text-ink" : "text-ash")}>{t.label}</p>
                  <p className="text-[10px] text-ash">{t.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* details */}
          <div className="grid gap-6 border-t border-cream px-6 py-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ash">Delivery Address</p>
              <p className="text-sm text-ink/70">{result.customerName}</p>
              <p className="text-sm text-ink/70">{result.shipping.address}</p>
              <p className="text-sm text-ink/70">{result.shipping.city}, {result.shipping.state}</p>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ash">Items</p>
              {result.items.map((i) => (
                <p key={i.name} className="text-sm text-ink/70">{i.qty} × {i.name}</p>
              ))}
              <p className="mt-2 font-semibold">Total: {formatNaira(result.total)}</p>
            </div>
          </div>

          {/* payment info */}
          <div className="border-t border-cream px-6 py-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="text-ash">Payment:</span>
              <span className="font-medium">{result.paymentMethod}</span>
              {result.paymentConfirmedAt && (
                <span className="flex items-center gap-1 text-green-700">
                  <Icon.check className="h-3.5 w-3.5" /> Confirmed {result.paymentConfirmedAt}
                </span>
              )}
              {result.status === "Awaiting Payment" && (
                <a
                  href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(`Hi, I'd like to confirm payment for order ${result.id} — ${formatNaira(result.total)}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto flex items-center gap-2 rounded bg-[#25D366] px-4 py-2 text-xs font-semibold text-white"
                >
                  <Icon.whatsapp className="h-4 w-4" /> Confirm via WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
