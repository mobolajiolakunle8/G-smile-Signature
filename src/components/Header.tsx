import { useState, useEffect } from "react";
import { useStore } from "../store/StoreContext";
import { navigate, useRouter } from "../store/useRouter";
import { Icon } from "./Icons";
import { categories } from "../data/products";
import { cn } from "../utils/cn";

const mainNav = [
  { label: "Home", path: "/" },
  { label: "Shop All", path: "/shop" },
  { label: "New Arrivals", path: "/shop?sort=newest" },
  { label: "Luxury Collection", path: "/shop?category=luxury-collection" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

export function Header() {
  const { cartCount, wishlist, user, settings } = useStore();
  const { route } = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [route.path]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  return (
    <>
      {/* ── SCROLLING ANNOUNCEMENT BAR ── */}
      <div className="relative overflow-hidden bg-ink text-white">
        <div className="animate-marquee whitespace-nowrap py-2.5 text-center text-[11px] font-medium uppercase tracking-[0.25em]">
          <span className="mx-8 inline-flex items-center gap-2">
            <Icon.truck className="h-3.5 w-3.5 text-gold" />
            {settings.notificationMarquee || "Free nationwide delivery on orders over ₦150,000"}
          </span>
          <span className="mx-8 inline-flex items-center gap-2">
            <Icon.shield className="h-3.5 w-3.5 text-gold" />
            Secure Bank Transfer Checkout
          </span>
          <span className="mx-8 inline-flex items-center gap-2">
            <Icon.refresh className="h-3.5 w-3.5 text-gold" />
            7-Day Easy Returns
          </span>
          {/* Repeat for seamless loop */}
          <span className="mx-8 inline-flex items-center gap-2">
            <Icon.truck className="h-3.5 w-3.5 text-gold" />
            {settings.notificationMarquee || "Free nationwide delivery on orders over ₦150,000"}
          </span>
          <span className="mx-8 inline-flex items-center gap-2">
            <Icon.shield className="h-3.5 w-3.5 text-gold" />
            Secure Bank Transfer Checkout
          </span>
          <span className="mx-8 inline-flex items-center gap-2">
            <Icon.refresh className="h-3.5 w-3.5 text-gold" />
            7-Day Easy Returns
          </span>
        </div>
      </div>

      {/* ── MAIN HEADER ── */}
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b transition-all duration-300",
          scrolled
            ? "border-cream bg-white/97 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#111111]/97"
            : "border-transparent bg-white dark:border-transparent dark:bg-[#111111]"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(true)}
            className="lg:hidden text-ink dark:text-white"
            aria-label="Open menu"
          >
            <Icon.menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex flex-col items-center lg:items-start"
          >
            {settings.logo ? (
              <img src={settings.logo} alt="G-Smile Signature" className="h-8 w-auto object-contain sm:h-10" />
            ) : (
              <>
                <span className="font-display text-xl font-bold tracking-tight text-ink dark:text-white sm:text-2xl">
                  G-Smile <span className="text-gold">Signature</span>
                </span>
                <span className="hidden text-[9px] font-medium uppercase tracking-[0.35em] text-ash sm:block">
                  Premium Bags
                </span>
              </>
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 lg:flex">
            {mainNav.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "relative text-[13px] font-medium uppercase tracking-[0.12em] transition-colors",
                  route.path === item.path || (item.path !== "/" && route.path.startsWith(item.path.split("?")[0]))
                    ? "text-gold"
                    : "text-ink/70 hover:text-ink dark:text-white/60 dark:hover:text-white"
                )}
              >
                {item.label}
                {route.path === item.path && (
                  <span className="absolute -bottom-4 left-0 h-0.5 w-full bg-gold" />
                )}
              </button>
            ))}

            {/* Shop Categories Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShopOpen(true)}
              onMouseLeave={() => setShopOpen(false)}
            >
              <button className="flex items-center gap-1 text-[13px] font-medium uppercase tracking-[0.12em] text-ink/70 hover:text-ink dark:text-white/60 dark:hover:text-white">
                Categories
                <Icon.chevron className={cn("h-3 w-3 transition-transform", shopOpen && "rotate-180")} />
              </button>
              {shopOpen && (
                <div className="absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-4">
                  <div className="animate-scale-in overflow-hidden rounded-lg border border-cream bg-white shadow-xl dark:border-white/10 dark:bg-[#111111]">
                    {categories.map((c) => (
                      <button
                        key={c.slug}
                        onClick={() => navigate(`/shop?category=${c.slug}`)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-[13px] text-ink/70 transition-colors hover:bg-cream/60 hover:text-gold dark:text-white/60 dark:hover:bg-white/5"
                      >
                        <img src={c.image} alt="" className="h-8 w-8 rounded object-cover" />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-ink/70 hover:text-ink dark:text-white/60 dark:hover:text-white"
              aria-label="Search"
            >
              <Icon.search className="h-5 w-5" />
            </button>

            {/* Account */}
            <button
              onClick={() => navigate(user ? "/dashboard" : "/login")}
              className="hidden text-ink/70 hover:text-ink sm:block dark:text-white/60 dark:hover:text-white"
              aria-label="Account"
            >
              <Icon.user className="h-5 w-5" />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => navigate("/wishlist")}
              className="relative text-ink/70 hover:text-ink dark:text-white/60 dark:hover:text-white"
              aria-label="Wishlist"
            >
              <Icon.heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-[9px] font-bold text-ink">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => navigate("/cart")}
              className="relative text-ink/70 hover:text-ink dark:text-white/60 dark:hover:text-white"
              aria-label="Cart"
            >
              <Icon.bag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-[9px] font-bold text-ink">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── SEARCH BAR (expandable) ── */}
        <div
          className={cn(
            "overflow-hidden border-t border-cream bg-cream/40 transition-all duration-300 dark:border-white/10 dark:bg-white/5",
            searchOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <form onSubmit={handleSearch} className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <Icon.search className="h-5 w-5 text-ash" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for handbags, totes, travel bags..."
              className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ash dark:text-white"
              autoFocus={searchOpen}
            />
            <button
              type="submit"
              className="rounded bg-ink px-5 py-2 text-[11px] font-semibold uppercase tracking-widest text-white transition-colors hover:bg-gold hover:text-ink"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="text-ash hover:text-ink"
            >
              <Icon.close className="h-5 w-5" />
            </button>
          </form>
        </div>
      </header>

      {/* ── MOBILE MENU DRAWER ── */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", menuOpen ? "pointer-events-auto" : "pointer-events-none")}>
        {/* Backdrop */}
        <div
          className={cn("absolute inset-0 bg-ink/50 transition-opacity", menuOpen ? "opacity-100" : "opacity-0")}
          onClick={() => setMenuOpen(false)}
        />

        {/* Drawer */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300 dark:bg-[#111111]",
            menuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cream px-5 py-4 dark:border-white/10">
            <span className="font-display text-lg font-bold text-ink dark:text-white">
              G-Smile <span className="text-gold">Signature</span>
            </span>
            <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="text-ink dark:text-white">
              <Icon.close className="h-6 w-6" />
            </button>
          </div>

          {/* Search */}
          <div className="border-b border-cream bg-cream/40 px-5 py-3 dark:border-white/10 dark:bg-white/5">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Icon.search className="h-5 w-5 text-ash" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ash dark:text-white"
              />
            </form>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {mainNav.map((item) => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setMenuOpen(false); }}
                className={cn(
                  "flex w-full items-center justify-between border-b border-cream/60 px-5 py-4 text-left text-base font-medium transition-colors dark:border-white/10",
                  route.path === item.path ? "text-gold" : "text-ink dark:text-white"
                )}
              >
                {item.label}
                <Icon.chevron className="h-4 w-4 text-ash" />
              </button>
            ))}

            {/* Categories removed for cleaner UX */}

            {/* Account actions */}
            <div className="px-5 py-4">
              {user ? (
                <button
                  onClick={() => { navigate("/dashboard"); setMenuOpen(false); }}
                  className="flex w-full items-center justify-center gap-2 rounded bg-ink py-3 text-sm font-semibold uppercase tracking-widest text-white dark:bg-white dark:text-ink"
                >
                  <Icon.user className="h-4 w-4" /> My Account
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => { navigate("/login"); setMenuOpen(false); }}
                    className="flex w-full items-center justify-center gap-2 rounded bg-ink py-3 text-sm font-semibold uppercase tracking-widest text-white dark:bg-white dark:text-ink"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { navigate("/register"); setMenuOpen(false); }}
                    className="flex w-full items-center justify-center gap-2 rounded border border-ink py-3 text-sm font-semibold uppercase tracking-widest text-ink hover:bg-ink hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-ink"
                  >
                    Create Account
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Footer info */}
          <div className="border-t border-cream bg-cream/40 px-5 py-4 text-center text-[11px] text-ash dark:border-white/10 dark:bg-white/5">
            <p>Need help? Call +234 806 565 3384</p>
            <p className="mt-1">gsmilebags@gmail.com</p>
          </div>
        </div>
      </div>
    </>
  );
}
