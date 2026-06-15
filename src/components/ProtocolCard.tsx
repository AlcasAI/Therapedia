import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";
import type { Protocol } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { formatDate, isRecent } from "@/lib/utils";

export function ProtocolCard({ protocol }: { protocol: Protocol }) {
  const recent = isRecent(protocol.lastUpdated);

  return (
    <Link
      href={`/protocols/${protocol.slug}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-brand-300 hover:bg-brand-50/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <Badge variant="brand">{protocol.categoryName}</Badge>
            {recent && (
              <Badge variant="success">
                <Clock className="h-3 w-3" aria-hidden /> Aggiornato
              </Badge>
            )}
            {protocol.status !== "published" && (
              <Badge variant="warning">
                {protocol.status === "draft" ? "Bozza" : "Archiviato"}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold leading-snug text-slate-900">
            {protocol.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
            {protocol.description}
          </p>
          <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-400">
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-medium text-slate-500">
              v{protocol.version}
            </span>
            <span>Aggiornato il {formatDate(protocol.lastUpdated)}</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <FavoriteButton protocolId={protocol.id} />
          <ChevronRight
            className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-400"
            aria-hidden
          />
        </div>
      </div>
    </Link>
  );
}
