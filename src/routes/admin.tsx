import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOffers, useQuickLinks, useStores, useHero } from "@/hooks/useSiteData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, Plus, Save, Trash2, ExternalLink, Upload, ImageIcon } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading) return <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">Carregando...</div>;
  if (!user) return null;

  if (!isAdmin) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
        <div className="max-w-md rounded-2xl border border-border bg-card p-6 text-center">
          <h1 className="text-lg font-semibold">Acesso restrito</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua conta ({user.email}) não tem permissão de admin.
          </p>
          <p className="mt-3 rounded-lg border border-border bg-background/60 p-3 text-left font-mono text-[11px] text-muted-foreground">
            Para liberar acesso, conceda o papel <span className="text-neon">admin</span> ao seu user_id no banco:
            <br />
            <span className="text-foreground">
              INSERT INTO user_roles (user_id, role) VALUES ('{user.id}', 'admin');
            </span>
          </p>
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            }}
          >
            Sair
          </Button>
        </div>
      </main>
    );
  }

  return <AdminDashboard email={user.email ?? ""} />;
}

function AdminDashboard({ email }: { email: string }) {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-5 py-4 backdrop-blur">
        <div>
          <h1 className="text-sm font-semibold tracking-tight">Painel Admin · LH Import</h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:border-neon/60 hover:text-neon">
            <ExternalLink className="size-3.5" /> Ver site
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth" });
            }}
          >
            <LogOut className="size-3.5" /> Sair
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-6">
        <Tabs defaultValue="offers">
          <TabsList>
            <TabsTrigger value="offers">Ofertas</TabsTrigger>
            <TabsTrigger value="links">Links rápidos</TabsTrigger>
            <TabsTrigger value="stores">Lojas</TabsTrigger>
            <TabsTrigger value="hero">Header</TabsTrigger>
          </TabsList>

          <TabsContent value="offers" className="mt-6"><OffersTab /></TabsContent>
          <TabsContent value="links" className="mt-6"><QuickLinksTab /></TabsContent>
          <TabsContent value="stores" className="mt-6"><StoresTab /></TabsContent>
          <TabsContent value="hero" className="mt-6"><HeroTab /></TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

/* ============================ OFFERS ============================ */
function OffersTab() {
  const { data: offers, isLoading } = useOffers();
  const qc = useQueryClient();

  async function createOne() {
    const { error } = await supabase.from("offers").insert({
      title: "Nova oferta",
      category: "Apple",
      price: "R$ 0",
      href: "#",
      position: (offers?.length ?? 0),
    });
    if (error) toast.error(error.message);
    else { toast.success("Oferta criada"); qc.invalidateQueries({ queryKey: ["offers"] }); }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-sm font-medium">Ofertas do dia</h2>
        <Button size="sm" onClick={createOne}><Plus className="size-3.5" /> Nova oferta</Button>
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">Carregando...</p> : (
        <div className="grid gap-3">{offers?.map((o) => <OfferRow key={o.id} offer={o} />)}</div>
      )}
    </div>
  );
}

