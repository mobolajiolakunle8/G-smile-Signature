export type Product = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  category: string;
  brand: string;
  colors: string[];
  materials: string[];
  sizes: string[];
  image: string;
  gallery: string[];
  rating: number;
  reviews: number;
  stock: number;
  badge?: string;
  isNew?: boolean;
  popularity: number;
  description: string;
  features: string[];
  specs: Record<string, string>;
};

/* Images are served from the /public folder.
   assetsInlineLimit in vite.config.ts inlines them at build time
   so they work on every deployment platform. */
const IMG = {
  handbags:  "/images/category-handbags.jpg",
  tote:      "/images/category-tote.jpg",
  travel:    "/images/category-travel.jpg",
  laptop:    "/images/category-laptop.jpg",
  corporate: "/images/category-corporate.jpg",
  luxury:    "/images/category-luxury.jpg",
  p1:        "/images/product-1.jpg",
  lifestyle: "/images/lifestyle1.jpg",
};

export const categories = [
  { slug: "handbags", name: "Handbags", image: IMG.handbags, blurb: "Timeless silhouettes" },
  { slug: "tote-bags", name: "Tote Bags", image: IMG.tote, blurb: "Everyday spaciousness" },
  { slug: "travel-bags", name: "Travel Bags", image: IMG.travel, blurb: "Built for the journey" },
  { slug: "laptop-bags", name: "Laptop Bags", image: IMG.laptop, blurb: "Work in style" },
  { slug: "corporate-bags", name: "Corporate Bags", image: IMG.corporate, blurb: "Polished & professional" },
  { slug: "luxury-collection", name: "Luxury Collection", image: IMG.luxury, blurb: "Statement pieces" },
];

export const colorSwatch: Record<string, string> = {
  Black: "#111111",
  Tan: "#c89b6a",
  Cream: "#f0e6d2",
  Brown: "#6b4423",
  Gold: "#d4a24a",
  Burgundy: "#6e1f2e",
  Navy: "#1f2a44",
  Olive: "#5b5d3a",
  Grey: "#9a9a9a",
};

const desc =
  "Meticulously crafted from premium full-grain leather, this piece blends timeless elegance with everyday functionality. Each bag is finished by hand with signature gold-tone hardware and a soft suede-lined interior, designed to elevate every occasion.";

const baseFeatures = [
  "Genuine full-grain leather construction",
  "Signature gold-tone hardware",
  "Soft suede-lined interior compartments",
  "Adjustable & detachable strap",
  "Protective dust bag included",
];

function makeProduct(p: Partial<Product> & { id: string; name: string; price: number; category: string; image: string }): Product {
  return {
    brand: "G-Smile Signature",
    colors: ["Black", "Tan", "Cream"],
    materials: ["Genuine Leather"],
    sizes: ["One Size"],
    gallery: [p.image, IMG.lifestyle, IMG.luxury],
    rating: 4.7,
    reviews: 42,
    stock: 18,
    popularity: 70,
    oldPrice: undefined,
    description: desc,
    features: baseFeatures,
    specs: {
      Material: "Full-grain leather",
      Dimensions: "30 × 22 × 12 cm",
      Hardware: "Gold-tone",
      Lining: "Suede",
      Weight: "0.9 kg",
      Warranty: "1 year",
    },
    ...p,
  } as Product;
}

