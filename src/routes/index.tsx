import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import * as Icons from "lucide-react";
import { ArrowUpRight, Instagram, MapPin, Navigation, MessageCircle, Info, Sparkles, BadgeCheck, Flame, Plus, Tag, ShoppingBag } from "lucide-react";
import { useHero, useOffers, useQuickLinks, useStores } from "@/hooks/useSiteData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LH Import — Link Oficial" },
      { name: "description", content: "Duas lojas físicas em PE e atendimento em tempo real pelo WhatsApp. Apple, Xiaomi, Realme, perfumes e eletrônicos." },
      { property: "og:title", content: "LH Import — Link Oficial" },
      { property: "og:description", content: "Duas lojas físicas em PE e atendimento em tempo real pelo WhatsApp." },
    ],
  }),
  component: Index,
});

const marqueeItems = [
  "Frete para todo o Brasil",
  "Parcelamos em até 10x",
  "Produtos 100% originais",
  "Entrega no mesmo dia em Palmares e Barreiros",
  "Novidades toda semana",
];

function getIcon(name: string) {
  const I = (Icons as any)[name];
  return (I ?? MapPin) as typeof MapPin;
}

function Index() {
  const { data: hero } = useHero();
  const { data: offers = [] } = useOffers();
  const { data: quickLinks = [] } = useQuickLinks();
  const { data: stores = [] } = useStores();
  const [buyOpen, setBuyOpen] = useState(false);
  const [buyOffer, setBuyOffer] = useState<any>(null);

  function openBuy(offer: any) { setBuyOffer(offer); setBuyOpen(true); }
  function chooseStore(store: any) {
    setBuyOpen(false);
    const base = (store.whatsapp || "").trim();
    if (!base || base === "#") return;
    const msg = encodeURIComponent(`Olá! Tenho interesse em: ${buyOffer?.title}${buyOffer?.price ? ` (${buyOffer.price})` : ""}`);
    const sep = base.includes("?") ? "&" : "?";
    const url = /text=/.test(base) ? base : `${base}${sep}text=${msg}`;
    window.open(url, "_blank", "noopener");
  }


  const brand = hero?.brand ?? "LH Import";
  const handle = hero?.handle ?? "@lhimport";
  const tagline = hero?.tagline ?? "";
  const categories = hero?.categories ?? [];

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:px-8">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-neon shadow-[0_0_8px_var(--neon)]" />
          link.oficial
        </div>
        <div>v · 2026</div>
      </div>

      {/* Hero */}
      <section className="flex flex-col items-center px-5 pb-10 pt-6 text-center">
        <div className="relative">
          <div className="animate-pulse-ring relative grid size-32 place-items-center rounded-full border border-neon/40 bg-card">
            <div className="grid size-24 place-items-center rounded-full bg-gradient-to-br from-zinc-800 to-black">
              <span className="font-mono text-[11px] font-bold tracking-tight text-neon">{brand.toUpperCase()}</span>
            </div>
          </div>
          <div className="absolute right-0 top-1 grid size-6 place-items-center rounded-full border border-neon/40 bg-card">
            <BadgeCheck className="size-3.5 text-neon" />
          </div>
        </div>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">{brand}</h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{handle}</p>
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">{tagline}</p>

        <a
          href={hero?.instagram ?? "#"}
          className="mt-5 grid size-10 place-items-center rounded-full border border-border bg-card transition-colors hover:border-neon/60 hover:text-neon"
          aria-label="Instagram"
        >
          <Instagram className="size-4" />
        </a>

        {categories.length > 0 && (
          <div className="mt-7 inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em]">
            <span className="size-1.5 rounded-full bg-neon shadow-[0_0_6px_var(--neon)]" />
            {categories.map((c, i) => (
              <span key={c} className="flex items-center gap-1">
                <span className={i === 0 ? "text-foreground" : "text-muted-foreground"}>{c}</span>
                {i < categories.length - 1 && <span className="text-border">·</span>}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Ofertas do dia */}
      <section className="mx-auto w-full max-w-5xl px-5 pb-10">
        <div className="flex items-end justify-between border-b border-border pb-3">
          <div className="flex items-baseline gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neon/40 bg-neon/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-neon">
              <Flame className="size-3" />
              Ofertas do dia
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {String(offers.length).padStart(2, "0")} itens
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((o) => (
            <div
              key={o.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-neon/40 hover:shadow-[0_0_30px_-12px_var(--neon)]"
            >
              <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-gradient-to-br from-zinc-900 to-black">
                {o.image ? (
                  <img src={o.image} alt={o.title} className="size-full object-cover" />
                ) : (
                  <Tag className="size-10 text-muted-foreground/40" />
                )}
                {o.discount && (
                  <span className="absolute left-3 top-3 rounded-full bg-neon px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-neon-foreground">
                    {o.discount}
                  </span>
                )}
                {o.category && (
                  <span className="absolute right-3 top-3 rounded-full border border-border bg-background/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground backdrop-blur">
                    {o.category}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <h3 className="text-sm font-medium tracking-tight">{o.title}</h3>
                <div>
                  {o.old_price && (
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground line-through">
                      {o.old_price}
                    </div>
                  )}
                  <div className="text-lg font-semibold text-neon">{o.price}</div>
                </div>
                <button
                  onClick={() => openBuy(o)}
                  className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-neon px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-neon-foreground transition-all hover:brightness-110"
                >
                  <ShoppingBag className="size-3.5" />
                  Comprar
                </button>
              </div>
            </div>
          ))}

          {offers.length === 0 && (
            <div className="grid min-h-[260px] place-items-center rounded-2xl border border-dashed border-border bg-card/40 p-6 text-center sm:col-span-2 lg:col-span-3">
              <div className="flex flex-col items-center gap-2">
                <div className="grid size-10 place-items-center rounded-full border border-border bg-card text-muted-foreground">
                  <Plus className="size-4" />
                </div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Nenhuma oferta cadastrada
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Quick access */}
      <section className="mx-auto w-full max-w-2xl px-5 pb-10">
        <SectionHeader index="01" title="Acesso rápido" right={`${quickLinks.length} links`} />
        <div className="mt-4 space-y-3">
          {quickLinks.map((link) => {
            const Icon = getIcon(link.icon);
            return (
              <a
                key={link.id}
                href={link.href}
                className={[
                  "group flex items-center gap-4 rounded-2xl border p-4 transition-all",
                  link.highlight
                    ? "border-neon/60 bg-neon text-neon-foreground shadow-[0_0_30px_-8px_var(--neon)] hover:brightness-105"
                    : "border-border bg-card hover:border-neon/40",
                ].join(" ")}
              >
                <div
                  className={[
                    "grid size-11 shrink-0 place-items-center rounded-full",
                    link.highlight ? "bg-neon-foreground/10 text-neon-foreground" : "bg-secondary text-neon",
                  ].join(" ")}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{link.title}</span>
                    {link.badge && (
                      <span className="rounded-full bg-neon-foreground/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest">
                        {link.badge}
                      </span>
                    )}
                  </div>
                  <p
                    className={[
                      "mt-0.5 truncate text-xs",
                      link.highlight ? "text-neon-foreground/80" : "text-muted-foreground",
                    ].join(" ")}
                  >
                    {link.subtitle}
                  </p>
                </div>
                <ArrowUpRight className="size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            );
          })}
        </div>
      </section>

      {/* Marquee */}
      <div className="relative overflow-hidden border-y border-border bg-card/50 py-3">
        <div className="animate-marquee flex w-max gap-8 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="flex items-center gap-8">
              {item}
              <span className="size-1 rounded-full bg-neon" />
            </span>
          ))}
        </div>
      </div>

      {/* Stores */}
      <section className="mx-auto w-full max-w-5xl px-5 py-12">
        <SectionHeader index="02" title="Lojas físicas" right={`${String(stores.length).padStart(2, "0")} unidades`} />

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {stores.map((s, i) => (
            <article
              key={s.id}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-colors hover:border-neon/30"
            >
              <div className="flex items-start justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-neon/40 bg-neon/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-neon">
                  <MapPin className="size-3" />
                  {s.label}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  0{i + 1} / {String(stores.length).padStart(2, "0")}
                </span>
              </div>

              <h3 className="mt-6 text-2xl font-semibold tracking-tight">
                {s.city} <span className="text-muted-foreground">— {s.state}</span>
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.address}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{s.hours}</p>

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <StoreAction icon={Navigation} label="Como chegar" sub="Google Maps" href={s.maps} />
                <StoreAction icon={MessageCircle} label="WhatsApp" sub={s.phone} href={s.whatsapp} />
                <StoreAction icon={Info} label="Informações" sub="Ver loja" href="#" />
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.tag}
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-neon">
                  <span className="size-1.5 animate-pulse rounded-full bg-neon shadow-[0_0_6px_var(--neon)]" />
                  Aberta agora
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-border px-5 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            © 2026 · {brand} · Todos os direitos reservados
          </p>
          <p className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <Sparkles className="size-3 text-neon" />
            feito com cuidado
          </p>
        </div>
      </footer>
    </main>
  );
}

function SectionHeader({ index, title, right }: { index: string; title: string; right: string }) {
  return (
    <div className="flex items-end justify-between border-b border-border pb-3">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          [ {index} ]
        </span>
        <h2 className="text-sm font-medium tracking-tight">· {title}</h2>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {right}
      </span>
    </div>
  );
}

function StoreAction({
  icon: Icon,
  label,
  sub,
  href,
}: {
  icon: typeof Navigation;
  label: string;
  sub: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-2.5 rounded-xl border border-border bg-background/60 p-2.5 transition-colors hover:border-neon/40 hover:bg-secondary"
    >
      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-neon">
        <Icon className="size-3.5" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-xs font-medium">{label}</div>
        <div className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {sub}
        </div>
      </div>
    </a>
  );
}
