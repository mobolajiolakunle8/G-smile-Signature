import { useState } from "react";
import { navigate } from "../store/useRouter";
import { Icon } from "./Icons";
import { CONTACT } from "../data/content";
import { categories } from "../data/products";
import { useStore } from "../store/StoreContext";


export function Footer() {
  const { settings, subscribeNewsletter } = useStore();
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-ink text-white/70">
      {/* newsletter */}
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <h3 className="font-display text-2xl font-semibold text-white sm:text-3xl">
              Join the G-Smile circle
            </h3>
            <p className="mt-2 max-w-md text-sm text-white/60">
              Subscribe for early access to new arrivals, private sales and styling inspiration.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) {
                subscribeNewsletter(email);
                setEmail("");
              }
            }}
            className="flex w-full max-w-md lg:ml-auto"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border border-white/20 bg-transparent px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-gold"
            />
            <button className="bg-gold px-6 text-xs font-semibold uppercase tracking-widest text-ink transition-colors hover:bg-white">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* links */}
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          {settings.logo ? (
            <img src={settings.logo} alt="G-Smile Signature" className="h-10 w-auto object-contain" />
          ) : (
            <h4 className="font-display text-xl font-bold text-white">
              G-Smile <span className="text-gold">Signature</span>
            </h4>
          )}
          <p className="mt-4 text-sm leading-relaxed text-white/55">
            Premium bags crafted for work, travel and everyday sophistication. Elegance you can carry, quality you can trust.
          </p>
          <div className="mt-5 flex gap-3">
            {[
              { i: Icon.instagram, l: "Instagram" },
              { i: Icon.facebook, l: "Facebook" },
              { i: Icon.twitter, l: "Twitter" },
              { i: Icon.whatsapp, l: "WhatsApp" },
            ].map(({ i: I, l }) => (
              <a
                key={l}
                href={l === "WhatsApp" ? `https://wa.me/${CONTACT.whatsapp}` : "#"}
                aria-label={l}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-gold hover:bg-gold hover:text-ink"
              >
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h5 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white">Quick Links</h5>
          <ul className="space-y-2.5 text-sm">
            {[
              ["Shop All", "/shop"],
              ["About Us", "/about"],
              ["Contact", "/contact"],
              ["FAQ", "/faq"],
              ["Track Order", "/track"],
              ["My Account", "/login"],
            ].map(([l, p]) => (
              <li key={p}>
                <button onClick={() => navigate(p)} className="transition-colors hover:text-gold">
                  {l}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white">Categories</h5>
          <ul className="space-y-2.5 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <button onClick={() => navigate(`/shop?category=${c.slug}`)} className="transition-colors hover:text-gold">
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white">Get in Touch</h5>
          <ul className="space-y-3.5 text-sm">
            <li className="flex items-start gap-3">
              <Icon.phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <a href={`tel:${CONTACT.phone}`} className="hover:text-gold">{CONTACT.phoneDisplay}</a>
            </li>
            <li className="flex items-start gap-3">
              <Icon.mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <a href={`mailto:${CONTACT.email}`} className="break-all hover:text-gold">{CONTACT.email}</a>
            </li>
            <li className="flex items-start gap-3">
              <Icon.pin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>{CONTACT.address}</span>
            </li>
          </ul>
          <div className="mt-5">
            <span className="border border-white/15 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/60">
              Bank Transfer
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-white/40 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} G-Smile Signature. All rights reserved.</p>
          <p className="flex items-center gap-4">
            <span className="hover:text-gold">Privacy Policy</span>
            <span className="hover:text-gold">Terms of Service</span>
            <button
              onClick={() => navigate("/admin-login")}
              aria-label="Admin"
              title="Admin"
              className="grid h-7 w-7 place-items-center rounded-full text-white/10 transition-colors hover:text-gold"
            >
              <Icon.shield className="h-3.5 w-3.5" />
            </button>
          </p>
        </div>
      </div>
    </footer>
  );
}
