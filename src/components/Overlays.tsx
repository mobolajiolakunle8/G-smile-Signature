import { useStore } from "../store/StoreContext";
import { navigate } from "../store/useRouter";
import { formatNaira, type Product } from "../data/products";
import { Icon } from "./Icons";
import { Button, Stars } from "./ui";
import { CONTACT } from "../data/content";
import { imageSrcSet, optimizeImageUrl } from "../services/imageCdn";

/* ---------------- Quick View Modal ---------------- */
export function QuickView({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { addToCart } = useStore();
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="animate-scale-in relative grid w-full max-w-3xl gap-0 bg-white shadow-2xl sm:grid-cols-2">
        <button onClick={onClose} className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-ink hover:bg-gold"><Icon.close className="h-4 w-4" /></button>
        <img
          src={optimizeImageUrl(product.image, { width: 720 })}
          srcSet={imageSrcSet(product.image, [360, 520, 720])}
          sizes="(min-width: 640px) 50vw, 100vw"
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-64 w-full object-cover sm:h-full"
        />
        <div className="p-6 sm:p-8">
          <Stars rating={product.rating} />
          <h3 className="mt-2 font-display text-2xl font-semibold">{product.name}</h3>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-lg font-semibold text-gold">{formatNaira(product.price)}</span>
            {product.oldPrice && <span className="text-sm text-ash line-through">{formatNaira(product.oldPrice)}</span>}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ink/60 line-clamp-4">{product.description}</p>
          <div className="mt-6 flex gap-3">
            <Button variant="dark" className="flex-1" onClick={() => { addToCart(product); onClose(); navigate("/cart"); }}>
              Add to Cart
            </Button>
            <Button variant="outline" onClick={() => { onClose(); navigate(`/product/${product.id}`); }}>Details</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Toasts ---------------- */
export function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="animate-fade-up flex items-center gap-2 bg-ink px-5 py-3 text-sm text-white shadow-xl">
          <Icon.check className="h-4 w-4 text-gold" />
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ---------------- WhatsApp floating button ---------------- */
export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${CONTACT.whatsapp}?text=Hello%20G-Smile%20Signature,%20I'm%20interested%20in%20your%20bags`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110"
    >
      <Icon.whatsapp className="h-7 w-7" />
    </a>
  );
}
