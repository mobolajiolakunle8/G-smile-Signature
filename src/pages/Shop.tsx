import { useMemo, useState } from "react";
import { useStore } from "../store/StoreContext";
import { navigate, useRouter } from "../store/useRouter";
import type { EditableProduct } from "../store/data";
import { formatNaira } from "../store/data";
import { allColors, allMaterials, colorSwatch } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { Icon } from "../components/Icons";
import { Button } from "../components/ui";
import { cn } from "../utils/cn";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "low", label: "Price: Low to High" },
  { value: "high", label: "Price: High to Low" },
];

const collections = [
  { label: "Corporate", value: "corporate", hint: "Briefcases, laptop bags, office-ready totes" },
  { label: "Travel", value: "travel", hint: "Weekend bags, cabin bags, duffels" },
  { label: "Everyday", value: "everyday", hint: "Totes, handbags, practical daily carry" },
  { label: "Luxury", value: "luxury", hint: "Statement pieces and premium finishes" },
];

function productMatchesCollection(product: EditableProduct, collection: string) {
  const haystack = `${product.name} ${product.category} ${product.description} ${product.tags?.join(" ") ?? ""}`.toLowerCase();
  if (collection === "corporate") return haystack.includes("corporate") || haystack.includes("brief") || haystack.includes("laptop") || haystack.includes("office") || haystack.includes("boardroom");
  if (collection === "travel") return haystack.includes("travel") || haystack.includes("voyager") || haystack.includes("duffel") || haystack.includes("weekender") || haystack.includes("cabin");
  if (collection === "everyday") return haystack.includes("tote") || haystack.includes("handbag") || haystack.includes("everyday") || haystack.includes("crossbody") || haystack.includes("shopper");
  if (collection === "luxury") return haystack.includes("luxury") || haystack.includes("clutch") || haystack.includes("noir") || haystack.includes("imperial") || product.tags?.includes("Exclusive");
  return true;
}

