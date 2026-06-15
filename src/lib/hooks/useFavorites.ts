"use client";

import { useCallback, useEffect, useState } from "react";
import { getFavorites, toggleFavorite } from "@/lib/storage";

/**
 * Reactive favorites backed by localStorage. Syncs across components in the
 * same tab via a custom event, and across tabs via the storage event.
 */
const EVENT = "cph:favorites-changed";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getFavorites());
    const sync = () => setFavorites(getFavorites());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((protocolId: string) => {
    const next = toggleFavorite(protocolId);
    setFavorites(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const isFavorite = useCallback(
    (protocolId: string) => favorites.includes(protocolId),
    [favorites]
  );

  return { favorites, toggle, isFavorite };
}
