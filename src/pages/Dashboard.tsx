import { useState } from "react";
import type { ReactElement } from "react";
import { useStore } from "../store/StoreContext";
import { navigate } from "../store/useRouter";
import type { EditableProduct } from "../store/data";
import { formatNaira } from "../store/data";
import { Button, Input } from "../components/ui";
import { Icon } from "../components/Icons";
import { ProductCard } from "../components/ProductCard";
import { cn } from "../utils/cn";
import { CONTACT } from "../data/content";

const statusColor: Record<string, string> = {
  "Awaiting Payment": "bg-amber-100 text-amber-700",
  "Payment Confirmed": "bg-blue-100 text-blue-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-indigo-100 text-indigo-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

type Tab = "overview" | "orders" | "track" | "wishlist" | "address" | "details";

export function Dashboard({ onQuickView }: { onQuickView: (p: EditableProduct) => void }) {
  const { user, orders, wishlist, logout, toast } = useStore();
  const [tab, setTab] = useState<Tab>("overview");
  const [trackInput, setTrackInput] = useState("");

  if (!user) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4 text-center">
        <div>
          <Icon.user className="mx-auto h-14 w-14 text-ash" />
          <h2 className="mt-4 font-display text-2xl font-semibold text-ink">Please sign in</h2>
          <p className="mt-2 text-ink/60">Sign in to access your account.</p>
          <Button variant="gold" className="mt-6" onClick={() => navigate("/login")}>Sign In</Button>
        </div>
      </div>
    );
  }

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((s, o) => s + o.total, 0);

  const navItems: { id: Tab; label: string; icon: (p: { className?: string }) => ReactElement }[] = [
    { id: "overview", label: "Overview", icon: Icon.chart },
    { id: "orders", label: "My Orders", icon: Icon.box },
    { id: "track", label: "Track Order", icon: Icon.truck },
    { id: "wishlist", label: "Wishlist", icon: Icon.heart },
    { id: "address", label: "Saved Address", icon: Icon.pin },
    { id: "details", label: "Account Details", icon: Icon.user },
  ];

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackInput.trim()) {
      navigate(`/track?order=${trackInput.trim()}`);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-cream pb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold">My Account</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">Hello, {user.name}</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => { logout(); navigate("/"); }}>Sign Out</Button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside>
          <div className="flex gap-1 overflow-x-auto rounded-lg bg-cream/40 p-1 lg:flex-col lg:overflow-visible lg:rounded-none lg:bg-transparent lg:p-0">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  "flex shrink-0 items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition-colors lg:w-full lg:rounded-none lg:border-b lg:border-transparent",
                  tab === item.id
                    ? "bg-white text-ink shadow-sm lg:bg-transparent lg:text-ink lg:shadow-none lg:border-gold"
                    : "text-ink/60 hover:text-ink lg:hover:bg-cream/40"
                )}
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </button>
            ))}
          </div>

          <div className="mt-8 hidden rounded-lg border border-cream bg-cream/40 p-4 lg:block">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ash">Need help?</p>
            <p className="mt-1 text-xs text-ink/70">Our team is just a tap away.</p>
            <a
              href={`https://wa.me/${CONTACT.whatsapp}?text=Hello G-Smile Signature, I need help with my order.`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded bg-[#25D366] px-3 py-2 text-xs font-semibold text-white hover:bg-[#128C7E]"
            >
              <Icon.whatsapp className="h-3.5 w-3.5" /> Chat on WhatsApp
            </a>
          </div>
        </aside>

        {/* Main content */}
        <div>
          {/* OVERVIEW */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-cream bg-white p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ash">Total Orders</p>
                  <p className="mt-2 font-display text-2xl font-semibold text-ink">{totalOrders}</p>
                </div>
                <div className="rounded-lg border border-cream bg-white p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ash">Saved Items</p>
                  <p className="mt-2 font-display text-2xl font-semibold text-ink">{wishlist.length}</p>
                </div>
                <div className="rounded-lg border border-cream bg-white p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ash">Lifetime Spent</p>
                  <p className="mt-2 font-display text-2xl font-semibold text-gold">{formatNaira(totalSpent)}</p>
                </div>
              </div>

              <div className="rounded-lg border border-cream bg-white p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold text-ink">Recent Orders</h3>
                  <button onClick={() => setTab("orders")} className="text-xs font-semibold text-gold hover:underline">View all</button>
                </div>
                {orders.length === 0 ? (
                  <p className="text-sm text-ink/60">You have no orders yet. <button onClick={() => navigate("/shop")} className="font-semibold text-gold hover:underline">Start shopping</button></p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((o) => (
                      <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-cream/40 p-3">
                        <div className="flex items-center gap-3">
                          <img src={o.items[0].image} alt="" className="h-12 w-12 rounded object-cover" />
                          <div>
                            <p className="text-sm font-medium text-ink">{o.id}</p>
                            <p className="text-[11px] text-ash">{o.date} · {o.items.length} item(s)</p>
                          </div>
                        </div>
                        <span className={cn("rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", statusColor[o.status])}>{o.status}</span>
                        <span className="text-sm font-semibold text-ink">{formatNaira(o.total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ORDERS */}
          {tab === "orders" && (
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">My Orders</h2>
              {orders.length === 0 ? (
                <div className="mt-6 rounded-lg border border-cream bg-cream/40 p-8 text-center">
                  <p className="text-ink/60">You have no orders yet.</p>
                  <Button variant="dark" size="sm" className="mt-4" onClick={() => navigate("/shop")}>Browse Shop</Button>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {orders.map((o) => (
                    <div key={o.id} className="rounded-lg border border-cream bg-white">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream bg-cream/30 px-5 py-3">
                        <div>
                          <p className="text-sm font-semibold text-ink">{o.id}</p>
                          <p className="text-[11px] text-ash">Placed {o.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn("rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", statusColor[o.status])}>{o.status}</span>
                          <span className="text-sm font-semibold text-ink">{formatNaira(o.total)}</span>
                        </div>
                      </div>
                      <div className="space-y-3 px-5 py-4">
                        {o.items.map((i) => (
                          <div key={i.name} className="flex items-center gap-3">
                            <img src={i.image} alt="" className="h-12 w-12 rounded object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-sm font-medium text-ink">{i.name}</p>
                              <p className="text-[11px] text-ash">Qty {i.qty}</p>
                            </div>
                            <span className="text-sm text-ink/70">{formatNaira(i.price)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap justify-end gap-2 border-t border-cream px-5 py-3">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/track?order=${o.id}`)}>Track</Button>
                        <a
                          href={`https://wa.me/${CONTACT.whatsapp}?text=Hello G-Smile Signature, I have a question about order ${o.id}.`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded border border-[#25D366] px-3 py-1.5 text-xs font-semibold text-[#128C7E] hover:bg-[#25D366]/10"
                        >
                          <Icon.whatsapp className="h-3.5 w-3.5" /> WhatsApp
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TRACK ORDER */}
          {tab === "track" && (
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Track an Order</h2>
              <form onSubmit={handleTrackSubmit} className="mt-4 rounded-lg border border-cream bg-white p-6">
                <p className="text-sm text-ink/60">Enter your order number to view real-time status updates.</p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    value={trackInput}
                    onChange={(e) => setTrackInput(e.target.value)}
                    placeholder="e.g. GS-10455"
                    className="flex-1 border border-cream bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold"
                  />
                  <Button type="submit" variant="dark">Track Order</Button>
                </div>
              </form>

              {orders.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-ash">Your Active Orders</h3>
                  <div className="mt-3 space-y-2">
                    {orders.slice(0, 5).map((o) => (
                      <button key={o.id} onClick={() => navigate(`/track?order=${o.id}`)} className="flex w-full items-center justify-between rounded-lg border border-cream bg-white p-3 text-left text-sm transition-colors hover:border-gold">
                        <div>
                          <p className="font-semibold text-ink">{o.id}</p>
                          <p className="text-[11px] text-ash">{o.items.length} item(s) · {formatNaira(o.total)}</p>
                        </div>
                        <span className={cn("rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", statusColor[o.status])}>{o.status}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* WISHLIST */}
          {tab === "wishlist" && (
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">My Wishlist</h2>
              {wishlist.length === 0 ? (
                <div className="mt-6 rounded-lg border border-cream bg-cream/40 p-8 text-center">
                  <Icon.heart className="mx-auto h-10 w-10 text-ash" />
                  <p className="mt-3 text-ink/60">No saved items yet.</p>
                  <Button variant="dark" size="sm" className="mt-4" onClick={() => navigate("/shop")}>Discover Bags</Button>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
                  {wishlist.map((p) => <ProductCard key={p.id} product={p} onQuickView={onQuickView} />)}
                </div>
              )}
            </div>
          )}

          {/* SAVED ADDRESS */}
          {tab === "address" && (
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Saved Address</h2>
              <div className="mt-4 max-w-xl rounded-lg border border-cream bg-white p-6">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ash">Default Address</p>
                <div className="mt-3 space-y-3">
                  <Input label="Street Address" placeholder="12 Admiralty Way" />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="City" placeholder="Lekki" />
                    <Input label="State" placeholder="Lagos" />
                  </div>
                  <Input label="Postal Code" placeholder="100001" />
                </div>
                <div className="mt-5 flex justify-end">
                  <Button variant="dark" size="sm" onClick={() => toast("Address saved")}>Save Address</Button>
                </div>
              </div>
            </div>
          )}

          {/* ACCOUNT DETAILS */}
          {tab === "details" && (
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Account Details</h2>
              <div className="mt-4 max-w-xl space-y-6">
                <div className="rounded-lg border border-cream bg-white p-6">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-ash">Personal Information</h3>
                  <div className="mt-3 space-y-3">
                    <Input label="Full Name" value={user.name} onChange={() => {}} />
                    <Input label="Email" value={user.email} onChange={() => {}} />
                    <Input label="Phone" value={user.phone} placeholder="+234..." />
                  </div>
                  <div className="mt-5 flex justify-end">
                    <Button variant="dark" size="sm" onClick={() => toast("Profile updated")}>Save Changes</Button>
                  </div>
                </div>

                <div className="rounded-lg border border-cream bg-white p-6">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-ash">Change Password</h3>
                  <div className="mt-3 space-y-3">
                    <Input label="Current Password" type="password" placeholder="••••••••" />
                    <Input label="New Password" type="password" placeholder="••••••••" />
                  </div>
                  <div className="mt-5 flex justify-end">
                    <Button variant="dark" size="sm" onClick={() => toast("Password changed")}>Update Password</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
