"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/lib/hooks/useFavorites";

export function FavoriteButton({
  protocolId,
  className,
  size = 20,
}: {
  protocolId: string;
  className?: string;
  size?: number;
}) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(protocolId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(protocolId);
      }}
      aria-pressed={active}
      aria-label={active ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
        active
          ? "text-amber-500 hover:bg-amber-50"
          : "text-slate-400 hover:bg-slate-100 hover:text-slate-600",
        className
      )}
    >
      <Star
        width={size}
        height={size}
        className={cn(active && "fill-amber-400")}
        aria-hidden
      />
    </button>
  );
}