function OfferRow({ offer }: { offer: any }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(offer);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { id, created_at, updated_at, ...patch } = form;
    const { error } = await supabase.from("offers").update(patch).eq("id", id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Salvo"); qc.invalidateQueries({ queryKey: ["offers"] }); }
  }

  async function remove() {
    if (!confirm("Excluir esta oferta?")) return;
    const { error } = await supabase.from("offers").delete().eq("id", offer.id);
    if (error) toast.error(error.message);
    else { toast.success("Removida"); qc.invalidateQueries({ queryKey: ["offers"] }); }
  }

  const set = (k: string, v: any) => setForm({ ...form, [k]: v });

  const [uploading, setUploading] = useState(false);
  async function onUpload(file: File) {
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${offer.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
    if (upErr) { setUploading(false); toast.error(upErr.message); return; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    set("image", data.publicUrl);
    setUploading(false);
    toast.success("Imagem enviada — clique em Salvar");
  }

  return (
    <Card className="p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Imagem do produto" className="sm:col-span-2">
          <div className="flex items-center gap-3">
            <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-lg border border-border bg-background">
              {form.image ? (
                <img src={form.image} alt="" className="size-full object-cover" />
              ) : (
                <ImageIcon className="size-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs hover:border-neon/60 hover:text-neon">
                <Upload className="size-3.5" />
                {uploading ? "Enviando..." : "Enviar imagem"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }}
                />
              </label>
              <Input placeholder="ou cole uma URL" value={form.image ?? ""} onChange={(e) => set("image", e.target.value)} />
            </div>
          </div>
        </Field>
        <Field label="Título"><Input value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} /></Field>
        <Field label="Categoria"><Input value={form.category ?? ""} onChange={(e) => set("category", e.target.value)} /></Field>
        <Field label="Preço"><Input value={form.price ?? ""} onChange={(e) => set("price", e.target.value)} /></Field>
        <Field label="Preço antigo"><Input value={form.old_price ?? ""} onChange={(e) => set("old_price", e.target.value)} /></Field>
        <Field label="Desconto (ex: -15%)"><Input value={form.discount ?? ""} onChange={(e) => set("discount", e.target.value)} /></Field>
        <Field label="Posição"><Input type="number" value={form.position ?? 0} onChange={(e) => set("position", Number(e.target.value))} /></Field>
        <div className="flex items-end gap-2">
          <Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} />
          <span className="text-sm text-muted-foreground">Ativa</span>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={remove}><Trash2 className="size-3.5" /> Excluir</Button>
        <Button size="sm" onClick={save} disabled={saving}><Save className="size-3.5" /> {saving ? "..." : "Salvar"}</Button>
      </div>
    </Card>
  );
}

/* ============================ QUICK LINKS ============================ */
function QuickLinksTab() {
  const { data, isLoading } = useQuickLinks();
  const qc = useQueryClient();

  async function createOne() {
    const { error } = await supabase.from("quick_links").insert({
      title: "Novo link", subtitle: "", href: "#", icon: "MapPin",
      position: (data?.length ?? 0),
    });
    if (error) toast.error(error.message);
    else { toast.success("Link criado"); qc.invalidateQueries({ queryKey: ["quick_links"] }); }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-sm font-medium">Links rápidos</h2>
        <Button size="sm" onClick={createOne}><Plus className="size-3.5" /> Novo link</Button>
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">Carregando...</p> : (
        <div className="grid gap-3">{data?.map((l) => <LinkRow key={l.id} link={l} />)}</div>
      )}
    </div>
  );
}

function LinkRow({ link }: { link: any }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(link);
  const set = (k: string, v: any) => setForm({ ...form, [k]: v });

  async function save() {
    const { id, created_at, updated_at, ...patch } = form;
    const { error } = await supabase.from("quick_links").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Salvo"); qc.invalidateQueries({ queryKey: ["quick_links"] }); }
  }
  async function remove() {
    if (!confirm("Excluir este link?")) return;
    const { error } = await supabase.from("quick_links").delete().eq("id", link.id);
    if (error) toast.error(error.message);
    else { toast.success("Removido"); qc.invalidateQueries({ queryKey: ["quick_links"] }); }
  }

  return (
    <Card className="p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Título"><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
        <Field label="Ícone (MapPin, Crown, Instagram...)"><Input value={form.icon} onChange={(e) => set("icon", e.target.value)} /></Field>
        <Field label="Subtítulo" className="sm:col-span-2"><Input value={form.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} /></Field>
        <Field label="Link" className="sm:col-span-2"><Input value={form.href} onChange={(e) => set("href", e.target.value)} /></Field>
        <Field label="Badge (ex: VIP)"><Input value={form.badge ?? ""} onChange={(e) => set("badge", e.target.value)} /></Field>
        <Field label="Posição"><Input type="number" value={form.position} onChange={(e) => set("position", Number(e.target.value))} /></Field>
        <div className="flex items-center gap-2"><Switch checked={form.highlight} onCheckedChange={(v) => set("highlight", v)} /><span className="text-sm">Destaque</span></div>
        <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} /><span className="text-sm">Ativo</span></div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={remove}><Trash2 className="size-3.5" /> Excluir</Button>
        <Button size="sm" onClick={save}><Save className="size-3.5" /> Salvar</Button>
      </div>
    </Card>
  );
}