export const products: Product[] = [
  makeProduct({
    id: "the-aurelia",
    name: "The Aurelia Top-Handle",
    price: 145000,
    oldPrice: 175000,
    category: "handbags",
    image: IMG.p1,
    colors: ["Tan", "Black", "Burgundy"],
    badge: "Bestseller",
    isNew: true,
    rating: 4.9,
    reviews: 128,
    popularity: 98,
    stock: 12,
  }),
  makeProduct({
    id: "noir-quilted",
    name: "Noir Quilted Shoulder",
    price: 132000,
    category: "luxury-collection",
    image: IMG.luxury,
    colors: ["Black", "Gold"],
    badge: "Luxury",
    rating: 4.8,
    reviews: 86,
    popularity: 94,
  }),
  makeProduct({
    id: "savanna-tote",
    name: "Savanna Everyday Tote",
    price: 98000,
    category: "tote-bags",
    image: IMG.tote,
    colors: ["Tan", "Cream", "Brown"],
    isNew: true,
    rating: 4.7,
    reviews: 64,
    popularity: 88,
  }),
  makeProduct({
    id: "voyager-weekender",
    name: "Voyager Leather Weekender",
    price: 168000,
    category: "travel-bags",
    image: IMG.travel,
    colors: ["Brown", "Black"],
    badge: "New",
    isNew: true,
    rating: 4.9,
    reviews: 51,
    popularity: 90,
  }),
  makeProduct({
    id: "executive-folio",
    name: "Executive Laptop Folio",
    price: 112000,
    category: "laptop-bags",
    image: IMG.laptop,
    colors: ["Black", "Navy"],
    rating: 4.6,
    reviews: 73,
    popularity: 82,
  }),
  makeProduct({
    id: "boardroom-brief",
    name: "Boardroom Briefcase",
    price: 156000,
    category: "corporate-bags",
    image: IMG.corporate,
    colors: ["Black", "Brown"],
    badge: "Pro",
    rating: 4.8,
    reviews: 39,
    popularity: 79,
  }),
  makeProduct({
    id: "celeste-mini",
    name: "Celeste Mini Crossbody",
    price: 86000,
    oldPrice: 99000,
    category: "handbags",
    image: IMG.handbags,
    colors: ["Cream", "Tan", "Olive"],
    rating: 4.7,
    reviews: 92,
    popularity: 85,
  }),
  makeProduct({
    id: "monarch-hobo",
    name: "Monarch Slouch Hobo",
    price: 124000,
    category: "handbags",
    image: IMG.p1,
    colors: ["Burgundy", "Black", "Tan"],
    rating: 4.6,
    reviews: 47,
    popularity: 74,
  }),
  makeProduct({
    id: "atlas-backpack",
    name: "Atlas Leather Backpack",
    price: 138000,
    category: "laptop-bags",
    image: IMG.laptop,
    colors: ["Brown", "Black", "Grey"],
    isNew: true,
    rating: 4.8,
    reviews: 58,
    popularity: 80,
  }),
  makeProduct({
    id: "grande-shopper",
    name: "Grande Shopper Tote",
    price: 105000,
    category: "tote-bags",
    image: IMG.tote,
    colors: ["Cream", "Tan"],
    rating: 4.5,
    reviews: 33,
    popularity: 68,
  }),
  makeProduct({
    id: "imperial-clutch",
    name: "Imperial Evening Clutch",
    price: 79000,
    category: "luxury-collection",
    image: IMG.luxury,
    colors: ["Gold", "Black"],
    badge: "Luxury",
    rating: 4.9,
    reviews: 41,
    popularity: 77,
  }),
  makeProduct({
    id: "horizon-duffel",
    name: "Horizon Cabin Duffel",
    price: 152000,
    category: "travel-bags",
    image: IMG.travel,
    colors: ["Black", "Brown", "Navy"],
    rating: 4.7,
    reviews: 29,
    popularity: 72,
  }),
];

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function relatedProducts(p: Product, limit = 4) {
  return products
    .filter((x) => x.id !== p.id && x.category === p.category)
    .concat(products.filter((x) => x.id !== p.id && x.category !== p.category))
    .slice(0, limit);
}

export const allColors = Array.from(new Set(products.flatMap((p) => p.colors)));
export const allMaterials = ["Genuine Leather", "Vegan Leather", "Canvas", "Suede"];
export const allBrands = ["G-Smile Signature"];

export const formatNaira = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
