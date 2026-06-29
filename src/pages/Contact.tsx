import { useState } from "react";
import { useStore } from "../store/StoreContext";
import { Button, Input, SectionTitle } from "../components/ui";
import { Icon } from "../components/Icons";
import { CONTACT } from "../data/content";

export function Contact() {
  const { toast } = useStore();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="border-b border-cream bg-cream/40">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Get in Touch</p>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Contact Us</h1>
          <p className="mx-auto mt-3 max-w-lg text-ink/60">We'd love to hear from you. Reach out and our concierge team will respond within 24 hours.</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* info */}
          <div>
            <SectionTitle eyebrow="Reach Us" title="Let's talk bags" />
            <div className="mt-8 space-y-5">
              {[
                { icon: Icon.phone, label: "Phone", value: CONTACT.phoneDisplay, href: `tel:${CONTACT.phone}` },
                { icon: Icon.mail, label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
                { icon: Icon.pin, label: "Location", value: CONTACT.address },
              ].map((c) => (
                <a key={c.label} href={c.href} className="flex items-start gap-4 group">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold/15 text-gold transition-colors group-hover:bg-gold group-hover:text-white">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-ash">{c.label}</p>
                    <p className="mt-0.5 font-medium text-ink group-hover:text-gold">{c.value}</p>
                  </div>
                </a>
              ))}
            </div>
            <a
              href={`https://wa.me/${CONTACT.whatsapp}?text=Hello%20G-Smile%20Signature`}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 bg-[#25D366] px-6 py-3.5 text-sm font-semibold uppercase tracking-widest text-white transition-transform hover:scale-105"
            >
              <Icon.whatsapp className="h-5 w-5" /> Chat on WhatsApp
            </a>

            {/* map */}
            <div className="mt-8 overflow-hidden border border-cream">
              <iframe
                title="G-Smile Signature Location"
                src="https://www.google.com/maps?q=Lagos,Nigeria&output=embed"
                width="100%"
                height="280"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* form */}
          <div className="bg-cream/50 p-8 lg:p-10">
            <h3 className="font-display text-2xl font-semibold">Send a Message</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast("Message sent! We'll get back to you soon.");
                setForm({ name: "", email: "", subject: "", message: "" });
              }}
              className="mt-6 space-y-4"
            >
              <Input label="Full Name" value={form.name} onChange={set("name")} required placeholder="Jane Doe" />
              <Input label="Email" type="email" value={form.email} onChange={set("email")} required placeholder="you@email.com" />
              <Input label="Subject" value={form.subject} onChange={set("subject")} placeholder="How can we help?" />
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink/60">Message</span>
                <textarea
                  value={form.message}
                  onChange={(e) => set("message")(e.target.value)}
                  required
                  rows={5}
                  placeholder="Your message..."
                  className="w-full border border-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-gold"
                />
              </label>
              <Button type="submit" variant="dark" className="w-full">Send Message</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
