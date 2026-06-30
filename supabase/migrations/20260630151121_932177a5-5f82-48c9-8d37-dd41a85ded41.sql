
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- updated_at helper
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Site settings (singleton: key/value JSON)
CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write site_settings" ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_site_settings_updated BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Offers
CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  price TEXT NOT NULL DEFAULT '',
  old_price TEXT,
  discount TEXT,
  image TEXT,
  href TEXT NOT NULL DEFAULT '#',
  position INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.offers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.offers TO authenticated;
GRANT ALL ON public.offers TO service_role;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read offers" ON public.offers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write offers" ON public.offers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_offers_updated BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Quick links
CREATE TABLE public.quick_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  href TEXT NOT NULL DEFAULT '#',
  icon TEXT NOT NULL DEFAULT 'MapPin',
  highlight BOOLEAN NOT NULL DEFAULT false,
  badge TEXT,
  position INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quick_links TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.quick_links TO authenticated;
GRANT ALL ON public.quick_links TO service_role;
ALTER TABLE public.quick_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read quick_links" ON public.quick_links FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write quick_links" ON public.quick_links FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_quick_links_updated BEFORE UPDATE ON public.quick_links
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Stores
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  hours TEXT NOT NULL DEFAULT '',
  maps TEXT NOT NULL DEFAULT '#',
  whatsapp TEXT NOT NULL DEFAULT '#',
  phone TEXT NOT NULL DEFAULT '',
  tag TEXT NOT NULL DEFAULT '',
  position INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.stores TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.stores TO authenticated;
GRANT ALL ON public.stores TO service_role;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read stores" ON public.stores FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin write stores" ON public.stores FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_stores_updated BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Seed initial content
INSERT INTO public.site_settings (key, value) VALUES
  ('hero', '{"brand":"LH Import","handle":"@lhimport","tagline":"Duas lojas físicas e atendimento em tempo real pelo WhatsApp","categories":["Apple","Xiaomi","Realme","Perfumes","Eletros"],"instagram":"#"}'::jsonb);

INSERT INTO public.offers (title, category, price, old_price, discount, href, position) VALUES
  ('iPhone 13 128GB','Apple','R$ 3.299','R$ 3.899','-15%','https://wa.me/5581998215108?text=Quero+ver+o+iPhone+13+em+oferta',0),
  ('Redmi Note 13 Pro','Xiaomi','R$ 1.799','R$ 2.199','-18%','https://wa.me/5581998215108?text=Quero+ver+o+Redmi+Note+13+Pro',1),
  ('AirPods Pro 2','Apple','R$ 1.499','R$ 1.899','-21%','https://wa.me/5581998215108?text=Quero+ver+o+AirPods+Pro+2',2);

INSERT INTO public.quick_links (title, subtitle, href, icon, highlight, badge, position) VALUES
  ('Unidade Palmares','Atendimento direto no WhatsApp · (81) 99821-5108','https://wa.me/5581998215108','MapPin',false,NULL,0),
  ('Unidade Barreiros','Atendimento direto no WhatsApp · (81) 98187-3002','https://wa.me/5581981873002','MapPin',false,NULL,1),
  ('LH Lovers','Grupo VIP no WhatsApp · Ofertas em primeira mão','#','Crown',true,'VIP',2);

INSERT INTO public.stores (label, city, state, address, hours, maps, whatsapp, phone, tag, position) VALUES
  ('Loja Matriz','Palmares','PE','Centro · Palmares — PE','Seg a Sex · 9h — 18h · Sáb · 8h — 14h','https://maps.app.goo.gl/2DdA2bi5md4XdWUG6','https://wa.me/5581998215108','(81) 99821-5108','LH · PE · palmares',0),
  ('Loja Filial','Barreiros','PE','Centro · Barreiros — PE','Seg a Sex · 9h — 18h · Sáb · 8h — 14h','https://maps.app.goo.gl/WR6BsBKarMYAD7R77','https://wa.me/5581981873002','(81) 98187-3002','LH · PE · barreiros',1);
