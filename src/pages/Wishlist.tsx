import { useStore } from "../store/StoreContext";
import { navigate } from "../store/useRouter";
import type { EditableProduct } from "../store/data";
import { ProductCard } from "../components/ProductCard";
import { Button } from "../components/ui";
import { Icon } from "../components/Icons";

export function Wishlist({ onQuickView }: { onQuickView: (p: EditableProduct) => void }) {
  const { wishlist } = useStore();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">My Wishlist</h1>
      <p className="mt-2 text-ink/60">{wishlist.length} saved {wishlist.length === 1 ? "item" : "items"}</p>

      {wishlist.length === 0 ? (
        <div className="mt-12 border border-cream py-20 text-center">
          <Icon.heart className="mx-auto h-14 w-14 text-ash" />
          <p className="mt-4 text-ink/60">Your wishlist is empty. Save your favourites here.</p>
          <Button variant="gold" className="mt-6" onClick={() => navigate("/shop")}>Discover Bags</Button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-3 gap-x-3 gap-y-7 sm:grid-cols-4 lg:grid-cols-5">
          {wishlist.map((p) => <ProductCard key={p.id} product={p} onQuickView={onQuickView} />)}
        </div>
      )}
    </div>
  );
}
