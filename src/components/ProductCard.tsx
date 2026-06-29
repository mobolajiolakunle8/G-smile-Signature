import { useState } from "react";
import type { EditableProduct } from "../store/data";
import { formatNaira } from "../store/data";
import { useStore } from "../store/StoreContext";
import { navigate } from "../store/useRouter";
import { Icon } from "./Icons";
import { Stars } from "./ui";
import { cn } from "../utils/cn";

export function ProductCard({ product, onQuickView }: { product: EditableProduct; onQuickView?: (p: EditableProduct) => void }) {
  const { addToCart, toggleWishlist, inWishlist } = useStore();
  const [hover, setHover] = useState(false);
  const wished = inWishlist(product.id);

  return (
    <div
      className="group relative flex flex-col"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="relative aspect-[3/4] cursor-pointer overflow-hidden bg-cream"
        onClick={() => navigate(`/product/${product.id}`)}
      >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        {/* badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.badge && (
            <span className="bg-ink px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-white">
              {product.badge}
            </span>
          )}
          {product.oldPrice && (
            <span className="bg-gold px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-ink">
              Sale
            </span>
          )}
        </div>
        {/* wishlist */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          aria-label="Add to wishlist"
          className={cn(
            "absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow-sm transition-all hover:bg-gold hover:text-white",
            wished && "text-gold"
          )}
        >
          {wished ? <Icon.heartFill className="h-4 w-4" /> : <Icon.heart className="h-4 w-4" />}
        </button>
        {/* hover actions */}
        <div
          className={cn(
            "absolute inset-x-3 bottom-3 flex gap-2 transition-all duration-300",
            hover ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          )}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            className="flex flex-1 items-center justify-center gap-2 bg-ink py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-gold hover:text-ink"
          >
            <Icon.cart className="h-4 w-4" /> Add
          </button>
          {onQuickView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView(product);
              }}
              aria-label="Quick view"
              className="grid w-11 place-items-center bg-white text-ink transition-colors hover:bg-gold"
            >
              <Icon.search className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="pt-3">
        <Stars rating={product.rating} />
        <h3
          className="mt-1.5 cursor-pointer font-display text-[15px] font-medium leading-tight text-ink transition-colors hover:text-gold"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[13px] font-semibold text-ink">{formatNaira(product.price)}</span>
          {product.oldPrice && (
            <span className="text-[11px] text-ash line-through">{formatNaira(product.oldPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
