import { useQuery, queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const offersQuery = queryOptions({
  queryKey: ["offers"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("offers")
      .select("*")
      .eq("is_active", true)
      .order("position", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

export const quickLinksQuery = queryOptions({
  queryKey: ["quick_links"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("quick_links")
      .select("*")
      .eq("is_active", true)
      .order("position", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

export const storesQuery = queryOptions({
  queryKey: ["stores"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("is_active", true)
      .order("position", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
});

export type HeroSettings = {
  brand: string;
  handle: string;
  tagline: string;
  categories: string[];
  instagram: string;
};

export const heroQuery = queryOptions({
  queryKey: ["site_settings", "hero"],
  queryFn: async (): Promise<HeroSettings> => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "hero")
      .maybeSingle();
    if (error) throw error;
    const v = (data?.value ?? {}) as Partial<HeroSettings>;
    return {
      brand: v.brand ?? "LH Import",
      handle: v.handle ?? "@lhimport",
      tagline: v.tagline ?? "",
      categories: v.categories ?? [],
      instagram: v.instagram ?? "#",
    };
  },
});

export function useOffers() { return useQuery(offersQuery); }
export function useQuickLinks() { return useQuery(quickLinksQuery); }
export function useStores() { return useQuery(storesQuery); }
export function useHero() { return useQuery(heroQuery); }
