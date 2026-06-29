import { useState, useRef, useEffect } from "react";
import type { ReactElement } from "react";
import { useStore } from "../store/StoreContext";
import { navigate } from "../store/useRouter";
import { categories } from "../data/products";
import { benefits, galleryImages } from "../data/content";
import type { EditableProduct } from "../store/data";
import { Button, SectionTitle, Stars } from "../components/ui";
import { ProductCard } from "../components/ProductCard";
import { Icon } from "../components/Icons";
import { cn } from "../utils/cn";

const promoSlides = [
  {
    title: "Premium Leather Handbags",
    subtitle: "Up to 20% off on signature designs",
    cta: "Shop Now",
    link: "/shop?category=handbags",
    image: "/images/category-handbags.jpg",
    bg: "from-[#2a1f12] via-[#3d2d1a] to-[#1a1208]",
    accent: "text-gold",
  },
  {
    title: "Luxury Travel Collection",
    subtitle: "Crafted for the modern traveler",
    cta: "Explore",
    link: "/shop?category=travel-bags",
    image: "/images/category-travel.jpg",
    bg: "from-[#1a2438] via-[#24324d] to-[#0e1524]",
    accent: "text-white",
  },
  {
    title: "Corporate Briefcase Series",
    subtitle: "Polished. Professional. Powerful.",
    cta: "Discover",
    link: "/shop?category=corporate-bags",
    image: "/images/category-corporate.jpg",
    bg: "from-[#1a1a1a] via-[#2a2a2a] to-[#0a0a0a]",
    accent: "text-gold",
  },
  {
    title: "New Arrivals · The Aurelia",
    subtitle: "Our bestselling top-handle — now in 3 colors",
    cta: "View Product",
    link: "/product/the-aurelia",
    image: "/images/product-1.jpg",
    bg: "from-[#3a2a18] via-[#4d3a22] to-[#1f1508]",
    accent: "text-gold",
  },
];

const iconMap: Record<string, (p: { className?: string }) => ReactElement> = {
  gem: Icon.gem,
  truck: Icon.truck,
  shield: Icon.shield,
  refresh: Icon.refresh,
  headset: Icon.headset,
};

