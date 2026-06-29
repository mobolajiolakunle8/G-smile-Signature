import { useState } from "react";
import { CONTACT } from "../data/content";
import { useStore } from "../store/StoreContext";
import { Icon } from "../components/Icons";
import { Button } from "../components/ui";
import { navigate } from "../store/useRouter";
import { cn } from "../utils/cn";

export function FAQ() {
  const { faqs } = useStore();
  const grouped: Record<string, { q: string; a: string }[]> = {};
  faqs.forEach((f) => {
    (grouped[f.category] = grouped[f.category] || []).push({ q: f.q, a: f.a });
  });
  const [open, setOpen] = useState<string | null>(Object.keys(grouped)[0] ? `${Object.keys(grouped)[0]}-0` : null);

  return (
    <div>
      <div className="border-b border-cream bg-cream/40">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Help Center</p>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Frequently Asked Questions</h1>
          <p className="mx-auto mt-3 max-w-lg text-ink/60">Everything you need to know about ordering, delivery and caring for your G-Smile bag.</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="mb-10">
            <h2 className="mb-4 font-display text-xl font-semibold text-gold">{cat}</h2>
            <div className="space-y-3">
              {items.map((item, i) => {
                const key = `${cat}-${i}`;
                const isOpen = open === key;
                return (
                  <div key={key} className="border border-cream">
                    <button
                      onClick={() => setOpen(isOpen ? null : key)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="font-medium text-ink">{item.q}</span>
                      <Icon.plus className={cn("h-4 w-4 shrink-0 text-gold transition-transform", isOpen && "rotate-45")} />
                    </button>
                    <div className={cn("grid overflow-hidden transition-all duration-300", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm leading-relaxed text-ink/65">{item.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-10 bg-ink p-8 text-center text-white">
          <h3 className="font-display text-2xl font-semibold">Still have questions?</h3>
          <p className="mt-2 text-white/60">Our team is here to help, 7 days a week.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="gold" onClick={() => navigate("/contact")}>Contact Us</Button>
            <a href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-white/30 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white hover:bg-white hover:text-ink">
              <Icon.whatsapp className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
