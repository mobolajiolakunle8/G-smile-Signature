import { useState } from "react";
import { useRouter, navigate } from "../store/useRouter";
import { useStore } from "../store/StoreContext";
import type { EditableProduct } from "../store/data";
import { formatNaira } from "../store/data";
import { relatedProducts } from "../data/products";
import { CONTACT } from "../data/content";
import { Button, Stars } from "../components/ui";
import { ProductCard } from "../components/ProductCard";
import { Icon } from "../components/Icons";
import { cn } from "../utils/cn";
import { imageSrcSet, optimizeImageUrl } from "../services/imageCdn";

export function ProductDetail({ onQuickView }: { onQuickView: (p: EditableProduct) => void }) {
  const { products, addToCart, toggleWishlist, inWishlist } = useStore();
  const { route } = useRouter();
  const id = route.path.split("/product/")[1];
  const product = products.find((p) => p.id === id);

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "features" | "specs" | "care" | "reviews">("desc");
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });

  if (!product) {
    return (
      <div className="grid min-h-[50vh] place-items-center px-4 text-center">
        <div>
          <h2 className="font-display text-2xl">Product not found</h2>
          <Button variant="gold" className="mt-4" onClick={() => navigate("/shop")}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  const selColor = product.colors[0];
  const selSize = product.sizes[0];
  const wished = inWishlist(product.id);
  const related = relatedProducts(product).map((r) => products.find((p) => p.id === r.id) || r as unknown as EditableProduct).filter(Boolean).slice(0, 5) as EditableProduct[];
  const gallery = product.gallery?.length ? product.gallery : [product.image];

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ active: true, x, y });
  };

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-ash">
          <button onClick={() => navigate("/")} className="hover:text-gold">Home</button> /{" "}
          <button onClick={() => navigate("/shop")} className="hover:text-gold">Shop</button> /{" "}
          <span className="text-ink/60">{product.name}</span>
        </p>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="relative aspect-square overflow-hidden bg-cream" onMouseMove={handleMouse} onMouseLeave={() => setZoom((z) => ({ ...z, active: false }))}>
              <img
                src={optimizeImageUrl(gallery[activeImg], { width: 1000 })}
                srcSet={imageSrcSet(gallery[activeImg], [480, 768, 1000, 1400])}
                sizes="(min-width: 1024px) 50vw, 100vw"
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-200"
                style={zoom.active ? { transform: "scale(1.8)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
              />
            </div>
            <div className="mt-4 flex gap-3">
              {gallery.map((g, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={cn("h-20 w-20 overflow-hidden border-2 transition-colors", activeImg === i ? "border-gold" : "border-transparent")}>
                  <img src={optimizeImageUrl(g, { width: 160 })} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            {product.badge && <span className="bg-ink px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">{product.badge}</span>}
            <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">{product.name}</h1>
            <div className="mt-3 flex items-center gap-3">
              <Stars rating={product.rating} />
              <span className="text-sm text-ash">{product.rating} ({product.reviews} reviews)</span>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <span className="font-display text-3xl font-semibold text-gold">{formatNaira(product.price)}</span>
              {product.oldPrice && <span className="text-lg text-ash line-through">{formatNaira(product.oldPrice)}</span>}
            </div>
            <p className="mt-5 text-[15px] leading-relaxed text-ink/65">{product.description}</p>

            <div className="mt-5 flex items-center gap-2 text-sm">
              <span className={cn("h-2 w-2 rounded-full", product.stock > 0 ? "bg-green-600" : "bg-red-500")} />
              <span className={product.stock > 0 ? "text-green-700" : "text-red-600"}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
              </span>
            </div>

            <div className="mt-7 flex items-center gap-4">
              <div className="flex items-center border border-ink/15">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-3.5 hover:text-gold"><Icon.minus className="h-4 w-4" /></button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="px-4 py-3.5 hover:text-gold"><Icon.plus className="h-4 w-4" /></button>
              </div>
              <Button variant="dark" className="flex-1" onClick={() => addToCart(product, { color: selColor, size: selSize, qty })}>
                <Icon.cart className="h-4 w-4" /> Add to Cart
              </Button>
            </div>
            <div className="mt-3 flex gap-3">
              <Button variant="gold" className="flex-1" onClick={() => { addToCart(product, { color: selColor, size: selSize, qty }); navigate("/checkout"); }}>
                Buy Now
              </Button>
              <button onClick={() => toggleWishlist(product)} className={cn("grid w-14 place-items-center border border-ink/15 transition-colors hover:border-gold", wished && "text-gold border-gold")} aria-label="Wishlist">
                {wished ? <Icon.heartFill className="h-5 w-5" /> : <Icon.heart className="h-5 w-5" />}
              </button>
            </div>

            {/* Delivery Promise & Reassurance */}
            <div className="mt-6 rounded-lg border border-gold/20 bg-gold/5 p-4 text-sm text-ink/70">
              <p className="flex items-center gap-2 font-semibold text-ink"><Icon.truck className="h-4 w-4 text-gold" /> Fast Nationwide Delivery</p>
              <p className="mt-1">Receive your order in 2–5 business days. Tracked shipping to every state.</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-ink/60">
              <span className="flex items-center gap-2"><Icon.shield className="h-4 w-4 text-gold" /> Secure Bank Transfer Checkout</span>
              <span className="flex items-center gap-2"><Icon.refresh className="h-4 w-4 text-gold" /> 7-Day Hassle-Free Returns</span>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(`Hello G-Smile Signature, I'm interested in ${product.name} priced at ${formatNaira(product.price)}. Need help choosing?`)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[#25D366] bg-[#25D366]/10 py-3.5 text-sm font-semibold text-[#128C7E] transition-colors hover:bg-[#25D366] hover:text-white"
            >
              <Icon.whatsapp className="h-5 w-5" /> Need help choosing? Chat with us
            </a>

            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-cream pt-6 text-xs text-ink/60 sm:grid-cols-3">
              <span className="flex items-center gap-2"><Icon.truck className="h-4 w-4 text-gold" /> Fast Delivery</span>
              <span className="flex items-center gap-2"><Icon.shield className="h-4 w-4 text-gold" /> Secure Checkout</span>
              <span className="flex items-center gap-2"><Icon.refresh className="h-4 w-4 text-gold" /> 7-Day Returns</span>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="flex gap-6 border-b border-cream">
            {([["desc", "Description"], ["features", "Features"], ["specs", "Specifications"], ["care", "Material Care"], ["reviews", "Reviews"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className={cn("relative pb-4 text-sm font-medium transition-colors", tab === k ? "text-ink" : "text-ash hover:text-ink")}>
                {l}
                {tab === k && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gold" />}
              </button>
            ))}
          </div>
          <div className="py-8">
            {tab === "desc" && <p className="max-w-3xl text-[15px] leading-relaxed text-ink/65">{product.description}</p>}
            {tab === "features" && (
              <ul className="grid max-w-2xl gap-3 sm:grid-cols-2">
                {product.features.map((f) => (<li key={f} className="flex items-start gap-2 text-sm text-ink/70"><Icon.check className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> {f}</li>))}
              </ul>
            )}
            {tab === "specs" && (
              <div className="max-w-xl divide-y divide-cream border-y border-cream">
                {Object.entries(product.specs).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-3 text-sm"><span className="text-ash">{k}</span><span className="font-medium text-ink">{v}</span></div>
                ))}
              </div>
            )}
            {tab === "care" && (
              <div className="max-w-3xl space-y-4 text-[15px] leading-relaxed text-ink/65">
                <h3 className="font-display text-lg font-semibold text-ink">Genuine Leather Care Guide</h3>
                <p>Your G-Smile Signature bag is crafted from premium full-grain leather. Follow these steps to maintain its elegance for years:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li><strong>Clean:</strong> Wipe with a soft, dry cloth after each use. For deeper cleaning, use a dedicated leather cleaner.</li>
                  <li><strong>Condition:</strong> Apply a high-quality leather conditioner every 3–4 months to keep the leather supple and prevent cracking.</li>
                  <li><strong>Store:</strong> Keep in the provided dust bag when not in use. Stuff with acid-free tissue paper to maintain shape.</li>
                  <li><strong>Avoid:</strong> Prolonged exposure to direct sunlight, moisture, and extreme heat.</li>
                </ul>
                <p className="text-sm italic">Note: Vegan leather and suede variants require specific care. Please message us on WhatsApp for tailored instructions.</p>
              </div>
            )}
            {tab === "reviews" && (
              <div className="max-w-3xl">
                <div className="mb-6 flex items-center gap-4">
                  <div className="text-center">
                    <p className="font-display text-4xl font-bold text-ink">{product.rating}</p>
                    <Stars rating={product.rating} />
                    <p className="mt-1 text-sm text-ash">Based on {product.reviews} reviews</p>
                  </div>
                  <div className="h-12 w-px bg-cream" />
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-3 text-xs">
                        <span className="w-4 text-right font-medium">{star}</span>
                        <Icon.star className="h-3 w-3 text-gold" />
                        <div className="h-2 flex-1 rounded-full bg-cream"><div className="h-full rounded-full bg-gold" style={{ width: `${star === 5 ? 80 : star === 4 ? 15 : 5}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4 border-t border-cream pt-6">
                  <div className="rounded-lg bg-cream/40 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-ink">Adaeze O.</span>
                      <Stars rating={5} />
                    </div>
                    <p className="mt-2 text-sm text-ink/65">Absolutely stunning bag. The leather quality is top-notch and the gold hardware is beautiful. Highly recommend!</p>
                  </div>
                  <div className="rounded-lg bg-cream/40 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-ink">Tunde B.</span>
                      <Stars rating={5} />
                    </div>
                    <p className="mt-2 text-sm text-ink/65">Perfect for work. Fits my laptop and documents comfortably. Delivery was fast too.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">You May Also Like</h2>
          <div className="mt-8 grid grid-cols-3 gap-x-3 gap-y-8 lg:grid-cols-5">
            {related.map((p) => <ProductCard key={p.id} product={p} onQuickView={onQuickView} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
