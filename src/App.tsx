import { useEffect, useState } from "react";
import { StoreProvider, useStore } from "./store/StoreContext";
import { useRouter } from "./store/useRouter";
import type { Product } from "./data/products";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { QuickView, Toasts, WhatsAppButton } from "./components/Overlays";
import { Home } from "./pages/Home";
import { Shop } from "./pages/Shop";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { About } from "./pages/About";
import { Contact } from "./pages/Contact";
import { FAQ } from "./pages/FAQ";
import { TrackOrder } from "./pages/TrackOrder";
import { Auth } from "./pages/Auth";
import { Wishlist } from "./pages/Wishlist";
import { Dashboard } from "./pages/Dashboard";
import { Admin } from "./pages/Admin";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminThemeProvider } from "./components/AdminTheme";
import { SiteThemeProvider } from "./components/SiteTheme";
import { logEvent, SYNC_PATHS } from "./firebase/sync";

function Shell() {
  const { route } = useRouter();
  const [quickView, setQuickView] = useState<Product | null>(null);

  const path = route.path;
  const isAdmin = path.startsWith("/admin");
  const isAuth = path === "/login" || path === "/register" || path === "/forgot";

  const { products } = useStore();

  useEffect(() => {
    logEvent(`${SYNC_PATHS.logs}/visits`, {
      path: route.path,
      query: route.query,
      url: window.location.href,
      referrer: document.referrer || "direct",
      userAgent: navigator.userAgent,
    }).catch(() => undefined);

    // Dynamic SEO Titles
    let title = "G-Smile Signature | Premium Luxury Bags";
    if (route.path === "/shop") title = "Shop All | G-Smile Signature";
    else if (route.path.startsWith("/product/")) {
      const p = products.find((p: any) => p.id === route.path.split("/product/")[1]);
      if (p) title = `${p.name} | G-Smile Signature`;
    }
    else if (route.path === "/cart") title = "Shopping Cart | G-Smile Signature";
    else if (route.path === "/checkout") title = "Checkout | G-Smile Signature";
    else if (route.path === "/about") title = "Our Story | G-Smile Signature";
    else if (route.path === "/contact") title = "Contact Us | G-Smile Signature";
    else if (route.path === "/faq") title = "Help & FAQ | G-Smile Signature";
    else if (route.path === "/wishlist") title = "My Wishlist | G-Smile Signature";
    else if (route.path === "/dashboard") title = "My Account | G-Smile Signature";
    
    document.title = title;
  }, [route.path, route.query, products]);

  let page;
  if (path === "/") page = <Home onQuickView={setQuickView} />;
  else if (path === "/shop") page = <Shop onQuickView={setQuickView} />;
  else if (path.startsWith("/product/")) page = <ProductDetail onQuickView={setQuickView} />;
  else if (path === "/cart") page = <Cart />;
  else if (path === "/checkout") page = <Checkout />;
  else if (path === "/about") page = <About />;
  else if (path === "/contact") page = <Contact />;
  else if (path === "/faq") page = <FAQ />;
  else if (path === "/track") page = <TrackOrder />;
  else if (path === "/wishlist") page = <Wishlist onQuickView={setQuickView} />;
  else if (path === "/dashboard") page = <Dashboard onQuickView={setQuickView} />;
  else if (path === "/login") page = <Auth initial="login" />;
  else if (path === "/register") page = <Auth initial="register" />;
  else if (path === "/forgot") page = <Auth initial="forgot" />;
  else if (path === "/admin-login") page = <AdminLogin />;
  else if (isAdmin) page = <Admin />;
  else page = <Home onQuickView={setQuickView} />;

  if (isAdmin || path === "/admin-login") {
    return (
      <AdminThemeProvider>
        {page}
        <Toasts />
      </AdminThemeProvider>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {!isAuth && <Header />}
      <main className="flex-1">{page}</main>
      {!isAuth && <Footer />}
      <QuickView product={quickView} onClose={() => setQuickView(null)} />
      {!isAuth && <WhatsAppButton />}
      <Toasts />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <SiteThemeProvider>
        <Shell />
      </SiteThemeProvider>
    </StoreProvider>
  );
}
