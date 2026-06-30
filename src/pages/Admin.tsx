import { useState, useMemo } from "react";
import { useStore, ADMIN_CREDENTIALS, type OrderStatus } from "../store/StoreContext";
import { navigate } from "../store/useRouter";
import { formatNaira } from "../store/data";
import type { EditableProduct, EditableCategory, EditableTestimonial, EditableFaq, Coupon, ProductTag, ProductVariant } from "../store/data";
import { Input, Button } from "../components/ui";
import { Icon } from "../components/Icons";
import { setValue, SYNC_PATHS } from "../firebase/sync";
import { firebaseEnabled } from "../firebase/config";
import { cn } from "../utils/cn";
import { useAdminTheme } from "../components/AdminTheme";
import { cloudinaryEnabled, optimizeImageUrl, uploadImageToCloudinary } from "../services/imageCdn";

/* ─── Types ────────────────────────────────────────────── */
type Section =
  | "overview"
  | "products" | "categories" | "inventory"
  | "orders" | "customers"
  | "coupons" | "banners"
  | "testimonials" | "faqs"
  | "settings";

/* ─── Sidebar config (clean, minimal — 11 items) ─────── */
const sidebarItems: { id: Section; label: string; icon: keyof typeof Icon }[] = [
  { id: "overview",    label: "Overview",    icon: "chart"    },
  { id: "products",    label: "Products",    icon: "bag"      },
  { id: "categories",  label: "Categories",  icon: "tag"      },
  { id: "inventory",   label: "Inventory",   icon: "box"      },
  { id: "orders",      label: "Orders",      icon: "truck"    },
  { id: "customers",   label: "Customers",   icon: "user"     },
  { id: "coupons",     label: "Coupons",     icon: "tag"      },
  { id: "banners",     label: "Banners",     icon: "settings" },
  { id: "testimonials",label: "Testimonials",icon: "star"     },
  { id: "faqs",        label: "FAQs",        icon: "headset"  },
  { id: "settings",    label: "Settings",    icon: "settings" },
];

/* ─── Status badge colours (brand palette) ───────────── */
const statusBadge: Record<string, string> = {
  "Awaiting Payment": "bg-amber-100 text-amber-800",
  "Payment Confirmed": "bg-blue-100 text-blue-800",
  Processing: "bg-gold/20     text-ink",
  Shipped:    "bg-ink/10      text-ink",
  Delivered:  "bg-green-100   text-green-800",
  Cancelled:  "bg-red-100     text-red-700",
};

