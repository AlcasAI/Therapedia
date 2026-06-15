"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, Star, X } from "lucide-react";
import type { Category, Protocol } from "@/lib/types";
import { getCategories, getProtocols } from "@/lib/data/repository";
import { ProtocolCard } from "@/components/ProtocolCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/spinner";
import { EmptyState, ErrorState } from "@/components/States";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/lib/hooks/useFavorites";

function matchesQuery(p: Protocol, q: string): boolean {
  if (!q) return true;
  const haystack = [
    p.title,
    p.description,
    p.categoryName,
    p.author,
    p.reviewer,
    ...p.tags,
  ]
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((term) => haystack.includes(term));
}

function ProtocolsView() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "all";

  const [protocols, setProtocols] = useState<Protocol[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState(false);

  const [query, setQuery] = useState("");
  const [categorySlug, setCategorySlug] = useState(initialCategory);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const { favorites } = useFavorites();

  const load = () => {
    setError(false);
    setProtocols(null);
    Promise.all([getProtocols(), getCategories()])
      .then(([p, c]) => {
        setProtocols(p);
        setCategories(c);
      })
      .catch(() => setError(true));
  };

  useEffect(load, []);

  // Most common tags across the dataset, for the tag filter row.
  const topTags = useMemo(() => {
    if (!protocols) return [];
    const counts = new Map<string, number>();
    for (const p of protocols)
      for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([t]) => t);
  }, [protocols]);

  const filtered = useMemo(() => {
    if (!protocols) return [];
    return protocols
      .filter((p) =>
        categorySlug === "all"
          ? true
          : categories.find((c) => c.id === p.categoryId)?.slug ===
            categorySlug
      )
      .filter((p) => (activeTag ? p.tags.includes(activeTag) : true))
      .filter((p) => (favoritesOnly ? favorites.includes(p.id) : true))
      .filter((p) => matchesQuery(p, query))
      .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
  }, [protocols, categories, categorySlug, activeTag, favoritesOnly, favorites, query]);

  const hasFilters =
    query || categorySlug !== "all" || activeTag || favoritesOnly;

  const clearFilters = () => {
    setQuery("");
    setCategorySlug("all");
    setActiveTag(null);
    setFavoritesOnly(false);
  };

  return (
    <div>
      <PageHeader title="Protocolli" subtitle="Libreria clinica di riferimento" />

      {/* Sticky search + filters */}
      <div className="sticky top-14 z-20 border-b border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca per titolo, tag, autore…"
            className="pl-9 pr-9"
            inputMode="search"
            aria-label="Cerca protocolli"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Cancella ricerca"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip
            active={categorySlug === "all"}
            onClick={() => setCategorySlug("all")}
          >
            Tutte
          </Chip>
          {categories.map((c) => (
            <Chip
              key={c.id}
              active={categorySlug === c.slug}
              onClick={() => setCategorySlug(c.slug)}
            >
              {c.name}
            </Chip>
          ))}
          <Chip
            active={favoritesOnly}
            onClick={() => setFavoritesOnly((v) => !v)}
          >
            <Star
              className={cn("h-3.5 w-3.5", favoritesOnly && "fill-current")}
              aria-hidden
            />
            Preferiti
          </Chip>
        </div>

        {/* Tag chips */}
        {topTags.length > 0 && (
          <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="flex shrink-0 items-center gap-1 text-xs text-slate-400">
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden /> Tag:
            </span>
            {topTags.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTag((cur) => (cur === t ? null : t))}
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-xs transition-colors",
                  activeTag === t
                    ? "bg-brand-600 text-white"
                    : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100"
                )}
              >
                #{t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="px-4 py-4">
        {error ? (
          <ErrorState onRetry={load} />
        ) : protocols === null ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nessun protocollo trovato"
            description={
              hasFilters
                ? "Prova a modificare i filtri o la ricerca."
                : "Non ci sono ancora protocolli pubblicati."
            }
            action={
              hasFilters ? (
                <button
                  onClick={clearFilters}
                  className="text-sm font-medium text-brand-600 hover:underline"
                >
                  Azzera filtri
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <p className="mb-3 text-xs text-slate-400">
              {filtered.length}{" "}
              {filtered.length === 1 ? "protocollo" : "protocolli"}
            </p>
            <div className="space-y-3">
              {filtered.map((p) => (
                <ProtocolCard key={p.id} protocol={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-brand-600 text-white shadow-sm"
          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
      )}
    >
      {children}
    </button>
  );
}

export default function ProtocolsPage() {
  // useSearchParams must be wrapped in Suspense for static rendering.
  return (
    <Suspense fallback={<LoadingState />}>
      <ProtocolsView />
    </Suspense>
  );
}