export function Shop({ onQuickView }: { onQuickView: (product: EditableProduct) => void }) {
  const { route } = useRouter();
  const { products, categories } = useStore();

  const [search, setSearch] = useState(route.query.q || "");
  const [category, setCategory] = useState(route.query.category || "all");
  const [collection, setCollection] = useState(route.query.collection || "all");
  const [maxPrice, setMaxPrice] = useState(200000);
  const [color, setColor] = useState<string | null>(null);
  const [material, setMaterial] = useState<string | null>(null);
  const [sort, setSort] = useState(route.query.sort || "newest");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const perPage = 12;

  const activeFilters = [
    search && `Search: ${search}`,
    category !== "all" && categories.find((item) => item.slug === category)?.name,
    collection !== "all" && collections.find((item) => item.value === collection)?.label,
    color && `Color: ${color}`,
    material && `Material: ${material}`,
    maxPrice < 200000 && `Under ${formatNaira(maxPrice)}`,
  ].filter(Boolean) as string[];

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    let list = products.filter((product) => {
      const categoryName = categories.find((item) => item.slug === product.category)?.name || product.category;
      const searchable = [
        product.name,
        product.category,
        categoryName,
        product.description,
        product.brand,
        ...(product.colors || []),
        ...(product.materials || []),
        ...(product.sizes || []),
        ...(product.tags || []),
      ].join(" ").toLowerCase();

      if (query && !searchable.includes(query)) return false;
      if (category !== "all" && product.category !== category) return false;
      if (collection !== "all" && !productMatchesCollection(product, collection)) return false;
      if (product.price > maxPrice) return false;
      if (color && !product.colors.includes(color)) return false;
      if (material && !product.materials.includes(material)) return false;
      return true;
    });

    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "popular") list = [...list].sort((a, b) => b.popularity - a.popularity);
    else list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew));

    return list;
  }, [products, categories, search, category, collection, maxPrice, color, material, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = Math.min(page, totalPages);
  const pageItems = filtered.slice((current - 1) * perPage, current * perPage);

  const resetAll = () => {
    setSearch("");
    setCategory("all");
    setCollection("all");
    setMaxPrice(200000);
    setColor(null);
    setMaterial(null);
    setSort("newest");
    setPage(1);
    navigate("/shop");
  };

  const setQuickCollection = (value: string) => {
    setCollection(collection === value ? "all" : value);
    setPage(1);
  };

  const FilterPanel = () => (
    <div className="space-y-8">
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink dark:text-white">Category</h4>
        <div className="space-y-1.5">
          {[{ slug: "all", name: "All Bags" }, ...categories].map((item) => (
            <button
              key={item.slug}
              onClick={() => { setCategory(item.slug); setPage(1); }}
              className={cn("block text-sm transition-colors", category === item.slug ? "font-semibold text-gold" : "text-ink/60 hover:text-ink dark:text-white/60 dark:hover:text-white")}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink dark:text-white">Collection</h4>
        <div className="space-y-2">
          {collections.map((item) => (
            <button
              key={item.value}
              onClick={() => setQuickCollection(item.value)}
              className={cn("block w-full text-left transition-colors", collection === item.value ? "text-gold" : "text-ink/60 hover:text-ink dark:text-white/60 dark:hover:text-white")}
            >
              <span className="block text-sm font-semibold">{item.label}</span>
              <span className="block text-[11px] text-ash">{item.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink dark:text-white">Max Price</h4>
        <input type="range" min={70000} max={200000} step={1000} value={maxPrice} onChange={(event) => { setMaxPrice(+event.target.value); setPage(1); }} className="w-full accent-[#d4a24a]" />
        <p className="mt-1 text-sm text-ink/60 dark:text-white/60">Up to {formatNaira(maxPrice)}</p>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink dark:text-white">Color</h4>
        <div className="flex flex-wrap gap-2">
          {allColors.map((item) => (
            <button
              key={item}
              onClick={() => { setColor(color === item ? null : item); setPage(1); }}
              aria-label={item}
              title={item}
              style={{ background: colorSwatch[item] || "#ccc" }}
              className={cn("h-8 w-8 rounded-full border-2 transition-all", color === item ? "border-gold ring-2 ring-gold/30" : "border-cream dark:border-white/20")}
            />
          ))}
        </div>
        {color && <p className="mt-2 text-xs text-ash">Selected: {color}</p>}
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-ink dark:text-white">Material</h4>
        <div className="space-y-1.5">
          {allMaterials.map((item) => (
            <button
              key={item}
              onClick={() => { setMaterial(material === item ? null : item); setPage(1); }}
              className={cn("block text-sm transition-colors", material === item ? "font-semibold text-gold" : "text-ink/60 hover:text-ink dark:text-white/60 dark:hover:text-white")}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <Button variant="outline" size="sm" className="w-full" onClick={resetAll}>Reset Filters</Button>
    </div>
  );

  const title = collection !== "all"
    ? `${collections.find((item) => item.value === collection)?.label} Collection`
    : category !== "all"
      ? categories.find((item) => item.slug === category)?.name || "Shop"
      : "Shop All Bags";

  return (
    <div>
      <div className="border-b border-cream bg-cream/40 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.2em] text-ash">
            <button onClick={() => navigate("/")} className="hover:text-gold">Home</button> / Shop
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink dark:text-white sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-ink/60 dark:text-white/60">{filtered.length} product{filtered.length === 1 ? "" : "s"} found</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-5">
          <form onSubmit={(event) => event.preventDefault()} className="flex items-center gap-3 border border-ink/15 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            <Icon.search className="h-5 w-5 shrink-0 text-ash" />
            <input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              placeholder="Search by name, category, color, material..."
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ash dark:text-white"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} className="text-ash hover:text-ink dark:hover:text-white">
                <Icon.close className="h-4 w-4" />
              </button>
            )}
          </form>

          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
            {collections.map((item) => (
              <button
                key={item.value}
                onClick={() => setQuickCollection(item.value)}
                className={cn(
                  "shrink-0 border px-5 py-3 text-left transition-all",
                  collection === item.value
                    ? "border-gold bg-gold text-ink"
                    : "border-ink/10 bg-white text-ink hover:border-gold hover:text-gold dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                )}
              >
                <span className="block font-display text-base font-semibold">{item.label}</span>
                <span className={cn("block text-[11px]", collection === item.value ? "text-ink/70" : "text-ash")}>{item.hint}</span>
              </button>
            ))}
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-ash">Active:</span>
              {activeFilters.map((item) => <span key={item} className="rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold">{item}</span>)}
              <button onClick={resetAll} className="text-xs font-semibold text-ink/50 hover:text-gold dark:text-white/50">Clear all</button>
            </div>
          )}
        </div>

        <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block"><FilterPanel /></aside>

          <div>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <button onClick={() => setShowFilters(true)} className="flex items-center gap-2 border border-ink/15 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest lg:hidden dark:border-white/10">
                <Icon.settings className="h-4 w-4" /> Filters
              </button>
              <p className="text-sm text-ink/60 dark:text-white/60">Showing {pageItems.length} of {filtered.length}</p>
              <div className="ml-auto flex items-center gap-3">
                <span className="hidden text-xs uppercase tracking-wider text-ash sm:block">Sort</span>
                <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} className="border border-ink/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-gold dark:border-white/10 dark:bg-white/[0.03] dark:text-white">
                  {sortOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
            </div>

            {pageItems.length === 0 ? (
              <div className="rounded-lg border border-cream bg-cream/40 px-6 py-16 text-center dark:border-white/10 dark:bg-white/[0.03]">
                <Icon.bag className="mx-auto h-14 w-14 text-ash" />
                <h3 className="mt-5 font-display text-2xl font-semibold text-ink dark:text-white">No bags found</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-ink/60 dark:text-white/60">
                  Try removing a filter, expanding your price range, or browsing one of our curated collections.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  {collections.map((item) => (
                    <button key={item.value} onClick={() => { setCollection(item.value); setPage(1); }} className="border border-gold px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gold hover:bg-gold hover:text-ink">
                      {item.label}
                    </button>
                  ))}
                </div>
                <Button variant="dark" size="sm" className="mt-6" onClick={resetAll}>Reset All Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 xl:grid-cols-4">
                {pageItems.map((product) => <ProductCard key={product.id} product={product} onQuickView={onQuickView} />)}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                <button disabled={current === 1} onClick={() => setPage(current - 1)} className="grid h-10 w-10 place-items-center border border-ink/15 disabled:opacity-40 hover:border-gold dark:border-white/10"><Icon.chevron className="h-4 w-4 rotate-180" /></button>
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button key={index} onClick={() => setPage(index + 1)} className={cn("h-10 w-10 border text-sm", current === index + 1 ? "border-ink bg-ink text-white" : "border-ink/15 hover:border-gold dark:border-white/10")}>{index + 1}</button>
                ))}
                <button disabled={current === totalPages} onClick={() => setPage(current + 1)} className="grid h-10 w-10 place-items-center border border-ink/15 disabled:opacity-40 hover:border-gold dark:border-white/10"><Icon.chevron className="h-4 w-4" /></button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={cn("fixed inset-0 z-50 lg:hidden", showFilters ? "pointer-events-auto" : "pointer-events-none")}>
        <div className={cn("absolute inset-0 bg-ink/40 transition-opacity", showFilters ? "opacity-100" : "opacity-0")} onClick={() => setShowFilters(false)} />
        <div className={cn("absolute left-0 top-0 h-full w-[85%] max-w-xs overflow-y-auto bg-white p-6 transition-transform dark:bg-[#111111]", showFilters ? "translate-x-0" : "-translate-x-full")}>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-display text-xl font-semibold text-ink dark:text-white">Filters</h3>
            <button onClick={() => setShowFilters(false)}><Icon.close className="dark:text-white" /></button>
          </div>
          <FilterPanel />
          <Button variant="dark" className="mt-6 w-full" onClick={() => setShowFilters(false)}>Apply Filters</Button>
        </div>
      </div>
    </div>
  );
}