/* ============================ STORES ============================ */
function StoresTab() {
  const { data, isLoading } = useStores();
  const qc = useQueryClient();

  async function createOne() {
    const { error } = await supabase.from("stores").insert({
      label: "Nova loja", city: "Cidade", state: "PE",
      position: (data?.length ?? 0),
    });
    if (error) toast.error(error.message);
    else { toast.success("Loja criada"); qc.invalidateQueries({ queryKey: ["stores"] }); }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-sm font-medium">Lojas físicas</h2>
        <Button size="sm" onClick={createOne}><Plus className="size-3.5" /> Nova loja</Button>
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">Carregando...</p> : (
        <div className="grid gap-3">{data?.map((s) => <StoreRow key={s.id} store={s} />)}</div>
      )}
    </div>
  );
}

function StoreRow({ store }: { store: any }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(store);
  const set = (k: string, v: any) => setForm({ ...form, [k]: v });

  async function save() {
    const { id, created_at, updated_at, ...patch } = form;
    const { error } = await supabase.from("stores").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Salvo"); qc.invalidateQueries({ queryKey: ["stores"] }); }
  }
  async function remove() {
    if (!confirm("Excluir esta loja?")) return;
    const { error } = await supabase.from("stores").delete().eq("id", store.id);
    if (error) toast.error(error.message);
    else { toast.success("Removida"); qc.invalidateQueries({ queryKey: ["stores"] }); }
  }

  return (
    <Card className="p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Rótulo (Matriz, Filial...)"><Input value={form.label} onChange={(e) => set("label", e.target.value)} /></Field>
        <Field label="Cidade"><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
        <Field label="Estado"><Input value={form.state} onChange={(e) => set("state", e.target.value)} /></Field>
        <Field label="Telefone"><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="Endereço" className="sm:col-span-2"><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></Field>
        <Field label="Horário" className="sm:col-span-2"><Input value={form.hours} onChange={(e) => set("hours", e.target.value)} /></Field>
        <Field label="Google Maps URL"><Input value={form.maps} onChange={(e) => set("maps", e.target.value)} /></Field>
        <Field label="WhatsApp URL"><Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></Field>
        <Field label="Tag"><Input value={form.tag} onChange={(e) => set("tag", e.target.value)} /></Field>
        <Field label="Posição"><Input type="number" value={form.position} onChange={(e) => set("position", Number(e.target.value))} /></Field>
        <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => set("is_active", v)} /><span className="text-sm">Ativa</span></div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={remove}><Trash2 className="size-3.5" /> Excluir</Button>
        <Button size="sm" onClick={save}><Save className="size-3.5" /> Salvar</Button>
      </div>
    </Card>
  );
}

/* ============================ HERO ============================ */
function HeroTab() {
  const { data, isLoading } = useHero();
  const qc = useQueryClient();
  const [form, setForm] = useState<any>(null);

  useEffect(() => { if (data && !form) setForm(data); }, [data, form]);

  if (isLoading || !form) return <p className="text-sm text-muted-foreground">Carregando...</p>;

  async function save() {
    const value = {
      ...form,
      categories: typeof form.categories === "string"
        ? form.categories.split(",").map((s: string) => s.trim()).filter(Boolean)
        : form.categories,
    };
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "hero", value }, { onConflict: "key" });
    if (error) toast.error(error.message);
    else { toast.success("Header atualizado"); qc.invalidateQueries({ queryKey: ["site_settings", "hero"] }); }
  }

  const set = (k: string, v: any) => setForm({ ...form, [k]: v });
  const categoriesStr = Array.isArray(form.categories) ? form.categories.join(", ") : form.categories;

  return (
    <Card className="p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nome da marca"><Input value={form.brand} onChange={(e) => set("brand", e.target.value)} /></Field>
        <Field label="Handle (@usuario)"><Input value={form.handle} onChange={(e) => set("handle", e.target.value)} /></Field>
        <Field label="Tagline" className="sm:col-span-2"><Textarea value={form.tagline} onChange={(e) => set("tagline", e.target.value)} rows={2} /></Field>
        <Field label="Categorias (separadas por vírgula)" className="sm:col-span-2">
          <Input value={categoriesStr} onChange={(e) => set("categories", e.target.value)} />
        </Field>
        <Field label="Instagram URL" className="sm:col-span-2"><Input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} /></Field>
      </div>
      <div className="mt-4 flex justify-end">
        <Button size="sm" onClick={save}><Save className="size-3.5" /> Salvar header</Button>
      </div>
    </Card>
  );
}

/* ============================ helpers ============================ */
function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-[11px] uppercase tracking-widest text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
