import type { Product } from "../data/products";
import { products as seedProducts, categories as seedCategories } from "../data/products";
import { testimonials as seedTestimonials, faqs as seedFaqs, galleryImages as seedGallery } from "../data/content";

export type ProductTag = "Bestseller" | "New" | "Limited" | "Corporate Pick" | "Trending" | "Exclusive" | "Editor's Pick";

export type ProductVariant = {
  id: string;
  color: string;
  material: string;
  size: string;
  stock: number;
  sku: string;
};

export type EditableProduct = Omit<Product, "id" | "stock"> & {
  id: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  tags: ProductTag[];
  variants: ProductVariant[];
};

export type EditableCategory = {
  slug: string;
  name: string;
  blurb: string;
  image: string;
};

export type EditableTestimonial = {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
};

export type EditableFaq = {
  id: string;
  category: string;
  q: string;
  a: string;
};

export type Coupon = {
  id: string;
  code: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  uses: number;
  maxUses?: number;
  minOrder?: number;
  active: boolean;
  createdAt: string;
};

export type Banner = {
  headline: string;
  subheadline: string;
  cta: string;
  ctaLink: string;
  eyebrow: string;
};

export type PaymentAccount = {
  id: string;
  bank: string;
  accountNumber: string;
  accountName: string;
};

export type AppSettings = {
  logo: string;
  headlineAds: string[];
  notificationMarquee: string;
  dropTiming: {
    promoBanner: number;
    testimonials: number;
    headlineAds: number;
  };
  paymentAccounts: PaymentAccount[];
};

export type ContentData = {
  banner: Banner;
  galleryImages: string[];
};

export const formatNaira = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });

const generateSKU = (id: string) => `GS-${id.slice(0, 6).toUpperCase()}`;

const defaultVariantsFor = (p: { id: string; colors: string[]; materials: string[]; sizes: string[]; stock: number }): ProductVariant[] => {
  const variants: ProductVariant[] = [];
  p.colors.slice(0, 3).forEach((c) => {
    p.materials.slice(0, 1).forEach((m) => {
      p.sizes.slice(0, 1).forEach((s) => {
        variants.push({
          id: `${p.id}-${c}-${m}-${s}`.replace(/\s+/g, "-").toLowerCase(),
          color: c,
          material: m,
          size: s,
          stock: Math.max(0, Math.floor(p.stock / p.colors.length)),
          sku: generateSKU(`${p.id}-${c}-${m}-${s}`),
        });
      });
    });
  });
  return variants;
};

export const defaultProducts: EditableProduct[] = seedProducts.map((p) => {
  const stock = (p as any).stock ?? 10;
  const colors = (p as any).colors ?? ["Black"];
  const materials = (p as any).materials ?? ["Genuine Leather"];
  const sizes = (p as any).sizes ?? ["One Size"];
  return {
    ...p,
    sku: generateSKU(p.id),
    stock,
    lowStockThreshold: 5,
    tags: (p as any).isNew ? (["New"] as ProductTag[]) : (p as any).badge ? ([(p as any).badge] as ProductTag[]) : [],
    variants: defaultVariantsFor({ id: p.id, colors, materials, sizes, stock }),
  } as EditableProduct;
});
export const defaultCategories: EditableCategory[] = seedCategories.map((c) => ({ ...c }));
export const defaultTestimonials: EditableTestimonial[] = seedTestimonials.map((t, i) => ({ ...t, id: `t${i}` }));
export const defaultFaqs: EditableFaq[] = seedFaqs.flatMap((group) =>
  group.items.map((item, i) => ({ id: `${group.category}-${i}`, category: group.category, ...item }))
);
export const defaultCoupons: Coupon[] = [
  { id: "c1", code: "SMILE10", discountType: "percent", discountValue: 10, uses: 142, active: true, createdAt: "2026-01-10" },
  { id: "c2", code: "NEWYOU", discountType: "percent", discountValue: 15, uses: 38, maxUses: 100, active: true, createdAt: "2026-02-01" },
  { id: "c3", code: "VIP25", discountType: "percent", discountValue: 25, uses: 12, minOrder: 200000, active: false, createdAt: "2026-02-15" },
  { id: "c4", code: "WELCOME5K", discountType: "fixed", discountValue: 5000, uses: 87, maxUses: 500, active: true, createdAt: "2026-03-05" },
];
export const defaultContent: ContentData = {
  banner: {
    headline: "Premium Bags for Every Occasion",
    subheadline: "Discover stylish, durable, and elegant bags designed for work, travel, and everyday sophistication.",
    cta: "Shop Now",
    ctaLink: "/shop",
    eyebrow: "The New Collection",
  },
  galleryImages: [...seedGallery],
};
export const defaultSettings: AppSettings = {
  logo: "/images/hero.jpg",
  headlineAds: [
    "Free nationwide delivery on orders over ₦150,000",
    "New luxury collection now available",
    "Secure instant checkout via bank transfer",
  ],
  notificationMarquee: "Welcome to G-Smile Signature — Premium bags for every occasion. Shop the new collection today!",
  dropTiming: {
    promoBanner: 5000,
    testimonials: 6000,
    headlineAds: 4000,
  },
  paymentAccounts: [
    { id: "p1", bank: "Guaranty Trust Bank", accountNumber: "0123456789", accountName: "G-Smile Signature Ltd" },
    { id: "p2", bank: "Zenith Bank", accountNumber: "0987654321", accountName: "G-Smile Signature Ltd" },
  ],
};
