import { Construction } from "lucide-react";

/**
 * Fixed, always-visible banner signalling that the app is a work in progress.
 * Pinned to the very top above all other layers (z-50). The app shell adds a
 * matching top offset, and sticky headers stick just below it.
 */
export function UnderConstructionBanner() {
  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-50 flex h-8 items-center justify-center gap-1.5 bg-amber-400 px-3 text-center text-[12px] font-semibold text-amber-950"
    >
      <Construction className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="truncate">
        App in costruzione · versione dimostrativa
      </span>
    </div>
  );
}
