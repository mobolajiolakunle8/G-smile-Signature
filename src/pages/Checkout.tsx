import { useState } from "react";
import { useStore, type Order } from "../store/StoreContext";
import { navigate } from "../store/useRouter";
import { formatNaira } from "../store/data";
import { Button, Input } from "../components/ui";
import { Icon } from "../components/Icons";
import { CONTACT } from "../data/content";
import { cn } from "../utils/cn";
import { generateEmail, sendTransactionalEmail } from "../services/emailService";
import { compressImage } from "../utils/imageCompression";
import type { Coupon } from "../store/data";

export function Checkout() {
  const { cart, cartSubtotal, user, placeOrder, toast, settings, uploadPaymentProof } = useStore();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "Lagos",
    postal: "",
  });
  const { coupons } = useStore();
  const [selectedAccount, setSelectedAccount] = useState(settings.paymentAccounts[0]?.id || "");
  const [couponCode, setCouponCode] = useState("");
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState<Order | null>(null);
  const [proofUploading, setProofUploading] = useState(false);

  const shipping = cartSubtotal > 150000 ? 0 : form.state === "Lagos" ? 2500 : 5000;
  
  const discount = activeCoupon 
    ? (activeCoupon.discountType === "percent" 
        ? Math.round(cartSubtotal * (activeCoupon.discountValue / 100))
        : activeCoupon.discountValue)
    : 0;
    
  const total = cartSubtotal - discount + shipping;

  const handleApplyCoupon = () => {
    if (!couponCode) return;
    const found = coupons.find(c => c.code === couponCode.toUpperCase() && c.active);
    if (!found) {
      setActiveCoupon(null);
      return toast("Invalid or expired coupon");
    }
    if (found.minOrder && cartSubtotal < found.minOrder) {
      setActiveCoupon(null);
      return toast(`Minimum order for this coupon is ${formatNaira(found.minOrder)}`);
    }
    if (found.maxUses && found.uses >= found.maxUses) {
      setActiveCoupon(null);
      return toast("This coupon has reached its usage limit");
    }
    setActiveCoupon(found);
    toast(`Coupon ${found.code} applied successfully!`);
  };

  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const selectedBank = settings.paymentAccounts.find((a) => a.id === selectedAccount);

  const whatsappOrderMsg = (order: Order) => {
    const bank = selectedBank;
    return encodeURIComponent(
      `Hello G-Smile Signature,\n\n` +
      `I just placed an order and would like to confirm my payment.\n\n` +
      `📦 Order: ${order.id}\n` +
      `💰 Amount: ${formatNaira(order.total)}\n` +
      `🏦 Transferred to: ${bank?.bank || "N/A"}\n` +
      `📄 Account: ${bank?.accountNumber || "N/A"}\n` +
      `👤 Name: ${form.name}\n` +
      `📱 Phone: ${form.phone}\n\n` +
      `Please confirm my payment. Thank you!`
    );
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>, orderId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofUploading(true);
    try {
      const compressed = await compressImage(file, 1200, 0.7);
      uploadPaymentProof(orderId, compressed);
    } catch {
      toast("Failed to upload proof");
    }
    setProofUploading(false);
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!selectedBank) return toast("Please select a bank account");
    setProcessing(true);
    setTimeout(() => {
      const placed = placeOrder({
        items: cart.map((i) => ({ name: i.product.name, qty: i.qty, price: i.product.price, image: i.product.image })),
        subtotal: cartSubtotal,
        shippingCost: shipping,
        discount,
        total,
        paymentMethod: `Bank Transfer (${selectedBank.bank})`,
        shipping: { address: form.address, city: form.city, state: form.state },
      });
      const order: Order = { ...placed, customerName: form.name, customerEmail: form.email, customerPhone: form.phone };
      
      // Trigger Order Confirmation Email
      const emailPayload = generateEmail('order-confirmation', {
        email: order.customerEmail,
        customerName: order.customerName,
        orderId: order.id,
        total: formatNaira(order.total),
        itemCount: order.items.reduce((sum, item) => sum + item.qty, 0),
        trackUrl: `${window.location.origin}/track?order=${order.id}`,
      });
      sendTransactionalEmail(emailPayload);
      
      setProcessing(false);
      setDone(order);
    }, 1200);
  };

  /* ── ORDER CONFIRMATION ── */
  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold/15 text-gold">
            <Icon.check className="h-10 w-10" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-semibold">Order Placed Successfully!</h1>
          <p className="mt-3 text-ink/60">
            Your order <span className="font-semibold text-ink">{done.id}</span> has been received.
            <br />Please complete your bank transfer to proceed.
          </p>
        </div>

        {/* Bank Details */}
        {selectedBank && (
          <div className="mt-8 rounded-xl border-2 border-gold/30 bg-cream/60 p-6">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
              <Icon.shield className="h-5 w-5 text-gold" /> Transfer Details
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-ash">Bank Name</p>
                <p className="mt-1 text-lg font-semibold text-ink">{selectedBank.bank}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-ash">Account Number</p>
                <p className="mt-1 text-lg font-semibold text-ink">{selectedBank.accountNumber}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-ash">Account Name</p>
                <p className="mt-1 text-lg font-semibold text-ink">{selectedBank.accountName}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-gold/10 px-4 py-3 text-sm text-ink">
              <Icon.gem className="h-4 w-4 text-gold" />
              <span>Transfer exactly <span className="font-bold text-gold">{formatNaira(done.total)}</span> to the account above</span>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="mt-6 rounded-xl border border-cream bg-white p-5">
          <h4 className="font-display text-base font-semibold">Order Summary</h4>
          <div className="mt-3 space-y-2 text-sm">
            {done.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-ink/70">{item.qty}× {item.name}</span>
                <span className="font-medium">{formatNaira(item.price * item.qty)}</span>
              </div>
            ))}
            <div className="border-t border-cream pt-2">
              <div className="flex justify-between text-ink/60"><span>Subtotal</span><span>{formatNaira(done.subtotal)}</span></div>
              <div className="flex justify-between text-ink/60"><span>Shipping</span><span>{done.shippingCost === 0 ? "Free" : formatNaira(done.shippingCost)}</span></div>
              {done.discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>-{formatNaira(done.discount)}</span></div>}
              <div className="mt-1 flex justify-between font-display text-lg font-semibold">
                <span>Total</span><span className="text-gold">{formatNaira(done.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Payment Proof */}
        <div className="mt-6 rounded-xl border border-cream bg-white p-5">
          <h4 className="font-display text-base font-semibold">Upload Payment Proof</h4>
          <p className="mt-1 text-sm text-ink/60">Upload a screenshot of your bank transfer for faster confirmation.</p>
          {done.paymentProof ? (
            <div className="mt-4">
              <img src={done.paymentProof} alt="Payment proof" className="h-48 w-auto rounded-lg border border-cream object-contain" />
              <p className="mt-2 flex items-center gap-2 text-sm text-green-700"><Icon.check className="h-4 w-4" /> Proof uploaded — awaiting admin confirmation</p>
            </div>
          ) : (
            <label className="mt-4 block cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleProofUpload(e, done.id)} />
              <span className="inline-flex items-center gap-2 border border-ink/15 bg-cream/40 px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-gold hover:text-gold">
                <Icon.plus className="h-4 w-4" /> {proofUploading ? "Compressing & Uploading…" : "Upload Screenshot"}
              </span>
            </label>
          )}
        </div>

        {/* WhatsApp + Actions */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a
            href={`https://wa.me/${CONTACT.whatsapp}?text=${whatsappOrderMsg(done)}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366] py-4 text-sm font-semibold uppercase tracking-widest text-white transition-transform hover:scale-[1.02]"
          >
            <Icon.whatsapp className="h-5 w-5" /> Confirm via WhatsApp
          </a>
          <button
            onClick={() => navigate(`/track?order=${done.id}`)}
            className="flex items-center justify-center gap-2 rounded-lg bg-ink py-4 text-sm font-semibold uppercase tracking-widest text-white transition-transform hover:scale-[1.02]"
          >
            <Icon.truck className="h-5 w-5" /> Track Order
          </button>
        </div>

        <div className="mt-6 text-center">
          <button onClick={() => navigate("/shop")} className="text-sm font-semibold text-gold hover:underline">
            ← Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  /* ── EMPTY CART ── */
  if (cart.length === 0) {
    return (
      <div className="grid min-h-[50vh] place-items-center px-4 text-center">
        <div>
          <h2 className="font-display text-2xl">Your cart is empty</h2>
          <Button variant="gold" className="mt-4" onClick={() => navigate("/shop")}>Shop Now</Button>
        </div>
      </div>
    );
  }

  /* ── CHECKOUT FORM ── */
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Checkout</h1>
      <form onSubmit={handlePay} className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-10">
          {/* Step 1: Customer */}
          <section>
            <h2 className="mb-5 flex items-center gap-3 font-display text-xl font-semibold">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-xs text-white">1</span> Customer Information
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full Name" value={form.name} onChange={set("name")} required placeholder="Jane Doe" />
              <Input label="Email" type="email" value={form.email} onChange={set("email")} required placeholder="you@email.com" />
              <Input label="Phone Number" value={form.phone} onChange={set("phone")} required placeholder="+234..." />
            </div>
          </section>

          {/* Step 2: Shipping */}
          <section>
            <h2 className="mb-5 flex items-center gap-3 font-display text-xl font-semibold">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-xs text-white">2</span> Shipping Address
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Input label="Street Address" value={form.address} onChange={set("address")} required placeholder="12 Admiralty Way" /></div>
              <Input label="City" value={form.city} onChange={set("city")} required placeholder="Lekki" />
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/60">State</span>
                <select value={form.state} onChange={(e) => set("state")(e.target.value)} className="w-full border border-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-gold">
                  {["Lagos", "Abuja (FCT)", "Rivers", "Oyo", "Kano", "Other"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <Input label="Postal Code" value={form.postal} onChange={set("postal")} placeholder="100001" />
            </div>
          </section>

          {/* Step 3: Payment */}
          <section>
            <h2 className="mb-5 flex items-center gap-3 font-display text-xl font-semibold">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-ink text-xs text-white">3</span> Payment — Bank Transfer
            </h2>
            <p className="mb-4 text-sm text-ink/60">
              Select a bank account below. After placing your order, you'll see the full transfer details and can upload your payment proof.
            </p>
            {settings.paymentAccounts.length > 0 ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  {settings.paymentAccounts.map((acc) => (
                    <button
                      type="button"
                      key={acc.id}
                      onClick={() => setSelectedAccount(acc.id)}
                      className={cn(
                        "flex flex-col items-start gap-2 border p-5 text-left transition-all",
                        selectedAccount === acc.id
                          ? "border-gold bg-gold/5 ring-2 ring-gold/20"
                          : "border-ink/15 hover:border-ink/30"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className={cn("h-3 w-3 rounded-full", selectedAccount === acc.id ? "bg-gold" : "bg-ash/40")} />
                        <span className="font-semibold text-ink">{acc.bank}</span>
                      </span>
                      <span className="text-sm text-ink/60">{acc.accountNumber}</span>
                      <span className="text-xs text-ash">{acc.accountName}</span>
                    </button>
                  ))}
                </div>
                {selectedBank && (
                  <div className="mt-4 rounded-lg border border-gold/20 bg-cream/60 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <Icon.check className="h-4 w-4 text-gold" />
                      You'll transfer to: <span className="text-gold">{selectedBank.bank} — {selectedBank.accountNumber}</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                No bank accounts configured. Please contact support.
              </div>
            )}
          </section>
        </div>

        {/* Order Summary */}
        <div className="h-fit bg-cream/50 p-6">
          <h3 className="font-display text-xl font-semibold">Order Summary</h3>
          <div className="mt-5 max-h-64 space-y-4 overflow-y-auto">
            {cart.map((i) => (
              <div key={i.id} className="flex gap-3">
                <div className="relative">
                  <img src={i.product.image} alt="" className="h-16 w-14 object-cover" />
                  <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] text-white">{i.qty}</span>
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium leading-tight">{i.product.name}</p>
                  <p className="text-xs text-ash">{i.color} · {i.size}</p>
                </div>
                <span className="text-sm font-medium">{formatNaira(i.product.price * i.qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex">
            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter coupon code" className="w-full border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-gold" />
            <button type="button" onClick={handleApplyCoupon} className="bg-ink px-4 text-xs font-semibold uppercase tracking-wider text-white hover:bg-gold hover:text-ink">Apply</button>
          </div>
          {activeCoupon && <p className="mt-1 text-xs text-green-700">✓ Coupon applied — {activeCoupon.discountType === "percent" ? `${activeCoupon.discountValue}%` : formatNaira(activeCoupon.discountValue)} off!</p>}
          <div className="mt-5 space-y-2 border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between"><span className="text-ink/60">Subtotal</span><span>{formatNaira(cartSubtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>−{formatNaira(discount)}</span></div>}
            <div className="flex justify-between"><span className="text-ink/60">Shipping</span><span>{shipping === 0 ? "Free" : formatNaira(shipping)}</span></div>
            <div className="flex justify-between border-t border-ink/10 pt-2 font-display text-lg font-semibold"><span>Total</span><span className="text-gold">{formatNaira(total)}</span></div>
          </div>
          <Button type="submit" variant="dark" className="mt-5 w-full" disabled={processing || !selectedBank}>
            {processing ? "Placing Order…" : `Place Order · ${formatNaira(total)}`}
          </Button>
          <div className="mt-4 flex flex-col items-center gap-2 text-[11px] text-ash">
            <p className="flex items-center gap-1.5"><Icon.shield className="h-3.5 w-3.5" /> Secure, Encrypted Checkout</p>
            <p className="flex items-center gap-1.5"><Icon.truck className="h-3.5 w-3.5" /> Fast Nationwide Delivery (2–5 days)</p>
            <p className="flex items-center gap-1.5"><Icon.refresh className="h-3.5 w-3.5" /> 7-Day Hassle-Free Returns</p>
          </div>
        </div>
      </form>
    </div>
  );
}
