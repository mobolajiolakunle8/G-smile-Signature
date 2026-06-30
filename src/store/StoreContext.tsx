import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  defaultProducts,
  defaultCategories,
  defaultTestimonials,
  defaultFaqs,
  defaultCoupons,
  defaultContent,
  defaultSettings,
  formatNaira,
  type EditableProduct,
  type EditableCategory,
  type EditableTestimonial,
  type EditableFaq,
  type Coupon,
  type ContentData,
  type AppSettings,
  type PaymentAccount,
} from "./data";
import { logEvent, subscribe, setValue, SYNC_PATHS } from "../firebase/sync";
import { firebaseEnabled } from "../firebase/config";
import type { Product } from "../data/products";
import { generateEmail, sendTransactionalEmail } from "../services/emailService";

export type CartItem = {
  id: string;
  productId: string;
  product: EditableProduct;
  qty: number;
  color: string;
  size: string;
};

export type OrderStatus = "Awaiting Payment" | "Payment Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

export type Order = {
  id: string;
  date: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shipping: { address: string; city: string; state: string };
  items: { name: string; qty: number; price: number; image: string }[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentProof?: string;
  paymentConfirmedAt?: string;
  trackingNumber?: string;
  adminNotes?: string;
  invoiceNumber?: string;
  invoiceGeneratedAt?: string;
  status: OrderStatus;
  tracking: { label: string; date: string; done: boolean }[];
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  joined: string;
  orders: number;
  spent: number;
  city: string;
};

export type User = {
  name: string;
  email: string;
  phone: string;
};

export const ADMIN_CREDENTIALS = {
  email: "admin@gsmilesignature.com",
  password: "admin123",
  name: "Admin User",
};

type Toast = { id: number; message: string };

type StoreState = {
  products: EditableProduct[];
  categories: EditableCategory[];
  testimonials: EditableTestimonial[];
  faqs: EditableFaq[];
  coupons: Coupon[];
  content: ContentData;
  settings: AppSettings;
  customers: Customer[];
  subscribers: { email: string; date: string }[];
  cart: CartItem[];
  wishlist: EditableProduct[];
  user: User | null;
  orders: Order[];
  toasts: Toast[];
  isOnline: boolean;
  addToCart: (p: EditableProduct | Product, opts?: { color?: string; size?: string; qty?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  toggleWishlist: (p: EditableProduct | Product) => void;
  inWishlist: (id: string) => boolean;
  login: (email: string, name?: string) => void;
  register: (u: User) => void;
  logout: () => void;
  admin: boolean;
  adminLogin: (email: string, password: string) => boolean;
  adminLogout: () => void;
  placeOrder: (o: Omit<Order, "id" | "date" | "status" | "tracking" | "customerEmail" | "customerName" | "customerPhone" | "paymentProof" | "paymentConfirmedAt" | "trackingNumber" | "adminNotes" | "invoiceNumber" | "invoiceGeneratedAt">) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  uploadPaymentProof: (orderId: string, proof: string) => void;
  confirmPayment: (orderId: string) => void;
  updateOrderAdminNotes: (orderId: string, notes: string) => void;
  updateOrderTrackingNumber: (orderId: string, trackingNumber: string) => void;
  generateOrderInvoice: (orderId: string) => void;
  upsertProduct: (p: EditableProduct) => void;
  deleteProduct: (id: string) => void;
  upsertCategory: (c: EditableCategory) => void;
  deleteCategory: (slug: string) => void;
  upsertTestimonial: (t: EditableTestimonial) => void;
  deleteTestimonial: (id: string) => void;
  upsertFaq: (f: EditableFaq) => void;
  deleteFaq: (id: string) => void;
  upsertCoupon: (c: Coupon) => void;
  deleteCoupon: (id: string) => void;
  toggleCoupon: (id: string) => void;
  updateContent: (c: Partial<ContentData>) => void;
  updateSettings: (s: Partial<AppSettings>) => void;
  updatePaymentAccounts: (accounts: PaymentAccount[]) => void;
  subscribeNewsletter: (email: string) => void;
  toast: (message: string) => void;
};

const StoreContext = createContext<StoreState | null>(null);

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function clientInfo() {
  return {
    userAgent: navigator.userAgent,
    url: window.location.href,
  };
}

const seedCustomers: Customer[] = [
  { id: "cu1", name: "Adaeze Okonkwo", email: "adaeze@email.com", phone: "+234 802 000 0001", joined: "2024-03-12", orders: 5, spent: 720000, city: "Lagos" },
  { id: "cu2", name: "Tunde Bakare", email: "tunde@email.com", phone: "+234 803 000 0002", joined: "2024-08-03", orders: 3, spent: 468000, city: "Abuja" },
  { id: "cu3", name: "Chidinma Eze", email: "chidinma@email.com", phone: "+234 806 000 0003", joined: "2023-11-22", orders: 8, spent: 1240000, city: "Port Harcourt" },
  { id: "cu4", name: "Ngozi Adeyemi", email: "ngozi@email.com", phone: "+234 807 000 0004", joined: "2025-01-08", orders: 2, spent: 203000, city: "Ibadan" },
  { id: "cu5", name: "Samuel Ibrahim", email: "samuel@email.com", phone: "+234 809 000 0005", joined: "2025-05-14", orders: 4, spent: 589000, city: "Kano" },
];

const seedOrders: Order[] = [
  {
    id: "GS-10428", date: "2026-05-14",
    customerEmail: "adaeze@email.com", customerName: "Adaeze Okonkwo", customerPhone: "+234 802 000 0001",
    items: [{ name: "The Aurelia Top-Handle", qty: 1, price: 145000, image: "/images/product-1.jpg" }],
    subtotal: 145000, shippingCost: 2500, discount: 0, total: 147500,
    paymentMethod: "Bank Transfer", paymentConfirmedAt: "2026-05-14", status: "Delivered",
    shipping: { address: "12 Admiralty Way", city: "Lekki", state: "Lagos" },
    tracking: [
      { label: "Order placed", date: "May 14", done: true },
      { label: "Processing", date: "May 14", done: true },
      { label: "Shipped", date: "May 15", done: true },
      { label: "Delivered", date: "May 16", done: true },
    ],
  },
  {
    id: "GS-10455", date: "2026-06-02",
    customerEmail: "tunde@email.com", customerName: "Tunde Bakare", customerPhone: "+234 803 000 0002",
    items: [
      { name: "Voyager Leather Weekender", qty: 1, price: 168000, image: "/images/category-travel.jpg" },
      { name: "Celeste Mini Crossbody", qty: 1, price: 86000, image: "/images/category-handbags.jpg" },
    ],
    subtotal: 254000, shippingCost: 0, discount: 25400, total: 228600,
    paymentMethod: "Bank Transfer", paymentConfirmedAt: "2026-06-02", status: "Shipped",
    shipping: { address: "45 Central District", city: "Wuse", state: "Abuja" },
    tracking: [
      { label: "Order placed", date: "Jun 2", done: true },
      { label: "Processing", date: "Jun 2", done: true },
      { label: "Shipped", date: "Jun 3", done: true },
      { label: "Delivered", date: "—", done: false },
    ],
  },
  {
    id: "GS-10471", date: "2026-06-08",
    customerEmail: "chidinma@email.com", customerName: "Chidinma Eze", customerPhone: "+234 806 000 0003",
    items: [{ name: "Noir Quilted Shoulder", qty: 1, price: 132000, image: "/images/category-luxury.jpg" }],
    subtotal: 132000, shippingCost: 5000, discount: 0, total: 137000,
    paymentMethod: "Bank Transfer", paymentConfirmedAt: "2026-06-08", status: "Processing",
    shipping: { address: "8 Aba Road", city: "Port Harcourt", state: "Rivers" },
    tracking: [
      { label: "Order placed", date: "Jun 8", done: true },
      { label: "Processing", date: "Jun 8", done: true },
      { label: "Shipped", date: "—", done: false },
      { label: "Delivered", date: "—", done: false },
    ],
  },
  {
    id: "GS-10489", date: "2026-06-10",
    customerEmail: "samuel@email.com", customerName: "Samuel Ibrahim", customerPhone: "+234 809 000 0005",
    items: [{ name: "Boardroom Briefcase", qty: 1, price: 156000, image: "/images/category-corporate.jpg" }],
    subtotal: 156000, shippingCost: 5000, discount: 0, total: 161000,
    paymentMethod: "Bank Transfer", status: "Awaiting Payment",
    shipping: { address: "22 Ibrahim Taiwo Rd", city: "Kano", state: "Kano" },
    tracking: [
      { label: "Order placed", date: "Jun 10", done: true },
      { label: "Processing", date: "—", done: false },
      { label: "Shipped", date: "—", done: false },
      { label: "Delivered", date: "—", done: false },
    ],
  },
];

export function StoreProvider({ children }: { children: ReactNode }) {
  // synced data (Firebase + localStorage)
  const [products, setProducts] = useState<EditableProduct[]>(() => load("gs_products", defaultProducts));
  const [categories, setCategories] = useState<EditableCategory[]>(() => load("gs_categories", defaultCategories));
  const [testimonials, setTestimonials] = useState<EditableTestimonial[]>(() => load("gs_testimonials", defaultTestimonials));
  const [faqs, setFaqs] = useState<EditableFaq[]>(() => load("gs_faqs", defaultFaqs));
  const [coupons, setCoupons] = useState<Coupon[]>(() => load("gs_coupons", defaultCoupons));
  const [content, setContent] = useState<ContentData>(() => load("gs_content", defaultContent));
  const [settings, setSettings] = useState<AppSettings>(() => load("gs_settings", defaultSettings));
  const [orders, setOrders] = useState<Order[]>(() => load("gs_orders", seedOrders));
  const [subscribers, setSubscribers] = useState<{ email: string; date: string }[]>(() => load("gs_subscribers", []));
  const [isOnline, setIsOnline] = useState(firebaseEnabled && navigator.onLine);

  // local-only data
  const [customers] = useState<Customer[]>(() => load("gs_customers", seedCustomers));
  const [cart, setCart] = useState<CartItem[]>(() => load("gs_cart", []));
  const [wishlist, setWishlist] = useState<EditableProduct[]>(() => load("gs_wishlist", []));
  const [user, setUser] = useState<User | null>(() => load("gs_user", null));
  const [admin, setAdmin] = useState<boolean>(() => load("gs_admin", false));
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Firebase real-time sync subscriptions
  useEffect(() => {
    const subs = [
      subscribe<EditableProduct[]>(SYNC_PATHS.products, (data) => {
        if (data) { setProducts(data); save("gs_products", data); }
      }),
      subscribe<EditableCategory[]>(SYNC_PATHS.categories, (data) => {
        if (data) { setCategories(data); save("gs_categories", data); }
      }),
      subscribe<EditableTestimonial[]>(SYNC_PATHS.testimonials, (data) => {
        if (data) { setTestimonials(data); save("gs_testimonials", data); }
      }),
      subscribe<EditableFaq[]>(SYNC_PATHS.faqs, (data) => {
        if (data) { setFaqs(data); save("gs_faqs", data); }
      }),
      subscribe<Coupon[]>(SYNC_PATHS.coupons, (data) => {
        if (data) { setCoupons(data); save("gs_coupons", data); }
      }),
      subscribe<ContentData>(SYNC_PATHS.content, (data) => {
        if (data) { setContent(data); save("gs_content", data); }
      }),
      subscribe<AppSettings>(SYNC_PATHS.settings, (data) => {
        if (data) { setSettings(data); save("gs_settings", data); }
      }),
      subscribe<Order[]>(SYNC_PATHS.orders, (data) => {
        if (data) { setOrders(data); save("gs_orders", data); }
      }),
      subscribe<{ email: string; date: string }[]>(SYNC_PATHS.subscribers, (data) => {
        if (data) { setSubscribers(data); save("gs_subscribers", data); }
      }),
    ];

    const onOnline = () => setIsOnline(firebaseEnabled);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    setIsOnline(firebaseEnabled && navigator.onLine);

    // initial push of local data to Firebase if Firebase is empty (first setup)
    // This is handled by the admin dashboard manually or by a one-time seed
    return () => {
      subs.forEach((unsub) => unsub());
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // sync helpers
  const syncUpdate = useCallback(<T,>(path: string, setter: (v: T) => void, key: string, value: T) => {
    setter(value as T);
    save(key, value);
    if (firebaseEnabled && navigator.onLine) {
      setValue(path, value)
        .then(() => logEvent(`${SYNC_PATHS.logs}/edits`, { path, key, ...clientInfo() }))
        .catch(() => setIsOnline(false));
    }
  }, []);

  const toast = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  // cart
  const addToCart: StoreState["addToCart"] = useCallback(
    (p, opts) => {
      const ep = p as EditableProduct;
      const color = opts?.color ?? ep.colors?.[0] ?? "Black";
      const size = opts?.size ?? ep.sizes?.[0] ?? "One Size";
      const qty = opts?.qty ?? 1;
      const key = `${ep.id}-${color}-${size}`;
      setCart((c) => {
        const found = c.find((i) => i.id === key);
        if (found) return c.map((i) => (i.id === key ? { ...i, qty: i.qty + qty } : i));
        return [...c, { id: key, productId: ep.id, product: ep, qty, color, size }];
      });
      toast(`${ep.name} added to cart`);
    },
    [toast]
  );
  const removeFromCart = useCallback((id: string) => setCart((c) => c.filter((i) => i.id !== id)), []);
  const updateQty = useCallback((id: string, qty: number) => setCart((c) => c.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))), []);
  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartSubtotal = cart.reduce((s, i) => s + i.qty * i.product.price, 0);

  const toggleWishlist: StoreState["toggleWishlist"] = useCallback(
    (p) => {
      const ep = p as EditableProduct;
      setWishlist((w) => {
        if (w.find((x) => x.id === ep.id)) {
          toast(`${ep.name} removed from wishlist`);
          return w.filter((x) => x.id !== ep.id);
        }
        toast(`${ep.name} added to wishlist`);
        return [...w, ep];
      });
    },
    [toast]
  );
  const inWishlist = useCallback((id: string) => wishlist.some((x) => x.id === id), [wishlist]);

  // auth
  const login = useCallback((email: string, name?: string) => {
    setUser({ name: name || email.split("@")[0], email, phone: "" });
    logEvent(`${SYNC_PATHS.logs}/logins`, { type: "customer", email, name: name || email.split("@")[0], ...clientInfo() }).catch(() => undefined);
    toast("Welcome back to G-Smile Signature");
  }, [toast]);
  const register = useCallback((u: User) => {
    setUser(u);
    logEvent(`${SYNC_PATHS.logs}/logins`, { type: "registration", email: u.email, name: u.name, ...clientInfo() }).catch(() => undefined);
    toast("Account created successfully");
  }, [toast]);
  const logout = useCallback(() => { setUser(null); toast("You have been logged out"); }, [toast]);

  const adminLogin = useCallback((email: string, password: string): boolean => {
    if (email.toLowerCase() === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      setAdmin(true);
      save("gs_admin", true);
      setUser({ name: ADMIN_CREDENTIALS.name, email, phone: "" });
      logEvent(`${SYNC_PATHS.logs}/logins`, { type: "admin", email, name: ADMIN_CREDENTIALS.name, ...clientInfo() }).catch(() => undefined);
      toast("Admin access granted");
      return true;
    }
    toast("Invalid admin credentials");
    return false;
  }, [toast]);
  const adminLogout = useCallback(() => {
    setAdmin(false);
    save("gs_admin", false);
    toast("Signed out of admin");
  }, [toast]);

  // orders
  const placeOrder: StoreState["placeOrder"] = useCallback((o) => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const order: Order = {
      ...o,
      id: "GS-" + Math.floor(10000 + Math.random() * 89999),
      date,
      status: "Awaiting Payment",
      customerEmail: "", customerName: "", customerPhone: "",
      tracking: [
        { label: "Order placed", date: "Just now", done: true },
        { label: "Awaiting Payment", date: "Just now", done: true },
        { label: "Payment Confirmed", date: "—", done: false },
        { label: "Processing", date: "—", done: false },
        { label: "Shipped", date: "—", done: false },
        { label: "Delivered", date: "—", done: false },
      ],
    };
    const newOrders = [order, ...orders];
    syncUpdate(SYNC_PATHS.orders, setOrders, "gs_orders", newOrders);
    logEvent(`${SYNC_PATHS.logs}/sales`, {
      orderId: order.id,
      total: order.total,
      itemCount: order.items.reduce((sum, item) => sum + item.qty, 0),
      paymentMethod: order.paymentMethod,
      status: order.status,
      ...clientInfo(),
    }).catch(() => undefined);
    
    // Trigger Order Confirmation Email
    if (order.customerEmail) {
      const emailPayload = generateEmail('order-confirmation', {
        email: order.customerEmail,
        customerName: order.customerName,
        orderId: order.id,
        total: formatNaira(order.total),
        itemCount: order.items.reduce((sum, item) => sum + item.qty, 0),
        trackUrl: `${window.location.origin}/track?order=${order.id}`,
      });
      sendTransactionalEmail(emailPayload);
    }

    setCart([]);
    toast("Order placed! Please complete your bank transfer.");
    return order;
  }, [orders, syncUpdate, toast]);

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((os) => {
      const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      const updated = os.map((o) => {
        if (o.id !== id) return o;
        const tracking = o.tracking.map((t) => {
          const done = (label: string) => {
            const flow: OrderStatus[] = ["Awaiting Payment", "Payment Confirmed", "Processing", "Shipped", "Delivered"];
            const statusIdx = flow.indexOf(status);
            const labelIdx = flow.indexOf(label as OrderStatus);
            return labelIdx >= 0 && statusIdx >= 0 && labelIdx <= statusIdx;
          };
          if (done(t.label)) return { ...t, done: true, date: t.date === "—" ? today : t.date };
          return t;
        });
        const extra: Partial<Order> = {};
        if (status === "Payment Confirmed") extra.paymentConfirmedAt = today;
        const finalOrder = { ...o, ...extra, status, tracking };
        
        // Trigger Order Shipped Email
        if (status === "Shipped" && finalOrder.customerEmail) {
          const emailPayload = generateEmail('order-shipped', {
            email: finalOrder.customerEmail,
            customerName: finalOrder.customerName,
            orderId: finalOrder.id,
            trackingNumber: finalOrder.trackingNumber || 'N/A',
            trackUrl: `${window.location.origin}/track?order=${finalOrder.id}`,
          });
          sendTransactionalEmail(emailPayload);
        }
        
        return finalOrder;
      });
      syncUpdate(SYNC_PATHS.orders, setOrders, "gs_orders", updated);
      toast(`Order ${id} → ${status}`);
      return updated;
    });
  }, [syncUpdate, toast]);

  const uploadPaymentProof = useCallback((orderId: string, proof: string) => {
    setOrders((os) => {
      const updated = os.map((o) => o.id === orderId ? { ...o, paymentProof: proof } : o);
      syncUpdate(SYNC_PATHS.orders, setOrders, "gs_orders", updated);
      toast("Payment proof uploaded successfully");
      return updated;
    });
  }, [syncUpdate, toast]);

  const confirmPayment = useCallback((orderId: string) => {
    const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    setOrders((os) => {
      const updated = os.map((o) => {
        if (o.id !== orderId) return o;
        const tracking = o.tracking.map((t) => {
          if (t.label === "Payment Confirmed") return { ...t, done: true, date: today };
          if (t.label === "Processing") return { ...t, done: true, date: today };
          return t;
        });
        const finalOrder = { ...o, status: "Processing" as OrderStatus, paymentConfirmedAt: today, tracking };
        
        // Trigger Payment Received Email
        if (finalOrder.customerEmail) {
          const emailPayload = generateEmail('payment-received', {
            email: finalOrder.customerEmail,
            customerName: finalOrder.customerName,
            orderId: finalOrder.id,
            trackUrl: `${window.location.origin}/track?order=${finalOrder.id}`,
          });
          sendTransactionalEmail(emailPayload);
        }
        
        return finalOrder;
      });
      syncUpdate(SYNC_PATHS.orders, setOrders, "gs_orders", updated);
      toast(`Payment confirmed for ${orderId} — order moved to Processing`);
      return updated;
    });
  }, [syncUpdate, toast]);

  const updateOrderAdminNotes = useCallback((orderId: string, notes: string) => {
    setOrders((os) => {
      const updated = os.map((o) => o.id === orderId ? { ...o, adminNotes: notes } : o);
      syncUpdate(SYNC_PATHS.orders, setOrders, "gs_orders", updated);
      toast("Admin notes updated");
      return updated;
    });
  }, [syncUpdate, toast]);

  const updateOrderTrackingNumber = useCallback((orderId: string, trackingNumber: string) => {
    setOrders((os) => {
      const updated = os.map((o) => o.id === orderId ? { ...o, trackingNumber } : o);
      syncUpdate(SYNC_PATHS.orders, setOrders, "gs_orders", updated);
      toast("Tracking number updated");
      return updated;
    });
  }, [syncUpdate, toast]);

  const generateOrderInvoice = useCallback((orderId: string) => {
    const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    setOrders((os) => {
      const updated = os.map((o) => o.id === orderId ? {
        ...o,
        invoiceNumber: `INV-${o.id.split("-")[1] || Math.floor(1000 + Math.random() * 9000)}`,
        invoiceGeneratedAt: today
      } : o);
      syncUpdate(SYNC_PATHS.orders, setOrders, "gs_orders", updated);
      toast("Invoice generated successfully");
      return updated;
    });
  }, [syncUpdate, toast]);

  // product CRUD
  const upsertProduct = useCallback((p: EditableProduct) => {
    const next = products.find((x) => x.id === p.id)
      ? products.map((x) => (x.id === p.id ? p : x))
      : [p, ...products];
    syncUpdate(SYNC_PATHS.products, setProducts, "gs_products", next);
    toast(p.id ? "Product updated" : "Product added");
  }, [products, syncUpdate, toast]);
  const deleteProduct = useCallback((id: string) => {
    const next = products.filter((p) => p.id !== id);
    syncUpdate(SYNC_PATHS.products, setProducts, "gs_products", next);
    toast("Product deleted");
  }, [products, syncUpdate, toast]);

  // category CRUD
  const upsertCategory = useCallback((c: EditableCategory) => {
    const next = categories.find((x) => x.slug === c.slug)
      ? categories.map((x) => (x.slug === c.slug ? c : x))
      : [...categories, c];
    syncUpdate(SYNC_PATHS.categories, setCategories, "gs_categories", next);
    toast("Category saved");
  }, [categories, syncUpdate, toast]);
  const deleteCategory = useCallback((slug: string) => {
    const next = categories.filter((c) => c.slug !== slug);
    syncUpdate(SYNC_PATHS.categories, setCategories, "gs_categories", next);
    toast("Category deleted");
  }, [categories, syncUpdate, toast]);

  // testimonial CRUD
  const upsertTestimonial = useCallback((t: EditableTestimonial) => {
    const next = testimonials.find((x) => x.id === t.id)
      ? testimonials.map((x) => (x.id === t.id ? t : x))
      : [...testimonials, t];
    syncUpdate(SYNC_PATHS.testimonials, setTestimonials, "gs_testimonials", next);
    toast("Testimonial saved");
  }, [testimonials, syncUpdate, toast]);
  const deleteTestimonial = useCallback((id: string) => {
    const next = testimonials.filter((t) => t.id !== id);
    syncUpdate(SYNC_PATHS.testimonials, setTestimonials, "gs_testimonials", next);
    toast("Testimonial removed");
  }, [testimonials, syncUpdate, toast]);

  // faq CRUD
  const upsertFaq = useCallback((f: EditableFaq) => {
    const next = faqs.find((x) => x.id === f.id)
      ? faqs.map((x) => (x.id === f.id ? f : x))
      : [...faqs, f];
    syncUpdate(SYNC_PATHS.faqs, setFaqs, "gs_faqs", next);
    toast("FAQ saved");
  }, [faqs, syncUpdate, toast]);
  const deleteFaq = useCallback((id: string) => {
    const next = faqs.filter((f) => f.id !== id);
    syncUpdate(SYNC_PATHS.faqs, setFaqs, "gs_faqs", next);
    toast("FAQ deleted");
  }, [faqs, syncUpdate, toast]);

  // coupon CRUD
  const upsertCoupon = useCallback((c: Coupon) => {
    const next = coupons.find((x) => x.id === c.id)
      ? coupons.map((x) => (x.id === c.id ? c : x))
      : [c, ...coupons];
    syncUpdate(SYNC_PATHS.coupons, setCoupons, "gs_coupons", next);
    toast("Coupon saved");
  }, [coupons, syncUpdate, toast]);
  const deleteCoupon = useCallback((id: string) => {
    const next = coupons.filter((c) => c.id !== id);
    syncUpdate(SYNC_PATHS.coupons, setCoupons, "gs_coupons", next);
    toast("Coupon deleted");
  }, [coupons, syncUpdate, toast]);
  const toggleCoupon = useCallback((id: string) => {
    const next = coupons.map((c) => (c.id === id ? { ...c, active: !c.active } : c));
    syncUpdate(SYNC_PATHS.coupons, setCoupons, "gs_coupons", next);
  }, [coupons, syncUpdate]);

  const updateContent = useCallback((c: Partial<ContentData>) => {
    const next = { ...content, ...c };
    syncUpdate(SYNC_PATHS.content, setContent, "gs_content", next);
    toast("Content updated");
  }, [content, syncUpdate, toast]);

  const updateSettings = useCallback((s: Partial<AppSettings>) => {
    const next = { ...settings, ...s };
    syncUpdate(SYNC_PATHS.settings, setSettings, "gs_settings", next);
    toast("Settings updated");
  }, [settings, syncUpdate, toast]);

  const updatePaymentAccounts = useCallback((accounts: PaymentAccount[]) => {
    const next = { ...settings, paymentAccounts: accounts };
    syncUpdate(SYNC_PATHS.settings, setSettings, "gs_settings", next);
    toast("Payment accounts updated");
  }, [settings, syncUpdate, toast]);

  const subscribeNewsletter = useCallback((email: string) => {
    setSubscribers((subs) => {
      if (subs.find((s) => s.email === email)) return subs;
      const next = [{ email, date: new Date().toISOString() }, ...subs];
      syncUpdate(SYNC_PATHS.subscribers, setSubscribers, "gs_subscribers", next);
      return next;
    });
    toast("You're subscribed! Welcome to the circle.");
  }, [syncUpdate, toast]);

  // persist local-only data
  useEffect(() => save("gs_cart", cart), [cart]);
  useEffect(() => save("gs_wishlist", wishlist), [wishlist]);
  useEffect(() => save("gs_user", user), [user]);
  useEffect(() => save("gs_admin", admin), [admin]);

  // sync wishlist/cart with current products
  useEffect(() => {
    setWishlist((w) => w.filter((x) => products.find((p) => p.id === x.id)));
    setCart((c) => c.filter((x) => products.find((p) => p.id === x.productId)));
  }, [products]);

  return (
    <StoreContext.Provider
      value={{
        products, categories, testimonials, faqs, coupons, content, settings, customers, subscribers,
        cart, wishlist, user, orders, toasts, isOnline,
        addToCart, removeFromCart, updateQty, clearCart,
        cartCount, cartSubtotal, toggleWishlist, inWishlist,
        login, register, logout,
        admin, adminLogin, adminLogout,
        placeOrder, updateOrderStatus, uploadPaymentProof, confirmPayment,
        updateOrderAdminNotes, updateOrderTrackingNumber, generateOrderInvoice,
        upsertProduct, deleteProduct,
        upsertCategory, deleteCategory,
        upsertTestimonial, deleteTestimonial,
        upsertFaq, deleteFaq,
        upsertCoupon, deleteCoupon, toggleCoupon,
        updateContent,
        updateSettings,
        updatePaymentAccounts,
        subscribeNewsletter,
        toast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
