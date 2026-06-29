import { useState } from "react";
import { useStore } from "../store/StoreContext";
import { navigate } from "../store/useRouter";
import { formatNaira } from "../store/data";
import { Button } from "../components/ui";
import { Icon } from "../components/Icons";

export function Cart() {
  const { cart, updateQty, removeFromCart, cartSubtotal } = useStore();
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(false);
  const [state, setState] = useState("Lagos");

  const shipping = cartSubtotal > 150000 ? 0 : cartSubtotal === 0 ? 0 : state === "Lagos" ? 2500 : 5000;
  const discount = applied ? Math.round(cartSubtotal * 0.1) : 0;
  const total = cartSubtotal - discount + shipping;

  if (cart.length === 0) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4">
        <div className="text-center">
          <Icon.bag className="mx-auto h-16 w-16 text-ash" />
          <h2 className="mt-6 font-display text-3xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-ink/60">Looks like you haven't added anything yet.</p>
          <Button variant="gold" className="mt-6" onClick={() => navigate("/shop")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Shopping Cart</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="hidden grid-cols-[2fr_1fr_1fr_auto] gap-4 border-b border-cream pb-3 text-xs font-semibold uppercase tracking-wider text-ash sm:grid">
            <span>Product</span><span>Price</span><span>Quantity</span><span>Total</span>
          </div>
          {cart.map((item) => (
            <div key={item.id} className="grid grid-cols-1 gap-4 border-b border-cream py-6 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-center">
              <div className="flex gap-4">
                <img src={item.product.image} alt={item.product.name} className="h-24 w-20 object-cover" />
                <div>
                  <h3 className="font-display text-[15px] font-medium">{item.product.name}</h3>
                  <p className="mt-0.5 text-xs text-ash">{item.color} · {item.size}</p>
                  <button onClick={() => removeFromCart(item.id)} className="mt-2 flex items-center gap-1 text-xs text-ash hover:text-ink"><Icon.trash className="h-3.5 w-3.5" /> Remove</button>
                </div>
              </div>
              <span className="text-sm text-ink/70">{formatNaira(item.product.price)}</span>
              <div className="flex items-center border border-ink/15 w-fit">
                <button onClick={() => updateQty(item.id, item.qty - 1)} className="px-3 py-2 hover:text-gold"><Icon.minus className="h-3 w-3" /></button>
                <span className="w-8 text-center text-sm">{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-3 py-2 hover:text-gold"><Icon.plus className="h-3 w-3" /></button>
              </div>
              <span className="font-semibold">{formatNaira(item.product.price * item.qty)}</span>
            </div>
          ))}
          <button onClick={() => navigate("/shop")} className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink hover:text-gold">
            <Icon.arrowRight className="h-4 w-4 rotate-180" /> Continue Shopping
          </button>
        </div>

        {/* summary */}
        <div className="h-fit bg-cream/50 p-6">
          <h3 className="font-display text-xl font-semibold">Order Summary</h3>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-ink/60">Subtotal</span><span className="font-medium">{formatNaira(cartSubtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-700"><span>Discount (10%)</span><span>−{formatNaira(discount)}</span></div>}
            <div>
              <div className="flex justify-between"><span className="text-ink/60">Shipping</span><span className="font-medium">{shipping === 0 ? "Free" : formatNaira(shipping)}</span></div>
              <select value={state} onChange={(e) => setState(e.target.value)} className="mt-2 w-full border border-ink/15 bg-white px-3 py-2 text-xs outline-none focus:border-gold">
                <option value="Lagos">Lagos (₦2,500)</option>
                <option value="Abuja">Abuja (₦5,000)</option>
                <option value="Other">Other States (₦5,000)</option>
              </select>
              {cartSubtotal > 150000 && <p className="mt-1 text-[11px] text-green-700">Free shipping unlocked!</p>}
            </div>
          </div>
          <div className="mt-5 flex">
            <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code (try SMILE10)" className="w-full border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-gold" />
            <button onClick={() => setApplied(coupon.toUpperCase() === "SMILE10")} className="bg-ink px-4 text-xs font-semibold uppercase tracking-wider text-white hover:bg-gold hover:text-ink">Apply</button>
          </div>
          {applied && <p className="mt-1 text-xs text-green-700">Coupon applied — 10% off!</p>}
          <div className="mt-5 flex justify-between border-t border-ink/10 pt-4">
            <span className="font-display text-lg font-semibold">Total</span>
            <span className="font-display text-lg font-semibold text-gold">{formatNaira(total)}</span>
          </div>
          <Button variant="dark" className="mt-5 w-full" onClick={() => navigate("/checkout")}>Proceed to Checkout</Button>
          <p className="mt-3 text-center text-[11px] text-ash">Secure checkout via bank transfer</p>
        </div>
      </div>
    </div>
  );
}