export function Home({ onQuickView }: { onQuickView: (p: EditableProduct) => void }) {
  const { products, testimonials: storeTestimonials, settings } = useStore();
  const featured = products.slice(0, 8);
  const newArrivals = products.filter((p) => p.isNew).concat(products.slice(0, 6)).slice(0, 8);
  const carouselRef = useRef<HTMLDivElement>(null);
  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const [tIndex, setTIndex] = useState(0);
  const [promoIndex, setPromoIndex] = useState(0);

  // auto-rotate testimonials
  useEffect(() => {
    const id = setInterval(() => {
      setTIndex((i) => (i + 1) % storeTestimonials.length);
    }, settings.dropTiming.testimonials);
    return () => clearInterval(id);
  }, [storeTestimonials.length, settings.dropTiming.testimonials]);

  // auto-rotate promo banner
  useEffect(() => {
    const id = setInterval(() => {
      setPromoIndex((i) => (i + 1) % promoSlides.length);
    }, settings.dropTiming.promoBanner);
    return () => clearInterval(id);
  }, [settings.dropTiming.promoBanner]);

  const scrollFeatured = (dir: number) => {
    featuredScrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div>
      {/* PROMO BANNER CAROUSEL — full width sliding banner */}
      <section className="relative overflow-hidden bg-cream">
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <div className="relative h-[220px] w-full overflow-hidden rounded-lg sm:h-[280px]">
            <div
              className="flex h-full w-full transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${promoIndex * 100}%)` }}
            >
              {promoSlides.map((slide) => (
                <button
                  key={slide.title}
                  onClick={() => navigate(slide.link)}
                  className={cn(
                    "relative flex h-full w-full shrink-0 items-center justify-between bg-gradient-to-r p-8 text-left sm:p-12",
                    slide.bg
                  )}
                >
                  <div className="relative z-10 max-w-[60%] text-white">
                    <p className={cn("text-[10px] font-semibold uppercase tracking-[0.3em]", slide.accent)}>
                      Limited Time Offer
                    </p>
                    <h2 className="mt-3 font-display text-2xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                      {slide.title}
                    </h2>
                    <p className="mt-3 text-sm text-white/70 sm:text-lg">{slide.subtitle}</p>
                    <span className="mt-6 inline-flex items-center gap-2 bg-gold px-6 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-ink shadow-lg transition-transform hover:scale-105">
                      {slide.cta} <Icon.arrowRight className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="relative z-10 hidden h-48 w-48 overflow-hidden rounded-lg shadow-2xl sm:block lg:h-64 lg:w-64">
                    <img src={slide.image} alt="" className="h-full w-full object-cover" />
                  </div>
                </button>
              ))}
            </div>

            {/* indicators */}
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
              {promoSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setPromoIndex(i); }}
                  aria-label={`Promo ${i + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i === promoIndex ? "w-10 bg-gold" : "w-3 bg-white/40 hover:bg-white/80"
                  )}
                />
              ))}
            </div>

            {/* arrows */}
            <button
              onClick={(e) => { e.stopPropagation(); setPromoIndex((i) => (i - 1 + promoSlides.length) % promoSlides.length); }}
              aria-label="Previous"
              className="absolute left-4 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-gold hover:text-ink"
            >
              <Icon.chevron className="h-5 w-5 rotate-180" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setPromoIndex((i) => (i + 1) % promoSlides.length); }}
              aria-label="Next"
              className="absolute right-4 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-gold hover:text-ink"
            >
              <Icon.chevron className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      {/* FEATURED SECTIONS — horizontal scroller */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Featured Sections</p>
            <h3 className="mt-1 font-display text-xl font-semibold sm:text-2xl">Shop by Category</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollFeatured(-1)}
              aria-label="Scroll left"
              className="hidden h-9 w-9 place-items-center rounded-full border border-ink/15 hover:border-gold hover:text-gold sm:grid"
            >
              <Icon.chevron className="h-4 w-4 rotate-180" />
            </button>
            <button
              onClick={() => scrollFeatured(1)}
              aria-label="Scroll right"
              className="hidden h-9 w-9 place-items-center rounded-full border border-ink/15 hover:border-gold hover:text-gold sm:grid"
            >
              <Icon.chevron className="h-4 w-4" />
            </button>
            <button onClick={() => navigate("/shop")} className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-ink hover:text-gold">
              See all <Icon.arrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div ref={featuredScrollRef} className="no-scrollbar mt-5 flex gap-4 overflow-x-auto pb-2">
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => navigate(`/shop?category=${c.slug}`)}
              className="group flex w-[170px] flex-shrink-0 flex-col items-center gap-2 rounded-lg border border-cream bg-white p-4 text-center transition-all hover:-translate-y-1 hover:border-gold hover:shadow-lg sm:w-[180px]"
            >
              <div className="h-20 w-20 overflow-hidden rounded-full bg-cream">
                <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              <p className="mt-1 font-display text-[15px] font-medium leading-tight text-ink">{c.name}</p>
              <p className="text-[10px] uppercase tracking-wider text-ash">{c.blurb}</p>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-gold opacity-0 transition-opacity group-hover:opacity-100">
                Shop →
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* HERO — text-only, no image */}
      <section className="relative overflow-hidden bg-cream">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="animate-fade-up mb-5 flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            <span className="h-px w-10 bg-gold" /> The New Collection <span className="h-px w-10 bg-gold" />
          </div>
          <h1 className="animate-fade-up delay-100 font-display text-4xl font-semibold leading-[1.08] text-ink sm:text-5xl lg:text-6xl">
            Premium Bags for <em className="text-gold">Every Occasion</em>
          </h1>
          <p className="animate-fade-up delay-200 mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-ink/60 sm:text-base">
            Discover stylish, durable, and elegant bags designed for work, travel, and everyday sophistication.
          </p>
          <div className="animate-fade-up delay-300 mt-8 flex flex-wrap justify-center gap-4">
            <Button variant="dark" size="lg" onClick={() => navigate("/shop")}>
              Shop Now <Icon.arrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/shop?category=luxury-collection")}>
              View Collection
            </Button>
          </div>
          <div className="animate-fade-up delay-400 mt-10 flex justify-center gap-8">
            {[["12K+", "Happy Clients"], ["150+", "Bag Designs"], ["4.9★", "Avg. Rating"]].map(([n, l]) => (
              <div key={l}>
                <p className="font-display text-2xl font-semibold text-ink sm:text-3xl">{n}</p>
                <p className="text-xs uppercase tracking-wider text-ash">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <SectionTitle eyebrow="Browse" title="Shop by Category" center subtitle="Find the perfect bag for every part of your life — from boardroom to getaway." />
        <div className="mt-10 grid grid-cols-3 gap-3 lg:grid-cols-6">
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => navigate(`/shop?category=${c.slug}`)}
              className="group relative aspect-square overflow-hidden bg-cream text-left"
            >
              <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-center">
                <h3 className="font-display text-sm font-semibold text-white sm:text-base">{c.name}</h3>
                <span className="mt-0.5 block text-[9px] uppercase tracking-widest text-gold opacity-0 transition-opacity group-hover:opacity-100">
                  Shop →
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="bg-cream/40 py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <SectionTitle eyebrow="Curated" title="Featured Products" />
            <button onClick={() => navigate("/shop")} className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-widest text-ink hover:text-gold sm:flex">
              View All <Icon.arrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-x-3 gap-y-8 lg:grid-cols-5">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} onQuickView={onQuickView} />
            ))}
          </div>
        </div>
      </section>

      {/* NEW ARRIVALS CAROUSEL */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex items-end justify-between">
          <SectionTitle eyebrow="Just In" title="New Arrivals" />
          <div className="flex gap-2">
            <button onClick={() => scrollFeatured(-1)} aria-label="Previous" className="grid h-10 w-10 place-items-center border border-ink/15 hover:border-gold hover:text-gold">
              <Icon.chevron className="h-4 w-4 rotate-180" />
            </button>
            <button onClick={() => scrollFeatured(1)} aria-label="Next" className="grid h-10 w-10 place-items-center border border-ink/15 hover:border-gold hover:text-gold">
              <Icon.chevron className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div ref={carouselRef} className="no-scrollbar mt-10 flex gap-4 overflow-x-auto scroll-smooth pb-2">
          {newArrivals.map((p) => (
            <div key={p.id} className="w-[200px] flex-shrink-0 sm:w-[220px]">
              <ProductCard product={p} onQuickView={onQuickView} />
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="bg-ink py-16 text-white lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="The Difference" title="Why Choose G-Smile" center light subtitle="More than a bag — an investment in elegance, durability and effortless style." />
          <div className="mt-14 grid grid-cols-2 gap-8 lg:grid-cols-5">
            {benefits.map((b) => {
              const I = iconMap[b.icon];
              return (
                <div key={b.title} className="text-center">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold/30 text-gold">
                    <I className="h-7 w-7" />
                  </div>
                  <h4 className="mt-5 font-display text-lg font-medium">{b.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — Scrolling, one per page */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <SectionTitle eyebrow="Loved By Many" title="What Our Clients Say" center />
        <div className="relative mt-12 overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${tIndex * 100}%)` }}
          >
            {storeTestimonials.map((t) => (
              <div key={t.name} className="w-full flex-shrink-0 px-4">
                <div className="mx-auto max-w-3xl bg-cream/60 p-8 text-center sm:p-14">
                  <Stars rating={t.rating} className="justify-center" />
                  <p className="mt-6 font-display text-xl italic leading-relaxed text-ink/80 sm:text-2xl">
                    "{t.text}"
                  </p>
                  <p className="mt-6 font-semibold text-ink">{t.name}</p>
                  <p className="text-xs uppercase tracking-wider text-ash">{t.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* indicators */}
          <div className="mt-8 flex justify-center gap-2">
            {storeTestimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setTIndex(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === tIndex ? "w-10 bg-gold" : "w-3 bg-ash/40 hover:bg-ash"
                )}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>

          {/* arrows */}
          <button
            onClick={() => setTIndex((i) => (i - 1 + storeTestimonials.length) % storeTestimonials.length)}
            aria-label="Previous testimonial"
            className="absolute left-0 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-ink/15 bg-white text-ink shadow-sm transition-colors hover:border-gold hover:text-gold sm:h-12 sm:w-12"
          >
            <Icon.chevron className="h-4 w-4 rotate-180 sm:h-5 sm:w-5" />
          </button>
          <button
            onClick={() => setTIndex((i) => (i + 1) % storeTestimonials.length)}
            aria-label="Next testimonial"
            className="absolute right-0 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-ink/15 bg-white text-ink shadow-sm transition-colors hover:border-gold hover:text-gold sm:h-12 sm:w-12"
          >
            <Icon.chevron className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
      </section>

      {/* GALLERY */}
      <section className="bg-cream/40 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="@gsmilesignature" title="In Real Life" center subtitle="Tag us to be featured. See how our community styles their G-Smile bags." />
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {galleryImages.map((img, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden">
                <img src={img} alt="Lifestyle" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 grid place-items-center bg-ink/0 transition-colors group-hover:bg-ink/40">
                  <Icon.instagram className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
