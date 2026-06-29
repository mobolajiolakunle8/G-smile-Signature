import { SectionTitle, Button } from "../components/ui";
import { Icon } from "../components/Icons";
import { team } from "../data/content";
import { navigate } from "../store/useRouter";

const values = [
  { title: "Craftsmanship", desc: "Every stitch is intentional. We partner with master artisans who treat leather as art.", icon: Icon.gem },
  { title: "Integrity", desc: "Honest pricing, honest materials. What you see is exactly what you carry.", icon: Icon.shield },
  { title: "Service", desc: "From first click to delivery, we obsess over your experience.", icon: Icon.headset },
];

export function About() {
  return (
    <div>
      {/* hero */}
      <section className="relative h-72 overflow-hidden bg-ink sm:h-96">
        <img src="/images/about.jpg" alt="Craftsmanship" className="h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 grid place-items-center text-center text-white">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Our Story</p>
            <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">About G-Smile Signature</h1>
          </div>
        </div>
      </section>

      {/* brand story */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <img src="/images/lifestyle1.jpg" alt="" className="aspect-[4/3] w-full object-cover" />
          <div>
            <SectionTitle eyebrow="The Beginning" title="Elegance you can carry" />
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink/65">
              <p>G-Smile Signature was born from a simple belief: that a bag is more than an accessory — it's a daily companion that should reflect your taste, support your ambition and stand the test of time.</p>
              <p>Founded by Grace Smile, our brand brings together timeless design and premium full-grain leather to create pieces for the fashion-conscious, the corporate professional, the traveller and the everyday icon.</p>
              <p>Today, thousands of customers across Nigeria trust G-Smile Signature for bags that blend luxury with everyday practicality — delivered fast, paid for securely, and backed by service that cares.</p>
            </div>
          </div>
        </div>
      </section>

      {/* mission vision */}
      <section className="bg-cream/40 py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="bg-white p-8 lg:p-10">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-gold/15 text-gold"><Icon.arrowRight className="h-6 w-6" /></div>
            <h3 className="mt-5 font-display text-2xl font-semibold">Our Mission</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/65">To make premium, beautifully-crafted bags accessible to every modern individual — combining luxury aesthetics, lasting durability and an effortless shopping experience.</p>
          </div>
          <div className="bg-ink p-8 text-white lg:p-10">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-gold/20 text-gold"><Icon.gem className="h-6 w-6" /></div>
            <h3 className="mt-5 font-display text-2xl font-semibold">Our Vision</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-white/65">To become Africa's most-loved premium bag brand — synonymous with elegance, trust and signature style on every shoulder, in every city.</p>
          </div>
        </div>
      </section>

      {/* values */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <SectionTitle eyebrow="What We Stand For" title="Our Core Values" center />
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="border border-cream p-8 text-center transition-shadow hover:shadow-lg">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold/30 text-gold"><v.icon className="h-6 w-6" /></div>
              <h4 className="mt-5 font-display text-xl font-medium">{v.title}</h4>
              <p className="mt-3 text-sm leading-relaxed text-ink/60">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* team */}
      <section className="bg-cream/40 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="The People" title="Meet the Team" center />
          <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {team.map((m) => (
              <div key={m.name} className="bg-white p-6 text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold/15 font-display text-2xl font-semibold text-gold">
                  {m.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <h4 className="mt-4 font-display text-lg font-medium">{m.name}</h4>
                <p className="mt-1 text-xs uppercase tracking-wider text-ash">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="bg-ink py-16 text-center text-white">
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">Ready to find your signature?</h2>
        <p className="mt-3 text-white/60">Explore the collection crafted for every occasion.</p>
        <Button variant="gold" size="lg" className="mt-7" onClick={() => navigate("/shop")}>Shop the Collection</Button>
      </section>
    </div>
  );
}