/* ════════════════════════════════════════════════════════
   MAIN SHELL
═══════════════════════════════════════════════════════ */
export function Admin() {
  const s = useStore();
  const { theme, toggle } = useAdminTheme();
  const [section, setSection] = useState<Section>("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [editProduct, setEditProduct] = useState<EditableProduct | null>(null);
  const [viewOrder, setViewOrder] = useState<string | null>(null);
  const [viewCustomer, setViewCustomer] = useState<string | null>(null);

  if (!s.admin) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-cream px-4 py-16 dark:bg-ink">
        <div className="w-full max-w-md rounded-xl border border-cream bg-white p-8 text-center shadow-md dark:border-white/10 dark:bg-white/5">
          <Icon.shield className="mx-auto h-12 w-12 text-ash" />
          <h2 className="mt-4 font-display text-2xl font-semibold text-ink dark:text-white">Admin Access Required</h2>
          <p className="mt-2 text-sm text-ash">Sign in with your admin credentials to continue.</p>
          <Button variant="dark" className="mt-6 w-full" onClick={() => navigate("/admin-login")}>Sign In as Admin</Button>
          <div className="mt-4 rounded-lg border border-cream bg-cream/60 p-3 text-xs text-ash dark:border-white/10 dark:bg-white/5">
            Demo: <span className="font-mono text-ink dark:text-white">{ADMIN_CREDENTIALS.email}</span> / <span className="font-mono text-ink dark:text-white">{ADMIN_CREDENTIALS.password}</span>
          </div>
        </div>
      </div>
    );
  }

  const currentLabel = sidebarItems.find((i) => i.id === section)?.label ?? "Admin";

  return (
    <div className="flex min-h-screen bg-cream/40 text-ink dark:bg-[#0e0d0b] dark:text-white" style={{ fontFamily: "Montserrat, system-ui, sans-serif" }}>

      {/* ── LEFT SIDEBAR ── */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-56 flex-col border-r border-cream bg-white transition-transform duration-300 dark:border-white/10 dark:bg-[#111111] lg:static lg:translate-x-0",
        drawerOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 border-b border-cream px-5 py-4 dark:border-white/10"
        >
          <span className="font-display text-[17px] font-bold text-ink dark:text-white">G-Smile <span className="text-gold">Signature</span></span>
        </button>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          {sidebarItems.map((item) => {
            const I = Icon[item.icon] || Icon.box;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setSection(item.id); setDrawerOpen(false); }}
                className={cn(
                  "flex w-full items-center gap-3 px-5 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "border-r-2 border-gold bg-gold/10 text-ink dark:text-white"
                    : "text-ink/60 hover:bg-cream/60 hover:text-ink dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-white"
                )}
              >
                <I className={cn("h-4 w-4 shrink-0", active ? "text-gold" : "")} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-cream px-5 py-4 dark:border-white/10">
          <p className="text-[10px] uppercase tracking-widest text-ash">Signed in as</p>
          <p className="mt-0.5 truncate text-sm font-medium text-ink dark:text-white">{s.user?.name ?? "Admin"}</p>
          <button
            onClick={() => { s.adminLogout(); navigate("/"); }}
            className="mt-3 flex w-full items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ash hover:text-gold"
          >
            <Icon.close className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-30 bg-ink/40 lg:hidden" onClick={() => setDrawerOpen(false)} />
      )}

      {/* ── MAIN ── */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* TOP NAV */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-cream bg-white/90 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-[#111111]/90 sm:px-6">
          <button onClick={() => setDrawerOpen(true)} className="lg:hidden text-ink dark:text-white"><Icon.menu className="h-5 w-5" /></button>
          <span className="font-display text-lg font-semibold text-ink dark:text-white">{currentLabel}</span>

          <div className="ml-auto flex items-center gap-2">
            {/* search */}
            <div className="hidden items-center gap-2 border border-cream bg-cream/60 px-3 py-2 sm:flex dark:border-white/10 dark:bg-white/5">
              <Icon.search className="h-4 w-4 text-ash" />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search…"
                className="w-44 bg-transparent text-sm outline-none placeholder:text-ash dark:text-white"
              />
            </div>

            {/* dark/light */}
            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="grid h-9 w-9 place-items-center border border-cream text-ash hover:text-gold dark:border-white/10 dark:text-white/50 dark:hover:text-gold"
            >
              {theme === "light" ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/></svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="5"/><path strokeLinecap="round" d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              )}
            </button>

            <button
              onClick={() => navigate("/")}
              className="hidden items-center gap-1.5 border border-cream px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-ash hover:border-gold hover:text-gold sm:flex dark:border-white/10 dark:text-white/50"
            >
              <Icon.arrowRight className="h-3.5 w-3.5 rotate-180" /> Store
            </button>

            <div className="grid h-9 w-9 place-items-center rounded-full bg-gold font-display text-sm font-bold text-ink">
              {(s.user?.name ?? "A").slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>

        {/* BODY */}
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6">
          {section === "overview"     && <Overview      onNav={setSection} onViewOrder={setViewOrder} />}
          {section === "products"     && <ProductsMgr   search={searchQ} onEdit={setEditProduct} />}
          {section === "categories"   && <CategoriesMgr />}
          {section === "inventory"    && <Inventory />}
          {section === "orders"       && <OrdersMgr     onView={setViewOrder} />}
          {section === "customers"    && <CustomersMgr  onView={setViewCustomer} />}
          {section === "coupons"      && <CouponsMgr />}
          {section === "banners"      && <BannersMgr />}
          {section === "testimonials" && <TestimonialsMgr />}
          {section === "faqs"         && <FaqsMgr />}
          {section === "settings"     && <Settings />}
        </main>
      </div>

      {/* Modals */}
      {editProduct && (
        <ProductEditor product={editProduct} onClose={() => setEditProduct(null)} />
      )}
      {viewOrder && (
        <OrderDetail orderId={viewOrder} onClose={() => setViewOrder(null)} />
      )}
      {viewCustomer && (
        <CustomerProfile customerId={viewCustomer} onClose={() => setViewCustomer(null)} />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SHARED UI ATOMS
═══════════════════════════════════════════════════════ */
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-cream bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]", className)}>
      {children}
    </div>
  );
}

function KpiCard({ label, value, delta }: { label: string; value: string; delta?: string }) {
  return (
    <Card>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-ash">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-ink dark:text-white">{value}</p>
      {delta && <p className="mt-1 text-[11px] font-medium text-green-700 dark:text-green-400">{delta}</p>}
    </Card>
  );
}

function Badge({ status }: { status: string }) {
  return (
    <span className={cn("inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", statusBadge[status] ?? "bg-ash/10 text-ash")}>
      {status}
    </span>
  );
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h2 className="font-display text-xl font-semibold text-ink dark:text-white">{title}</h2>
      {action}
    </div>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-cream dark:border-white/10">
      <table className="w-full text-sm">
        <thead className="border-b border-cream bg-cream/60 dark:border-white/10 dark:bg-white/[0.03]">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-ash">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-cream bg-white dark:divide-white/10 dark:bg-transparent">
          {children}
        </tbody>
      </table>
    </div>
  );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 text-sm text-ink/80 dark:text-white/70", className)}>{children}</td>;
}

function ActionBtn({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn("text-xs font-semibold underline-offset-2 hover:underline", danger ? "text-red-600 dark:text-red-400" : "text-gold")}
    >
      {label}
    </button>
  );
}

/* ════════════════════════════════════════════════════════
   OVERVIEW
═══════════════════════════════════════════════════════ */
function BestSellers() {
  const { products } = useStore();
  const top = useMemo(() => [...products].sort((a, b) => b.popularity - a.popularity).slice(0, 5), [products]);
  return (
    <Card>
      <SectionHeader title="Best Sellers" />
      <div className="space-y-3">
        {top.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3">
            <span className="font-display text-base font-semibold text-ash">{i + 1}</span>
            <img src={p.image} alt="" className="h-10 w-10 rounded object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-ink dark:text-white">{p.name}</p>
              <p className="text-[11px] text-ash">{formatNaira(p.price)}</p>
            </div>
            <span className="text-xs font-semibold text-gold">{p.popularity}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Overview({ onNav, onViewOrder }: { onNav: (s: Section) => void; onViewOrder: (id: string) => void }) {
  const { orders, customers } = useStore();
  const revenue = orders.reduce((x, o) => x + o.total, 0) + 4_280_000;
  const avgOrder = Math.round(revenue / (orders.length + 184));

  const barData = [40, 55, 48, 70, 62, 85, 78, 95, 65, 80, 92, 110];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Revenue"   value={formatNaira(revenue)}                delta="+12.4% this month" />
        <KpiCard label="Total Orders"    value={String(orders.length + 184)}          delta="+8.1%" />
        <KpiCard label="Total Customers" value={String(customers.length + 1240)}      delta="+5.7%" />
        <KpiCard label="Avg Order Value" value={formatNaira(avgOrder)}               delta="+4.2%" />
      </div>

      {/* chart + order status */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display font-semibold text-ink dark:text-white">Revenue — Last 12 Months</h3>
          </div>
          <div className="flex h-48 items-end gap-1.5">
            {barData.map((h, i) => (
              <div key={i} className="group relative flex flex-1 flex-col items-center">
                <div
                  className="w-full rounded-t bg-gold/80 transition-all group-hover:bg-gold"
                  style={{ height: `${h}%` }}
                />
                <span className="mt-1 text-[9px] text-ash">{months[i]}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-display font-semibold text-ink dark:text-white">Order Status</h3>
          <div className="space-y-3">
            {(["Awaiting Payment","Payment Confirmed","Processing","Shipped","Delivered","Cancelled"] as OrderStatus[]).map((st) => {
              const count = orders.filter((o) => o.status === st).length + (st === "Delivered" ? 180 : 10);
              const pct = Math.round((count / 200) * 100);
              return (
                <div key={st}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-ink/70 dark:text-white/60">{st}</span>
                    <span className="font-medium text-ink dark:text-white">{count}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-cream dark:bg-white/10">
                    <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* recent orders + best sellers */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionHeader
            title="Recent Orders"
            action={<button onClick={() => onNav("orders")} className="text-xs font-semibold text-gold hover:underline">View all</button>}
          />
          <Table head={["Order", "Customer", "Amount", "Status", "Date"]}>
            {orders.slice(0, 6).map((o) => (
              <tr key={o.id} className="hover:bg-cream/40 dark:hover:bg-white/[0.03] cursor-pointer" onClick={() => onViewOrder(o.id)}>
                <Td><span className="font-medium text-ink dark:text-white">{o.id}</span></Td>
                <Td>{o.customerName || "Guest"}</Td>
                <Td><span className="font-semibold">{formatNaira(o.total)}</span></Td>
                <Td><Badge status={o.status} /></Td>
                <Td>{o.date}</Td>
              </tr>
            ))}
          </Table>
        </Card>

        <BestSellers />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   PRODUCTS
═══════════════════════════════════════════════════════ */
function ProductsMgr({ search, onEdit }: { search: string; onEdit: (p: EditableProduct) => void }) {
  const { products, categories, deleteProduct, toast } = useStore();
  const [catFilter, setCatFilter] = useState("all");

  const filtered = useMemo(() => {
    let list = [...products];
    if (catFilter !== "all") list = list.filter((p) => p.category === catFilter);
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [products, catFilter, search]);

  const blank: EditableProduct = {
    id: "", name: "", price: 0, category: categories[0]?.slug ?? "handbags",
    brand: "G-Smile Signature", colors: ["Black"], materials: ["Genuine Leather"],
    sizes: ["One Size"], image: "/images/product-1.jpg", gallery: ["/images/product-1.jpg"],
    rating: 5, reviews: 0, stock: 10, popularity: 70, sku: "",
    lowStockThreshold: 5, tags: [], variants: [],
    description: "", features: [], specs: {},
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        title="All Products"
        action={
          <Button variant="gold" size="sm" onClick={() => onEdit(blank)}>
            <Icon.plus className="h-4 w-4" /> Add Product
          </Button>
        }
      />

      {/* filters */}
      <div className="flex flex-wrap gap-2">
        {[{ slug: "all", name: "All" }, ...categories].map((c) => (
          <button
            key={c.slug}
            onClick={() => setCatFilter(c.slug)}
            className={cn(
              "border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors",
              catFilter === c.slug
                ? "border-gold bg-gold text-ink"
                : "border-cream bg-white text-ash hover:border-gold hover:text-gold dark:border-white/10 dark:bg-transparent dark:text-white/50"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      <Table head={["Product", "SKU", "Category", "Price", "Stock", "Tags", ""]}>
        {filtered.map((p) => (
          <tr key={p.id} className="hover:bg-cream/40 dark:hover:bg-white/[0.03]">
            <Td>
              <div className="flex items-center gap-3">
                <img src={p.image} alt="" className="h-10 w-10 rounded object-cover" />
                <div>
                  <p className="font-medium text-ink dark:text-white">{p.name}</p>
                  {p.badge && <p className="mt-0.5 inline-block rounded bg-gold/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-gold">{p.badge}</p>}
                </div>
              </div>
            </Td>
            <Td className="font-mono text-[11px] text-ash">{p.sku}</Td>
            <Td>{categories.find((c) => c.slug === p.category)?.name ?? p.category}</Td>
            <Td><span className="font-semibold">{formatNaira(p.price)}</span></Td>
            <Td>
              <span className={cn("rounded px-2 py-0.5 text-[10px] font-semibold",
                p.stock === 0 ? "bg-red-100 text-red-700" : p.stock < p.lowStockThreshold ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
              )}>
                {p.stock === 0 ? "Out" : p.stock < p.lowStockThreshold ? `Low (${p.stock})` : p.stock}
              </span>
            </Td>
            <Td>
              <div className="flex flex-wrap gap-1">
                {p.tags.length > 0 ? p.tags.slice(0, 2).map((t) => (
                  <span key={t} className="rounded bg-gold/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-gold">{t}</span>
                )) : <span className="text-[10px] text-ash">—</span>}
                {p.tags.length > 2 && <span className="text-[10px] text-ash">+{p.tags.length - 2}</span>}
              </div>
            </Td>
            <Td>
              <div className="flex gap-3">
                <ActionBtn label="Edit" onClick={() => onEdit(p)} />
                <ActionBtn label="Delete" danger onClick={() => { if (confirm(`Delete "${p.name}"?`)) { deleteProduct(p.id); toast("Product deleted"); } }} />
              </div>
            </Td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

/* Product editor modal */
const ALL_TAGS: ProductTag[] = ["Bestseller", "New", "Limited", "Corporate Pick", "Trending", "Exclusive", "Editor's Pick"];

function ProductEditor({ product, onClose }: { product: EditableProduct; onClose: () => void }) {
  const { categories, upsertProduct } = useStore();
  const [p, setP] = useState<EditableProduct>(() => {
    const init: EditableProduct = { ...product };
    if (!init.sku) init.sku = `GS-${(init.id || Date.now().toString()).slice(0, 6).toUpperCase()}`;
    if (init.lowStockThreshold === undefined) init.lowStockThreshold = 5;
    if (!init.tags) init.tags = [];
    if (!init.variants) init.variants = [];
    return init;
  });
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "images" | "variants" | "tags">("general");
  const gallery = p.gallery?.length ? p.gallery : p.image ? [p.image] : [];
  const set = <K extends keyof EditableProduct>(k: K, v: EditableProduct[K]) => setP((x) => ({ ...x, [k]: v }));

  /* ── Stock status helper ── */
  const stockStatus: { label: string; color: string } =
    p.stock === 0 ? { label: "Out of Stock", color: "text-red-600" } :
    p.stock < (p.lowStockThreshold ?? 5) ? { label: "Low Stock", color: "text-amber-600" } :
    { label: "In Stock", color: "text-green-600" };

  /* ── Image upload (auto-compress) ── */
  const handleImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const uploaded = await Promise.all(files.map((file) => uploadImageToCloudinary(file, { maxWidth: 1400, quality: 0.72, folder: "g-smile-signature/products" })));
    const next = [...gallery, ...uploaded];
    setP((x) => ({ ...x, gallery: next, image: next[0] }));
    setUploading(false);
  };

  const removeImg = (i: number) => {
    const next = gallery.filter((_, idx) => idx !== i);
    setP((x) => ({ ...x, gallery: next, image: next[0] ?? "" }));
  };

  const moveImage = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= gallery.length) return;
    const next = [...gallery];
    [next[i], next[j]] = [next[j], next[i]];
    setP((x) => ({ ...x, gallery: next, image: next[0] }));
  };

  const setMainImage = (i: number) => {
    if (i === 0) return;
    const next = [gallery[i], ...gallery.filter((_, idx) => idx !== i)];
    setP((x) => ({ ...x, gallery: next, image: next[0] }));
  };

  /* ── Tags ── */
  const toggleTag = (t: ProductTag) => {
    setP((x) => ({ ...x, tags: x.tags.includes(t) ? x.tags.filter((y) => y !== t) : [...x.tags, t] }));
  };

  /* ── Variants ── */
  const addVariant = () => {
    setP((x) => ({
      ...x,
      variants: [
        ...x.variants,
        {
          id: `v-${Date.now()}`,
          color: x.colors[0] ?? "Black",
          material: x.materials[0] ?? "Genuine Leather",
          size: x.sizes[0] ?? "One Size",
          stock: 0,
          sku: `${x.sku || "GS"}-V${x.variants.length + 1}`,
        },
      ],
    }));
  };
  const updateVariant = (id: string, k: keyof ProductVariant, v: string | number) => {
    setP((x) => ({ ...x, variants: x.variants.map((v2) => (v2.id === id ? { ...v2, [k]: v } : v2)) }));
  };
  const removeVariant = (id: string) => {
    setP((x) => ({ ...x, variants: x.variants.filter((v) => v.id !== id) }));
  };
  const totalVariantStock = p.variants.reduce((s, v) => s + (v.stock || 0), 0);
  const syncTotalStockFromVariants = () => {
    setP((x) => ({ ...x, stock: x.variants.reduce((s, v) => s + (v.stock || 0), 0) }));
  };

  const save = () => {
    if (!p.name || p.price <= 0) return alert("Name and price are required.");
    const final = { ...p, id: p.id || `p-${Date.now()}` };
    // auto-sync badge to first tag if no badge set
    if (!final.badge && final.tags.length > 0) final.badge = final.tags[0];
    upsertProduct(final);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 p-4">
      <div className="my-8 w-full max-w-3xl rounded-xl bg-white shadow-2xl dark:bg-[#111111]">
        <div className="flex items-center justify-between border-b border-cream px-6 py-4 dark:border-white/10">
          <div>
            <h3 className="font-display text-xl font-semibold text-ink dark:text-white">{p.id ? "Edit" : "Add"} Product</h3>
            <p className="text-[11px] text-ash">SKU: <span className="font-mono">{p.sku}</span></p>
          </div>
          <button onClick={onClose}><Icon.close className="h-5 w-5 text-ash hover:text-ink dark:hover:text-white" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-cream dark:border-white/10">
          {(["general", "images", "variants", "tags"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={cn(
                "px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-colors",
                activeTab === t ? "border-b-2 border-gold text-gold" : "text-ash hover:text-ink dark:hover:text-white"
              )}
            >
              {t === "general" ? "General" : t === "images" ? "Images" : t === "variants" ? "Variants" : "Tags"}
            </button>
          ))}
        </div>

        {/* GENERAL */}
        {activeTab === "general" && (
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <div className="sm:col-span-2"><Input label="Product Name" value={p.name} onChange={(v) => set("name", v)} /></div>
            <Input label="SKU" value={p.sku} onChange={(v) => set("sku", v)} />
            <div>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ash">Category</span>
                <select value={p.category} onChange={(e) => set("category", e.target.value)} className="w-full border border-cream bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white">
                  {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </label>
            </div>
            <Input label="Price (₦)" type="number" value={String(p.price)} onChange={(v) => set("price", +v)} />
            <Input label="Old Price (₦) — Optional" type="number" value={String(p.oldPrice ?? "")} onChange={(v) => set("oldPrice", +v || undefined)} />
            <div>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ash">Stock Quantity</span>
                <input type="number" value={p.stock} onChange={(e) => set("stock", +e.target.value)} className="w-full border border-cream bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white" />
              </label>
              <p className={cn("mt-1 text-[11px] font-semibold uppercase", stockStatus.color)}>
                {stockStatus.label}
              </p>
            </div>
            <div>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ash">Low Stock Alert Threshold</span>
                <input type="number" value={p.lowStockThreshold} onChange={(e) => set("lowStockThreshold", +e.target.value)} className="w-full border border-cream bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white" />
                <p className="mt-1 text-[11px] text-ash">Alert when stock falls below this number</p>
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ash">Description</span>
                <textarea value={p.description} onChange={(e) => set("description", e.target.value)} rows={3} className="w-full border border-cream bg-white px-4 py-3 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white" />
              </label>
            </div>
            <Input label="Brand" value={p.brand} onChange={(v) => set("brand", v)} />
            <Input label="Badge (auto-set by first tag if empty)" value={p.badge ?? ""} onChange={(v) => set("badge", v || undefined)} />
          </div>
        )}

        {/* IMAGES */}
        {activeTab === "images" && (
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ash">Product Gallery</p>
                <p className="text-xs text-ash">Upload, reorder, and set your main image. First image is used as the cover.</p>
              </div>
              <label className="cursor-pointer">
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
                <span className="inline-flex items-center gap-2 border border-cream bg-cream/60 px-4 py-2 text-sm font-semibold text-ink hover:border-gold hover:text-gold dark:border-white/10 dark:bg-white/5 dark:text-white">
                  <Icon.plus className="h-4 w-4" /> {uploading ? (cloudinaryEnabled ? "Uploading to CDN…" : "Compressing…") : "Upload Images"}
                </span>
              </label>
            </div>
            {gallery.length > 0 ? (
              <div className="space-y-3">
                {gallery.map((img, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-cream p-3 dark:border-white/10">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-[10px] font-bold text-white">{i + 1}</span>
                    <img src={img} alt="" className="h-16 w-16 rounded object-cover" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-ink dark:text-white">Image {i + 1}{i === 0 && " · Cover"}</p>
                      <p className="text-[10px] text-ash">{img.startsWith("data:") ? "Uploaded" : "URL"}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {i > 0 && (
                        <button onClick={() => moveImage(i, -1)} className="grid h-8 w-8 place-items-center rounded border border-cream hover:bg-cream dark:border-white/10 dark:hover:bg-white/5" title="Move left">
                          <Icon.chevron className="h-3.5 w-3.5 rotate-180" />
                        </button>
                      )}
                      {i < gallery.length - 1 && (
                        <button onClick={() => moveImage(i, 1)} className="grid h-8 w-8 place-items-center rounded border border-cream hover:bg-cream dark:border-white/10 dark:hover:bg-white/5" title="Move right">
                          <Icon.chevron className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {i !== 0 && (
                        <button onClick={() => setMainImage(i)} className="rounded border border-gold/40 px-2 py-1 text-[10px] font-semibold uppercase text-gold hover:bg-gold/10">Set Main</button>
                      )}
                      <button onClick={() => removeImg(i)} className="grid h-8 w-8 place-items-center rounded border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/20">
                        <Icon.trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-cream py-10 text-center text-sm text-ash dark:border-white/10">
                No images yet. Click "Upload Images" to add.
              </div>
            )}
          </div>
        )}

        {/* VARIANTS */}
        {activeTab === "variants" && (
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ash">Variant Inventory</p>
                <p className="text-xs text-ash">Color / Material / Size combinations with per-variant stock. Total variants: {p.variants.length} · Total stock: {totalVariantStock}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={syncTotalStockFromVariants}>Sync Total Stock</Button>
                <Button variant="gold" size="sm" onClick={addVariant}><Icon.plus className="h-4 w-4" /> Add Variant</Button>
              </div>
            </div>
            {p.variants.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-cream py-10 text-center text-sm text-ash dark:border-white/10">
                No variants yet. Click "Add Variant" to track per-color, per-size stock.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-cream dark:border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-cream/40 text-left text-[10px] uppercase tracking-wider text-ash dark:bg-white/5">
                    <tr><th className="px-3 py-2">SKU</th><th className="px-3 py-2">Color</th><th className="px-3 py-2">Material</th><th className="px-3 py-2">Size</th><th className="px-3 py-2">Stock</th><th className="px-3 py-2 text-right">Remove</th></tr>
                  </thead>
                  <tbody className="divide-y divide-cream dark:divide-white/10">
                    {p.variants.map((v) => (
                      <tr key={v.id}>
                        <td className="px-3 py-2"><input value={v.sku} onChange={(e) => updateVariant(v.id, "sku", e.target.value)} className="w-32 border border-cream bg-white px-2 py-1 text-xs font-mono outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white" /></td>
                        <td className="px-3 py-2"><input value={v.color} onChange={(e) => updateVariant(v.id, "color", e.target.value)} className="w-24 border border-cream bg-white px-2 py-1 text-xs outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white" /></td>
                        <td className="px-3 py-2"><input value={v.material} onChange={(e) => updateVariant(v.id, "material", e.target.value)} className="w-32 border border-cream bg-white px-2 py-1 text-xs outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white" /></td>
                        <td className="px-3 py-2"><input value={v.size} onChange={(e) => updateVariant(v.id, "size", e.target.value)} className="w-24 border border-cream bg-white px-2 py-1 text-xs outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white" /></td>
                        <td className="px-3 py-2"><input type="number" value={v.stock} onChange={(e) => updateVariant(v.id, "stock", +e.target.value)} className="w-20 border border-cream bg-white px-2 py-1 text-xs outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white" /></td>
                        <td className="px-3 py-2 text-right">
                          <button onClick={() => removeVariant(v.id)} className="text-red-500 hover:text-red-700"><Icon.trash className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAGS */}
        {activeTab === "tags" && (
          <div className="p-6">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-ash">Product Tags</p>
            <p className="mb-4 text-xs text-ash">Select the tags that apply to this product. The first tag is used as the badge.</p>
            <div className="flex flex-wrap gap-2">
              {ALL_TAGS.map((t) => {
                const active = p.tags.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleTag(t)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
                      active ? "border-gold bg-gold text-ink" : "border-cream bg-white text-ink hover:border-gold hover:text-gold dark:border-white/10 dark:bg-transparent dark:text-white/50"
                    )}
                  >
                    {active && <Icon.check className="mr-1 inline h-3.5 w-3.5" />}
                    {t}
                  </button>
                );
              })}
            </div>
            {p.tags.length > 0 && (
              <p className="mt-4 text-xs text-ash">Selected: <span className="font-medium text-ink dark:text-white">{p.tags.join(" · ")}</span></p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-cream px-6 py-4 dark:border-white/10">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="gold" size="sm" onClick={save}>{p.id ? "Save Changes" : "Add Product"}</Button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   CATEGORIES
═══════════════════════════════════════════════════════ */
function CategoriesMgr() {
  const { categories, products, upsertCategory, deleteCategory, toast } = useStore();
  const [edit, setEdit] = useState<EditableCategory | null>(null);
  const [categoryUploading, setCategoryUploading] = useState(false);

  const handleCategoryImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !edit) return;
    setCategoryUploading(true);
    const uploaded = await uploadImageToCloudinary(file, { maxWidth: 1000, quality: 0.72, folder: "g-smile-signature/categories" });
    setEdit({ ...edit, image: uploaded });
    setCategoryUploading(false);
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Categories"
        action={
          <Button variant="gold" size="sm" onClick={() => setEdit({ slug: "", name: "", blurb: "", image: "/images/product-1.jpg" })}>
            <Icon.plus className="h-4 w-4" /> Add Category
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Card key={c.slug}>
            <img src={optimizeImageUrl(c.image, { width: 600 })} alt="" loading="lazy" decoding="async" className="h-32 w-full rounded object-cover" />
            <p className="mt-3 font-display text-lg font-semibold text-ink dark:text-white">{c.name}</p>
            <p className="text-xs text-ash">{c.blurb}</p>
            <p className="mt-1 text-[11px] text-ash">{products.filter((p) => p.category === c.slug).length} products</p>
            <div className="mt-3 flex gap-3">
              <ActionBtn label="Edit" onClick={() => setEdit(c)} />
              <ActionBtn label="Delete" danger onClick={() => { if (confirm(`Delete "${c.name}"?`)) { deleteCategory(c.slug); toast("Category deleted"); } }} />
            </div>
          </Card>
        ))}
      </div>

      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-[#111111]">
            <div className="flex items-center justify-between border-b border-cream px-6 py-4 dark:border-white/10">
              <h3 className="font-display text-xl font-semibold text-ink dark:text-white">{edit.slug ? "Edit" : "Add"} Category</h3>
              <button onClick={() => setEdit(null)}><Icon.close className="h-5 w-5 text-ash" /></button>
            </div>
            <div className="space-y-3 p-6">
              <Input label="Name" value={edit.name} onChange={(v) => setEdit({ ...edit, name: v, slug: edit.slug || v.toLowerCase().replace(/\s+/g, "-") })} />
              <Input label="Slug" value={edit.slug} onChange={(v) => setEdit({ ...edit, slug: v })} />
              <Input label="Blurb" value={edit.blurb} onChange={(v) => setEdit({ ...edit, blurb: v })} />
              <Input label="Image URL" value={edit.image} onChange={(v) => setEdit({ ...edit, image: v })} />
              <div>
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleCategoryImage} />
                  <span className="inline-flex items-center gap-2 border border-cream bg-cream/60 px-4 py-2 text-sm font-semibold text-ink hover:border-gold hover:text-gold dark:border-white/10 dark:bg-white/5 dark:text-white">
                    <Icon.plus className="h-4 w-4" /> {categoryUploading ? (cloudinaryEnabled ? "Uploading to CDN…" : "Compressing…") : "Upload Category Image"}
                  </span>
                </label>
                {edit.image && <img src={optimizeImageUrl(edit.image, { width: 300 })} alt="Category preview" className="mt-3 h-24 w-full rounded object-cover" />}
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-cream px-6 py-4 dark:border-white/10">
              <Button variant="outline" size="sm" onClick={() => setEdit(null)}>Cancel</Button>
              <Button variant="gold" size="sm" onClick={() => { if (edit.name && edit.slug) { upsertCategory(edit); setEdit(null); } }}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   INVENTORY
═══════════════════════════════════════════════════════ */
function Inventory() {
  const { products, upsertProduct, toast } = useStore();
  const [editStock, setEditStock] = useState<{ id: string; val: number } | null>(null);

  const lowStock = products.filter((p) => p.stock < p.lowStockThreshold && p.stock > 0).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const inStock = products.filter((p) => p.stock >= p.lowStockThreshold).length;
  const totalVariants = products.reduce((s, p) => s + p.variants.length, 0);

  return (
    <div className="space-y-4">
      <SectionHeader title="Inventory" />
      <div className="grid gap-4 sm:grid-cols-4">
        <KpiCard label="Total Stock" value={String(products.reduce((s, p) => s + p.stock, 0))} />
        <KpiCard label="In Stock" value={String(inStock)} />
        <KpiCard label="Low Stock" value={String(lowStock)} />
        <KpiCard label="Out of Stock" value={String(outOfStock)} />
      </div>
      {totalVariants > 0 && (
        <p className="text-xs text-ash">Tracking <span className="font-semibold text-ink dark:text-white">{totalVariants}</span> product variants across all sizes/colors.</p>
      )}
      <Table head={["Product", "SKU", "Stock", "Threshold", "Status", "Variants", ""]}>
        {products.map((p) => (
          <tr key={p.id} className="hover:bg-cream/40 dark:hover:bg-white/[0.03]">
            <Td>
              <div className="flex items-center gap-3">
                <img src={p.image} alt="" className="h-8 w-8 rounded object-cover" />
                <div>
                  <p className="font-medium text-ink dark:text-white">{p.name}</p>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {p.tags.slice(0, 2).map((t) => <span key={t} className="rounded bg-gold/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-gold">{t}</span>)}
                  </div>
                </div>
              </div>
            </Td>
            <Td className="font-mono text-xs">{p.sku}</Td>
            <Td>
              {editStock?.id === p.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editStock.val}
                    onChange={(e) => setEditStock({ ...editStock, val: +e.target.value })}
                    className="w-20 border border-gold px-2 py-1 text-sm outline-none"
                  />
                  <button
                    onClick={() => { upsertProduct({ ...p, stock: editStock.val }); setEditStock(null); toast("Stock updated"); }}
                    className="text-xs font-semibold text-gold hover:underline"
                  >Save</button>
                  <button onClick={() => setEditStock(null)} className="text-xs text-ash hover:underline">Cancel</button>
                </div>
              ) : (
                <span className="font-medium text-ink dark:text-white">{p.stock}</span>
              )}
            </Td>
            <Td>{p.lowStockThreshold}</Td>
            <Td>
              <span className={cn("rounded px-2 py-0.5 text-[10px] font-semibold",
                p.stock === 0 ? "bg-red-100 text-red-700" : p.stock < p.lowStockThreshold ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
              )}>
                {p.stock === 0 ? "Out of Stock" : p.stock < p.lowStockThreshold ? "Low Stock" : "In Stock"}
              </span>
            </Td>
            <Td>{p.variants.length > 0 ? <span className="text-xs font-semibold text-ink dark:text-white">{p.variants.length} variants</span> : <span className="text-xs text-ash">—</span>}</Td>
            <Td>
              <ActionBtn label="Update" onClick={() => setEditStock({ id: p.id, val: p.stock })} />
            </Td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   ORDERS
═══════════════════════════════════════════════════════ */
function OrdersMgr({ onView }: { onView: (id: string) => void }) {
  const { orders, updateOrderStatus, confirmPayment } = useStore();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const statuses = ["all", "Awaiting Payment", "Payment Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];
  const list = orders.filter((o) => statusFilter === "all" || o.status === statusFilter);

  return (
    <div className="space-y-4">
      <SectionHeader title="Orders" />
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={cn(
              "border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors",
              statusFilter === s ? "border-gold bg-gold text-ink" : "border-cream bg-white text-ash hover:border-gold hover:text-gold dark:border-white/10 dark:bg-transparent dark:text-white/50"
            )}
          >
            {s === "all" ? "All" : s} ({s === "all" ? orders.length : orders.filter((o) => o.status === s).length})
          </button>
        ))}
      </div>
      <Table head={["Order ID", "Customer", "Amount", "Proof", "Status", "Date", "Actions"]}>
        {list.map((o) => (
          <tr key={o.id} className="hover:bg-cream/40 dark:hover:bg-white/[0.03]">
            <Td><span className="font-medium text-ink dark:text-white">{o.id}</span></Td>
            <Td>
              <p className="font-medium text-ink dark:text-white">{o.customerName || "Guest"}</p>
              <p className="text-[11px] text-ash">{o.customerEmail}</p>
              <p className="text-[11px] text-ash">{o.customerPhone}</p>
            </Td>
            <Td><span className="font-semibold">{formatNaira(o.total)}</span></Td>
            <Td>
              {o.paymentProof ? (
                <a href={o.paymentProof} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:underline">
                  <Icon.check className="h-3 w-3" /> View Proof
                </a>
              ) : (
                <span className="text-[11px] text-ash">No proof</span>
              )}
            </Td>
            <Td>
              <select
                value={o.status}
                onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                className="border-0 bg-transparent p-0 text-[10px] font-semibold uppercase text-ink outline-none dark:text-white"
              >
                {["Awaiting Payment","Payment Confirmed","Processing","Shipped","Delivered","Cancelled"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </Td>
            <Td>{o.date}</Td>
            <Td>
              <div className="flex flex-col gap-1.5">
                <ActionBtn label="View" onClick={() => onView(o.id)} />
                {o.status === "Awaiting Payment" && o.paymentProof && (
                  <button
                    onClick={() => confirmPayment(o.id)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-green-700 hover:underline"
                  >
                    <Icon.check className="h-3 w-3" /> Confirm Payment
                  </button>
                )}
                <a
                  href={`https://wa.me/${o.customerPhone?.replace(/\s+/g, "").replace("+", "")}?text=${encodeURIComponent(`Hello ${o.customerName}, regarding your order ${o.id} (${formatNaira(o.total)})...`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#25D366] hover:text-[#128C7E] hover:underline"
                >
                  <Icon.whatsapp className="h-3 w-3" /> WhatsApp
                </a>
              </div>
            </Td>
          </tr>
        ))}
        {list.length === 0 && (
          <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-ash">No orders found.</td></tr>
        )}
      </Table>
    </div>
  );
}

function OrderDetail({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const { orders, updateOrderStatus, confirmPayment, updateOrderAdminNotes, updateOrderTrackingNumber, generateOrderInvoice } = useStore();
  const order = orders.find((o) => o.id === orderId);
  const [notes, setNotes] = useState(order?.adminNotes || "");
  const [trackingNum, setTrackingNum] = useState(order?.trackingNumber || "");

  if (!order) return null;

  /* ── Print handler ── */
  const handlePrint = () => {
    const printContent = document.getElementById(`invoice-print-area-${order.id}`);
    const originalContent = document.body.innerHTML;
    if (printContent) {
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload(); // reload to rebind react state
    }
  };

  /* ── WhatsApp Update Templates ── */
  const getWhatsAppMsg = () => {
    let msg = `Hello ${order.customerName},\n\nThis is G-Smile Signature updating you on order ${order.id}.\n\n`;
    msg += `Status: *${order.status}*\n`;
    if (order.status === "Awaiting Payment") {
      msg += `Please complete your bank transfer of *${formatNaira(order.total)}* so we can process your order.`;
    } else if (order.status === "Processing") {
      msg += `Your payment of *${formatNaira(order.total)}* is confirmed! We are currently prepping your bag.`;
    } else if (order.status === "Shipped") {
      msg += `Your order has been shipped! 🚀\n`;
      if (order.trackingNumber) msg += `Tracking Number: *${order.trackingNumber}*`;
    } else if (order.status === "Delivered") {
      msg += `Your luxury bag has been delivered! We hope you love your G-Smile Signature piece. ❤️`;
    }
    if (order.adminNotes) {
      msg += `\n\nNotes from our team: _${order.adminNotes}_`;
    }
    msg += `\n\nThank you for choosing G-Smile Signature!`;
    return encodeURIComponent(msg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 p-4">
      <div className="my-8 w-full max-w-2xl rounded-xl bg-white shadow-2xl dark:bg-[#111111]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cream px-6 py-4 dark:border-white/10">
          <div>
            <h3 className="font-display text-xl font-semibold text-ink dark:text-white">{order.id}</h3>
            <p className="text-xs text-ash">{order.date}</p>
          </div>
          <button onClick={onClose}><Icon.close className="h-5 w-5 text-ash" /></button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Status Alert */}
          <div className={cn("rounded-lg px-4 py-3 text-sm flex justify-between items-center", statusBadge[order.status] || "bg-cream")}>
            <span>Status: <span className="font-bold uppercase tracking-wider">{order.status}</span></span>
            {order.status === "Awaiting Payment" && (
              <button
                onClick={() => confirmPayment(order.id)}
                className="flex items-center gap-1.5 rounded bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
              >
                <Icon.check className="h-3 w-3" /> Confirm Payment
              </button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-cream/40 p-4 dark:bg-white/5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ash">Customer</p>
              <p className="mt-1 font-medium text-ink dark:text-white">{order.customerName || "Guest"}</p>
              <p className="text-xs text-ash">{order.customerEmail}</p>
              <p className="text-xs text-ash">{order.customerPhone}</p>
            </div>
            <div className="rounded-lg bg-cream/40 p-4 dark:bg-white/5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ash">Shipping Address</p>
              <p className="mt-1 font-medium text-ink dark:text-white">{order.shipping.address}</p>
              <p className="text-xs text-ash">{order.shipping.city}, {order.shipping.state}</p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ash">Items</p>
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-cream p-3 dark:border-white/10">
                <img src={item.image} alt="" className="h-10 w-10 rounded object-cover" />
                <p className="flex-1 text-sm font-medium text-ink dark:text-white">{item.name}</p>
                <p className="text-xs text-ash">×{item.qty}</p>
                <p className="text-sm font-semibold">{formatNaira(item.price)}</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1.5 border-t border-cream pt-3 text-sm dark:border-white/10">
            <div className="flex justify-between text-ash"><span>Subtotal</span><span>{formatNaira(order.subtotal)}</span></div>
            <div className="flex justify-between text-ash"><span>Shipping</span><span>{formatNaira(order.shippingCost)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>-{formatNaira(order.discount)}</span></div>}
            <div className="flex justify-between border-t border-cream pt-2 font-display text-lg font-semibold dark:border-white/10">
              <span className="text-ink dark:text-white">Total</span><span className="text-gold">{formatNaira(order.total)}</span>
            </div>
          </div>

          {/* Operational Fields: Tracking & Notes */}
          <div className="grid gap-4 border-t border-cream pt-4 sm:grid-cols-2 dark:border-white/10">
            {/* Tracking Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-ash">Delivery Tracking Number</label>
              <div className="flex gap-2">
                <input
                  value={trackingNum}
                  onChange={(e) => setTrackingNum(e.target.value)}
                  placeholder="e.g. GIG-123456"
                  className="flex-1 border border-cream bg-white px-3 py-2 text-sm outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
                <button
                  onClick={() => updateOrderTrackingNumber(order.id, trackingNum)}
                  className="rounded bg-gold px-3 text-xs font-semibold uppercase tracking-wider text-ink"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-ash">Admin Order Notes (Internal & WhatsApp)</label>
              <div className="flex gap-2">
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Wrap with premium dust bag"
                  className="flex-1 border border-cream bg-white px-3 py-2 text-sm outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
                <button
                  onClick={() => updateOrderAdminNotes(order.id, notes)}
                  className="rounded bg-gold px-3 text-xs font-semibold uppercase tracking-wider text-ink"
                >
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Invoice Generation & Printable Receipt */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-cream pt-4 dark:border-white/10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ash">Invoice Management</p>
              {order.invoiceNumber ? (
                <p className="mt-1 text-sm font-medium text-ink dark:text-white">
                  Invoice Generated: <span className="font-mono text-gold">{order.invoiceNumber}</span> ({order.invoiceGeneratedAt})
                </p>
              ) : (
                <p className="mt-1 text-xs text-ash">No invoice generated yet.</p>
              )}
            </div>
            <div className="flex gap-2">
              {!order.invoiceNumber ? (
                <Button variant="outline" size="sm" onClick={() => generateOrderInvoice(order.id)}>Generate Invoice</Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handlePrint}>Print Invoice</Button>
              )}
              <Button variant="outline" size="sm" onClick={handlePrint}>Print Receipt</Button>
            </div>
          </div>

          {/* Payment Proof Viewing */}
          {order.paymentProof && (
            <div className="rounded-lg border border-cream bg-cream/40 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ash">Customer Uploaded Payment Proof</p>
              <a href={order.paymentProof} target="_blank" rel="noreferrer">
                <img src={order.paymentProof} alt="Payment proof" className="mt-2 h-44 w-auto rounded-lg border border-cream object-contain hover:opacity-90" />
              </a>
            </div>
          )}

          {/* Status Selector & WhatsApp update */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-cream pt-4 dark:border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-ink dark:text-white">Change Status:</span>
              <select
                value={order.status}
                onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                className="border border-cream bg-white px-3 py-2 text-sm outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                {["Awaiting Payment","Payment Confirmed","Processing","Shipped","Delivered","Cancelled"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <a
              href={`https://wa.me/${order.customerPhone?.replace(/\s+/g, "").replace("+", "")}?text=${getWhatsAppMsg()}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded bg-[#25D366] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1fa855]"
            >
              <Icon.whatsapp className="h-4.5 w-4.5" /> Send Status Update on WhatsApp
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-cream px-6 py-4 dark:border-white/10">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>

      {/* ── HIDDEN PRINTABLE INVOICE / RECEIPT ── */}
      <div id={`invoice-print-area-${order.id}`} className="hidden">
        <div style={{ padding: "40px", fontFamily: "Montserrat, sans-serif", color: "#111111", backgroundColor: "#ffffff", maxWidth: "800px", margin: "0 auto" }}>
          
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "between", alignItems: "flex-start", borderBottom: "2px solid #F6F2E8", paddingBottom: "20px" }}>
            <div>
              <h1 style={{ fontSize: "28px", margin: 0, fontFamily: "Playfair Display, serif", fontWeight: "bold" }}>G-Smile <span style={{ color: "#D4A24A" }}>Signature</span></h1>
              <p style={{ fontSize: "12px", color: "#b7b7b7", margin: "5px 0 0 0", letterSpacing: "2px" }}>PREMIUM LUXURY BAGS</p>
              <p style={{ fontSize: "13px", color: "#666", margin: "15px 0 0 0" }}>gsmilebags@gmail.com · +234 806 565 3384 · Lagos, Nigeria</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <h2 style={{ fontSize: "22px", margin: 0, textTransform: "uppercase" }}>
                {order.invoiceNumber ? "Invoice" : "Order Receipt"}
              </h2>
              <p style={{ fontSize: "14px", margin: "5px 0 0 0" }}>ID: <strong>{order.id}</strong></p>
              {order.invoiceNumber && <p style={{ fontSize: "14px", margin: "5px 0 0 0" }}>Invoice: <strong>{order.invoiceNumber}</strong></p>}
              <p style={{ fontSize: "13px", color: "#666", margin: "5px 0 0 0" }}>Date: {order.date}</p>
            </div>
          </div>

          {/* Details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "30px" }}>
            <div style={{ backgroundColor: "#F6F2E8", padding: "15px", borderRadius: "8px" }}>
              <h3 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", margin: 0, color: "#666" }}>Bill To:</h3>
              <p style={{ fontSize: "15px", fontWeight: "bold", margin: "8px 0 0 0" }}>{order.customerName}</p>
              <p style={{ fontSize: "13px", color: "#444", margin: "4px 0 0 0" }}>{order.customerEmail}</p>
              <p style={{ fontSize: "13px", color: "#444", margin: "4px 0 0 0" }}>{order.customerPhone}</p>
            </div>
            <div style={{ backgroundColor: "#F6F2E8", padding: "15px", borderRadius: "8px" }}>
              <h3 style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", margin: 0, color: "#666" }}>Ship To:</h3>
              <p style={{ fontSize: "13px", color: "#444", margin: "8px 0 0 0" }}>{order.shipping.address}</p>
              <p style={{ fontSize: "13px", color: "#444", margin: "4px 0 0 0" }}>{order.shipping.city}, {order.shipping.state}</p>
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "30px", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #F6F2E8", textAlign: "left" }}>
                <th style={{ padding: "10px 5px", textTransform: "uppercase", fontSize: "11px", color: "#666" }}>Item</th>
                <th style={{ padding: "10px 5px", textTransform: "uppercase", fontSize: "11px", color: "#666", textAlign: "center" }}>Qty</th>
                <th style={{ padding: "10px 5px", textTransform: "uppercase", fontSize: "11px", color: "#666", textAlign: "right" }}>Price</th>
                <th style={{ padding: "10px 5px", textTransform: "uppercase", fontSize: "11px", color: "#666", textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #F6F2E8" }}>
                  <td style={{ padding: "12px 5px", fontWeight: "medium" }}>{item.name}</td>
                  <td style={{ padding: "12px 5px", textAlign: "center" }}>{item.qty}</td>
                  <td style={{ padding: "12px 5px", textAlign: "right" }}>{formatNaira(item.price)}</td>
                  <td style={{ padding: "12px 5px", textAlign: "right", fontWeight: "bold" }}>{formatNaira(item.price * item.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
            <div style={{ width: "250px", fontSize: "14px", lineHeight: "2" }}>
              <div style={{ display: "flex", justifyContent: "between" }}>
                <span style={{ color: "#666" }}>Subtotal:</span>
                <span style={{ fontWeight: "bold", marginLeft: "auto" }}>{formatNaira(order.subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "between" }}>
                <span style={{ color: "#666" }}>Shipping:</span>
                <span style={{ fontWeight: "bold", marginLeft: "auto" }}>{formatNaira(order.shippingCost)}</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: "flex", justifyContent: "between", color: "green" }}>
                  <span>Discount:</span>
                  <span style={{ fontWeight: "bold", marginLeft: "auto" }}>-{formatNaira(order.discount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "between", borderTop: "2px solid #F6F2E8", paddingTop: "8px", marginTop: "8px", fontSize: "16px", fontWeight: "bold" }}>
                <span>Total Amount:</span>
                <span style={{ color: "#D4A24A", marginLeft: "auto" }}>{formatNaira(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div style={{ borderTop: "1px solid #F6F2E8", marginTop: "50px", paddingTop: "20px", textAlign: "center", fontSize: "12px", color: "#666" }}>
            <p style={{ fontWeight: "bold" }}>Thank you for your patronage! Your elegance is our signature.</p>
            <p style={{ marginTop: "5px" }}>This document is a formal record of your bank transfer purchase with G-Smile Signature.</p>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   CUSTOMERS
═══════════════════════════════════════════════════════ */
function CustomersMgr({ onView }: { onView: (id: string) => void }) {
  const { customers } = useStore();
  return (
    <div className="space-y-4">
      <SectionHeader title="Customers" />
      <Table head={["Customer", "Phone", "City", "Orders", "Total Spent", "Joined", "Actions"]}>
        {customers.map((c) => (
          <tr key={c.id} className="hover:bg-cream/40 dark:hover:bg-white/[0.03]">
            <Td>
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/15 font-display text-xs font-semibold text-gold">
                  {c.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-medium text-ink dark:text-white">{c.name}</p>
                  <p className="text-[11px] text-ash">{c.email}</p>
                </div>
              </div>
            </Td>
            <Td>{c.phone}</Td>
            <Td>{c.city}</Td>
            <Td>{c.orders}</Td>
            <Td><span className="font-semibold">{formatNaira(c.spent)}</span></Td>
            <Td>{c.joined}</Td>
            <Td>
              <div className="flex items-center gap-3">
                <ActionBtn label="View" onClick={() => onView(c.id)} />
                <a
                  href={`https://wa.me/${c.phone?.replace(/\s+/g, "").replace("+", "")}?text=${encodeURIComponent(`Hello ${c.name}, this is G-Smile Signature support.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#25D366] hover:text-[#128C7E]"
                  title="Message on WhatsApp"
                >
                  <Icon.whatsapp className="h-4 w-4" />
                </a>
              </div>
            </Td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function CustomerProfile({ customerId, onClose }: { customerId: string; onClose: () => void }) {
  const { customers, orders } = useStore();
  const c = customers.find((x) => x.id === customerId);
  if (!c) return null;
  const cOrders = orders.filter((o) => o.customerEmail === c.email);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 p-4">
      <div className="my-8 w-full max-w-xl rounded-xl bg-white shadow-2xl dark:bg-[#111111]">
        <div className="flex items-center justify-between border-b border-cream px-6 py-4 dark:border-white/10">
          <h3 className="font-display text-xl font-semibold text-ink dark:text-white">Customer Profile</h3>
          <button onClick={onClose}><Icon.close className="h-5 w-5 text-ash" /></button>
        </div>
        <div className="space-y-4 p-6">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-gold/20 font-display text-2xl font-bold text-gold">
              {c.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <p className="font-display text-xl font-semibold text-ink dark:text-white">{c.name}</p>
              <p className="text-sm text-ash">{c.email} · {c.phone}</p>
              <p className="text-sm text-ash">{c.city} · Joined {c.joined}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card><p className="text-[10px] uppercase tracking-widest text-ash">Orders</p><p className="mt-1 font-display text-2xl font-semibold text-ink dark:text-white">{c.orders + cOrders.length}</p></Card>
            <Card><p className="text-[10px] uppercase tracking-widest text-ash">Total Spent</p><p className="mt-1 font-display text-2xl font-semibold text-gold">{formatNaira(c.spent)}</p></Card>
          </div>
          {cOrders.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ash">Recent Orders</p>
              <div className="space-y-2">
                {cOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-lg border border-cream p-3 dark:border-white/10">
                    <div><p className="text-sm font-medium text-ink dark:text-white">{o.id}</p><p className="text-[11px] text-ash">{o.date}</p></div>
                    <div className="text-right"><p className="font-semibold">{formatNaira(o.total)}</p><Badge status={o.status} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end border-t border-cream px-6 py-4 dark:border-white/10">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   COUPONS
═══════════════════════════════════════════════════════ */
function CouponsMgr() {
  const { coupons, upsertCoupon, deleteCoupon, toggleCoupon, toast } = useStore();
  const [edit, setEdit] = useState<Coupon | null>(null);
  const blank: Coupon = { id: "", code: "", discountType: "percent", discountValue: 10, uses: 0, active: true, createdAt: new Date().toISOString().slice(0, 10) };

  return (
    <div className="space-y-4">
      <SectionHeader title="Coupons" action={<Button variant="gold" size="sm" onClick={() => setEdit(blank)}><Icon.plus className="h-4 w-4" /> Create Coupon</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between">
              <p className="font-display text-2xl font-bold tracking-wider text-gold">{c.code}</p>
              <span className={cn("rounded px-2 py-0.5 text-[10px] font-semibold uppercase", c.active ? "bg-green-100 text-green-700" : "bg-ash/10 text-ash")}>
                {c.active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="mt-1 text-lg font-semibold text-ink dark:text-white">
              {c.discountType === "percent" ? `${c.discountValue}% OFF` : formatNaira(c.discountValue) + " OFF"}
            </p>
            <p className="mt-1 text-xs text-ash">
              {c.uses} uses{c.maxUses ? ` / ${c.maxUses}` : ""}{c.minOrder ? ` · Min ${formatNaira(c.minOrder)}` : ""}
            </p>
            <div className="mt-4 flex gap-3">
              <ActionBtn label={c.active ? "Deactivate" : "Activate"} onClick={() => toggleCoupon(c.id)} />
              <ActionBtn label="Edit" onClick={() => setEdit(c)} />
              <ActionBtn label="Delete" danger onClick={() => { if (confirm("Delete coupon?")) { deleteCoupon(c.id); toast("Coupon deleted"); } }} />
            </div>
          </Card>
        ))}
      </div>

      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-[#111111]">
            <div className="flex items-center justify-between border-b border-cream px-6 py-4 dark:border-white/10">
              <h3 className="font-display text-xl font-semibold text-ink dark:text-white">{edit.id ? "Edit" : "Create"} Coupon</h3>
              <button onClick={() => setEdit(null)}><Icon.close className="h-5 w-5 text-ash" /></button>
            </div>
            <div className="grid gap-3 p-6 sm:grid-cols-2">
              <div className="sm:col-span-2"><Input label="Coupon Code" value={edit.code} onChange={(v) => setEdit({ ...edit, code: v.toUpperCase() })} /></div>
              <div>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ash">Type</span>
                  <select value={edit.discountType} onChange={(e) => setEdit({ ...edit, discountType: e.target.value as "percent" | "fixed" })} className="w-full border border-cream bg-white px-4 py-3 text-sm outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white">
                    <option value="percent">Percent (%)</option>
                    <option value="fixed">Fixed (₦)</option>
                  </select>
                </label>
              </div>
              <Input label="Value" type="number" value={String(edit.discountValue)} onChange={(v) => setEdit({ ...edit, discountValue: +v })} />
              <Input label="Max Uses" type="number" value={String(edit.maxUses ?? "")} onChange={(v) => setEdit({ ...edit, maxUses: +v || undefined })} />
              <Input label="Min Order (₦)" type="number" value={String(edit.minOrder ?? "")} onChange={(v) => setEdit({ ...edit, minOrder: +v || undefined })} />
              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 text-sm text-ink dark:text-white">
                  <input type="checkbox" checked={edit.active} onChange={(e) => setEdit({ ...edit, active: e.target.checked })} className="accent-[#d4a24a]" /> Active
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-cream px-6 py-4 dark:border-white/10">
              <Button variant="outline" size="sm" onClick={() => setEdit(null)}>Cancel</Button>
              <Button variant="gold" size="sm" onClick={() => { if (edit.code) { upsertCoupon({ ...edit, id: edit.id || `c-${Date.now()}` }); setEdit(null); } }}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   BANNERS
═══════════════════════════════════════════════════════ */
function BannersMgr() {
  const { content, updateContent, settings, updateSettings } = useStore();
  const [banner, setBanner] = useState(content.banner);
  const [ads, setAds] = useState(settings.headlineAds);
  const [notif, setNotif] = useState(settings.notificationMarquee);

  const save = () => {
    updateContent({ banner });
    updateSettings({ headlineAds: ads.filter(Boolean), notificationMarquee: notif });
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="Banners & Ads" action={<Button variant="gold" size="sm" onClick={save}>Save All</Button>} />

      <Card>
        <p className="mb-4 font-semibold text-ink dark:text-white">Homepage Hero Banner</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Eyebrow Text" value={banner.eyebrow} onChange={(v) => setBanner({ ...banner, eyebrow: v })} />
          <Input label="CTA Button Text" value={banner.cta} onChange={(v) => setBanner({ ...banner, cta: v })} />
          <div className="sm:col-span-2"><Input label="Headline" value={banner.headline} onChange={(v) => setBanner({ ...banner, headline: v })} /></div>
          <div className="sm:col-span-2"><Input label="Subheadline" value={banner.subheadline} onChange={(v) => setBanner({ ...banner, subheadline: v })} /></div>
          <div className="sm:col-span-2"><Input label="CTA Link" value={banner.ctaLink} onChange={(v) => setBanner({ ...banner, ctaLink: v })} /></div>
        </div>
      </Card>

      <Card>
        <p className="mb-3 font-semibold text-ink dark:text-white">Notification Bar (scrolling)</p>
        <textarea value={notif} onChange={(e) => setNotif(e.target.value)} rows={2} className="w-full border border-cream bg-cream/40 px-4 py-3 text-sm outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white" />
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-semibold text-ink dark:text-white">Scrolling Headline Ads</p>
          <button onClick={() => setAds([...ads, ""])} className="text-xs font-semibold text-gold hover:underline">+ Add Ad</button>
        </div>
        <div className="space-y-2">
          {ads.map((ad, i) => (
            <div key={i} className="flex gap-2">
              <input value={ad} onChange={(e) => setAds(ads.map((x, idx) => idx === i ? e.target.value : x))} className="flex-1 border border-cream bg-cream/40 px-3 py-2 text-sm outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <button onClick={() => setAds(ads.filter((_, idx) => idx !== i))} className="text-xs font-semibold text-red-500 hover:underline">Remove</button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   TESTIMONIALS
═══════════════════════════════════════════════════════ */
function TestimonialsMgr() {
  const { testimonials, upsertTestimonial, deleteTestimonial, toast } = useStore();
  const [edit, setEdit] = useState<EditableTestimonial | null>(null);

  return (
    <div className="space-y-4">
      <SectionHeader title="Testimonials" action={<Button variant="gold" size="sm" onClick={() => setEdit({ id: "", name: "", role: "", text: "", rating: 5 })}><Icon.plus className="h-4 w-4" /> Add</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <Card key={t.id}>
            <div className="flex text-gold">{[1,2,3,4,5].map((i) => <Icon.star key={i} className={cn("h-4 w-4", i > t.rating ? "text-ash/30" : "")} />)}</div>
            <p className="mt-3 text-sm italic leading-relaxed text-ink/70 dark:text-white/60">"{t.text}"</p>
            <p className="mt-3 font-semibold text-ink dark:text-white">{t.name}</p>
            <p className="text-xs text-ash">{t.role}</p>
            <div className="mt-3 flex gap-3">
              <ActionBtn label="Edit" onClick={() => setEdit(t)} />
              <ActionBtn label="Delete" danger onClick={() => { if (confirm("Delete?")) { deleteTestimonial(t.id); toast("Removed"); } }} />
            </div>
          </Card>
        ))}
      </div>
      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-[#111111]">
            <div className="flex items-center justify-between border-b border-cream px-6 py-4 dark:border-white/10">
              <h3 className="font-display text-xl font-semibold text-ink dark:text-white">{edit.id ? "Edit" : "Add"} Testimonial</h3>
              <button onClick={() => setEdit(null)}><Icon.close className="h-5 w-5 text-ash" /></button>
            </div>
            <div className="space-y-3 p-6">
              <Input label="Name" value={edit.name} onChange={(v) => setEdit({ ...edit, name: v })} />
              <Input label="Role / Location" value={edit.role} onChange={(v) => setEdit({ ...edit, role: v })} />
              <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ash">Review</span>
                <textarea value={edit.text} onChange={(e) => setEdit({ ...edit, text: e.target.value })} rows={3} className="w-full border border-cream bg-white px-4 py-3 text-sm outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white" /></label>
              <Input label={`Rating (${edit.rating} / 5)`} type="number" value={String(edit.rating)} onChange={(v) => setEdit({ ...edit, rating: Math.max(1, Math.min(5, +v)) })} />
            </div>
            <div className="flex justify-end gap-3 border-t border-cream px-6 py-4 dark:border-white/10">
              <Button variant="outline" size="sm" onClick={() => setEdit(null)}>Cancel</Button>
              <Button variant="gold" size="sm" onClick={() => { if (edit.name && edit.text) { upsertTestimonial({ ...edit, id: edit.id || `t-${Date.now()}` }); setEdit(null); } }}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   FAQs
═══════════════════════════════════════════════════════ */
function FaqsMgr() {
  const { faqs, upsertFaq, deleteFaq, toast } = useStore();
  const [edit, setEdit] = useState<EditableFaq | null>(null);
  const grouped = useMemo(() => faqs.reduce<Record<string, EditableFaq[]>>((m, f) => {
    (m[f.category] = m[f.category] || []).push(f); return m;
  }, {}), [faqs]);

  return (
    <div className="space-y-4">
      <SectionHeader title="FAQs" action={<Button variant="gold" size="sm" onClick={() => setEdit({ id: "", category: "Orders & Payment", q: "", a: "" })}><Icon.plus className="h-4 w-4" /> Add FAQ</Button>} />
      {Object.entries(grouped).map(([cat, list]) => (
        <Card key={cat}>
          <p className="mb-3 font-display text-lg font-semibold text-gold">{cat}</p>
          <div className="space-y-3">
            {list.map((f) => (
              <div key={f.id} className="border-t border-cream pt-3 dark:border-white/10 first:border-0 first:pt-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-ink dark:text-white">{f.q}</p>
                    <p className="mt-1 text-sm text-ash">{f.a}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <ActionBtn label="Edit" onClick={() => setEdit(f)} />
                    <ActionBtn label="Delete" danger onClick={() => { if (confirm("Delete?")) { deleteFaq(f.id); toast("FAQ deleted"); } }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-[#111111]">
            <div className="flex items-center justify-between border-b border-cream px-6 py-4 dark:border-white/10">
              <h3 className="font-display text-xl font-semibold text-ink dark:text-white">{edit.id ? "Edit" : "Add"} FAQ</h3>
              <button onClick={() => setEdit(null)}><Icon.close className="h-5 w-5 text-ash" /></button>
            </div>
            <div className="space-y-3 p-6">
              <Input label="Category" value={edit.category} onChange={(v) => setEdit({ ...edit, category: v })} />
              <Input label="Question" value={edit.q} onChange={(v) => setEdit({ ...edit, q: v })} />
              <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ash">Answer</span>
                <textarea value={edit.a} onChange={(e) => setEdit({ ...edit, a: e.target.value })} rows={4} className="w-full border border-cream bg-white px-4 py-3 text-sm outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white" /></label>
            </div>
            <div className="flex justify-end gap-3 border-t border-cream px-6 py-4 dark:border-white/10">
              <Button variant="outline" size="sm" onClick={() => setEdit(null)}>Cancel</Button>
              <Button variant="gold" size="sm" onClick={() => { if (edit.q && edit.a) { upsertFaq({ ...edit, id: edit.id || `f-${Date.now()}` }); setEdit(null); } }}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SETTINGS
═══════════════════════════════════════════════════════ */
function Settings() {
  const { settings, updateSettings, updatePaymentAccounts, isOnline, products, categories, testimonials, faqs, coupons, content, orders, toast } = useStore();
  const [logoPreview, setLogoPreview] = useState(settings.logo);
  const [timing, setTiming] = useState(settings.dropTiming);
  const [accounts, setAccounts] = useState(settings.paymentAccounts);
  const [uploading, setUploading] = useState(false);

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const uploaded = await uploadImageToCloudinary(file, { maxWidth: 500, quality: 0.82, folder: "g-smile-signature/branding" });
    setLogoPreview(uploaded);
    setUploading(false);
  };

  const save = () => {
    updateSettings({ logo: logoPreview, dropTiming: timing });
    updatePaymentAccounts(accounts);
  };

  const pushToCloud = async () => {
    if (!firebaseEnabled) return toast("Firebase not configured");
    if (!confirm("Push all data to Firebase cloud?")) return;
    try {
      await Promise.all([
        setValue(SYNC_PATHS.products, products),
        setValue(SYNC_PATHS.categories, categories),
        setValue(SYNC_PATHS.testimonials, testimonials),
        setValue(SYNC_PATHS.faqs, faqs),
        setValue(SYNC_PATHS.coupons, coupons),
        setValue(SYNC_PATHS.content, content),
        setValue(SYNC_PATHS.settings, settings),
        setValue(SYNC_PATHS.orders, orders),
      ]);
      toast("All data synced to cloud ✓");
    } catch {
      toast("Sync failed — check connection");
    }
  };

  return (
    <div className="space-y-5">
      <SectionHeader title="Settings" action={<Button variant="gold" size="sm" onClick={save}>Save Settings</Button>} />

      {/* Logo */}
      <Card>
        <p className="mb-4 font-semibold text-ink dark:text-white">Website Logo</p>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-32 items-center justify-center rounded-lg border border-cream bg-cream/60 dark:border-white/10 dark:bg-white/5">
            {logoPreview ? <img src={logoPreview} alt="Logo" className="h-full w-full rounded-lg object-contain" /> : <span className="text-xs text-ash">No logo</span>}
          </div>
          <label className="cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
            <span className="inline-flex items-center gap-2 border border-cream px-4 py-2 text-sm font-semibold text-ink hover:border-gold hover:text-gold dark:border-white/10 dark:text-white">
              {uploading ? (cloudinaryEnabled ? "Uploading to CDN…" : "Compressing…") : "Upload Logo"}
            </span>
          </label>
          {logoPreview && (
            <button onClick={() => setLogoPreview("")} className="text-xs font-semibold text-red-500 hover:underline">Remove</button>
          )}
        </div>
        <p className="mt-2 text-xs text-ash">PNG with transparent background recommended. {cloudinaryEnabled ? "Uploaded to Cloudinary CDN automatically." : "Auto-compressed locally until Cloudinary is configured."}</p>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-ink dark:text-white">Image CDN</p>
            <p className="mt-1 text-xs text-ash">
              {cloudinaryEnabled
                ? "Cloudinary is active. New admin uploads will be delivered through optimized CDN URLs."
                : "Cloudinary is not configured. Uploads will still be compressed locally, but CDN delivery is disabled."}
            </p>
          </div>
          <span className={cn("rounded px-3 py-1 text-[10px] font-semibold uppercase tracking-widest", cloudinaryEnabled ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
            {cloudinaryEnabled ? "Active" : "Local fallback"}
          </span>
        </div>
      </Card>

      {/* Timing */}
      <Card>
        <p className="mb-4 font-semibold text-ink dark:text-white">Auto-Rotate Timing (ms)</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ash">Promo Banner</label>
            <input type="number" step="500" value={timing.promoBanner} onChange={(e) => setTiming({ ...timing, promoBanner: +e.target.value })} className="w-full border border-cream bg-cream/40 px-4 py-2.5 text-sm outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ash">Testimonials</label>
            <input type="number" step="500" value={timing.testimonials} onChange={(e) => setTiming({ ...timing, testimonials: +e.target.value })} className="w-full border border-cream bg-cream/40 px-4 py-2.5 text-sm outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ash">Headline Ads</label>
            <input type="number" step="500" value={timing.headlineAds} onChange={(e) => setTiming({ ...timing, headlineAds: +e.target.value })} className="w-full border border-cream bg-cream/40 px-4 py-2.5 text-sm outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white" />
          </div>
        </div>
      </Card>

      {/* Bank Accounts */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <p className="font-semibold text-ink dark:text-white">Bank Transfer Accounts</p>
          <button onClick={() => setAccounts([...accounts, { id: `p-${Date.now()}`, bank: "", accountNumber: "", accountName: "" }])} className="text-xs font-semibold text-gold hover:underline">+ Add Account</button>
        </div>
        <div className="space-y-3">
          {accounts.map((acc) => (
            <div key={acc.id} className="grid gap-2 sm:grid-cols-4 items-center">
              <input value={acc.bank} onChange={(e) => setAccounts(accounts.map((x) => x.id === acc.id ? { ...x, bank: e.target.value } : x))} placeholder="Bank Name" className="border border-cream bg-cream/40 px-3 py-2 text-sm outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input value={acc.accountNumber} onChange={(e) => setAccounts(accounts.map((x) => x.id === acc.id ? { ...x, accountNumber: e.target.value } : x))} placeholder="Account Number" className="border border-cream bg-cream/40 px-3 py-2 text-sm outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <input value={acc.accountName} onChange={(e) => setAccounts(accounts.map((x) => x.id === acc.id ? { ...x, accountName: e.target.value } : x))} placeholder="Account Name" className="border border-cream bg-cream/40 px-3 py-2 text-sm outline-none focus:border-gold dark:border-white/10 dark:bg-white/5 dark:text-white" />
              <button onClick={() => setAccounts(accounts.filter((x) => x.id !== acc.id))} className="text-xs font-semibold text-red-500 hover:underline">Remove</button>
            </div>
          ))}
          {accounts.length === 0 && <p className="text-sm text-ash">No bank accounts added yet.</p>}
        </div>
      </Card>

      {/* Firebase sync */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={cn("h-2.5 w-2.5 rounded-full", isOnline ? "bg-green-500" : "bg-red-500")} />
            <div>
              <p className="text-sm font-medium text-ink dark:text-white">
                {firebaseEnabled ? (isOnline ? "Firebase connected" : "Offline — changes saved locally") : "Firebase not configured"}
              </p>
              {!firebaseEnabled && <p className="text-xs text-ash">Add credentials to .env to enable sync</p>}
            </div>
          </div>
          <Button variant="outline" size="sm" disabled={!firebaseEnabled} onClick={pushToCloud}>
            Sync to Cloud
          </Button>
        </div>
      </Card>

      {/* Shipping zones (display only) */}
      <Card>
        <p className="mb-3 font-semibold text-ink dark:text-white">Shipping Zones</p>
        <Table head={["Zone", "Rate", "Delivery Time", "Status"]}>
          {[
            { name: "Lagos",          rate: 2500,  days: "1–2 days",   active: true  },
            { name: "Abuja",          rate: 5000,  days: "2–3 days",   active: true  },
            { name: "Other States",   rate: 5000,  days: "3–5 days",   active: true  },
            { name: "International",  rate: 25000, days: "7–14 days",  active: false },
          ].map((z) => (
            <tr key={z.name}>
              <Td><span className="font-medium text-ink dark:text-white">{z.name}</span></Td>
              <Td>{formatNaira(z.rate)}</Td>
              <Td>{z.days}</Td>
              <Td><Badge status={z.active ? "Delivered" : "Cancelled"} /></Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
