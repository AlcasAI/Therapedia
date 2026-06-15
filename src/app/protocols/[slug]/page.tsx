"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import {
  Calendar,
  Download,
  ExternalLink,
  FileText,
  GitBranch,
  UserCheck,
  PenLine,
  Tag,
} from "lucide-react";
import type { Protocol } from "@/lib/types";
import { getProtocolBySlug, getRelatedProtocols } from "@/lib/data/repository";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Disclaimer } from "@/components/Disclaimer";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ProtocolCard } from "@/components/ProtocolCard";
import { LoadingState } from "@/components/ui/spinner";
import { ErrorState } from "@/components/States";
import { formatDate, isRecent } from "@/lib/utils";

const fileTypeLabels: Record<Protocol["fileType"], string> = {
  pdf: "PDF",
  docx: "Word (DOCX)",
  html: "HTML",
  external: "Link esterno",
};

export default function ProtocolDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [protocol, setProtocol] = useState<Protocol | null | undefined>(
    undefined
  );
  const [related, setRelated] = useState<Protocol[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setError(false);
    setProtocol(undefined);
    getProtocolBySlug(slug)
      .then(async (p) => {
        if (!active) return;
        setProtocol(p);
        if (p) setRelated(await getRelatedProtocols(p));
      })
      .catch(() => active && setError(true));
    return () => {
      active = false;
    };
  }, [slug]);

  if (error) {
    return (
      <div>
        <PageHeader title="Protocollo" back="/protocols" />
        <ErrorState onRetry={() => location.reload()} />
      </div>
    );
  }

  if (protocol === undefined) {
    return (
      <div>
        <PageHeader title="Protocollo" back="/protocols" />
        <LoadingState />
      </div>
    );
  }

  if (protocol === null) {
    notFound();
  }

  const isPdf = protocol.fileType === "pdf";
  const recent = isRecent(protocol.lastUpdated);

  return (
    <div>
      <PageHeader
        title={protocol.categoryName}
        back="/protocols"
        right={<FavoriteButton protocolId={protocol.id} />}
      />

      <article className="px-4 py-5">
        {/* Title block */}
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          <Badge variant="brand">{protocol.categoryName}</Badge>
          {recent && <Badge variant="success">Aggiornato di recente</Badge>}
          {protocol.status !== "published" && (
            <Badge variant="warning">
              {protocol.status === "draft" ? "Bozza" : "Archiviato"}
            </Badge>
          )}
        </div>
        <h1 className="text-xl font-bold leading-tight text-slate-900">
          {protocol.title}
        </h1>
        <p className="mt-2 leading-relaxed text-slate-600">
          {protocol.description}
        </p>

        {/* Document actions */}
        <div className="mt-4 flex gap-2">
          <a
            href={protocol.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700 active:bg-brand-800"
          >
            {isPdf ? (
              <FileText className="h-4 w-4" aria-hidden />
            ) : (
              <ExternalLink className="h-4 w-4" aria-hidden />
            )}
            Apri documento
          </a>
          <DownloadLink href={protocol.fileUrl} fileType={protocol.fileType} />
        </div>
        <p className="mt-1.5 text-xs text-slate-400">
          Formato: {fileTypeLabels[protocol.fileType]}
        </p>

        {/* Metadata grid */}
        <dl className="mt-5 grid grid-cols-2 gap-3">
          <MetaItem
            icon={<GitBranch className="h-4 w-4" />}
            label="Versione"
            value={`v${protocol.version}`}
          />
          <MetaItem
            icon={<Calendar className="h-4 w-4" />}
            label="Ultimo aggiornamento"
            value={formatDate(protocol.lastUpdated)}
          />
          <MetaItem
            icon={<PenLine className="h-4 w-4" />}
            label="Autore"
            value={protocol.author}
          />
          <MetaItem
            icon={<UserCheck className="h-4 w-4" />}
            label="Revisore"
            value={protocol.reviewer}
          />
        </dl>

        {/* Tags */}
        {protocol.tags.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
              <Tag className="h-3.5 w-3.5" aria-hidden /> Tag
            </p>
            <div className="flex flex-wrap gap-2">
              {protocol.tags.map((t) => (
                <Badge key={t} variant="default">
                  #{t}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Inline PDF preview (desktop / supported browsers) */}
        {isPdf && (
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
            <object
              data={protocol.fileUrl}
              type="application/pdf"
              className="hidden h-[60vh] w-full sm:block"
              aria-label={`Anteprima di ${protocol.title}`}
            >
              <div className="p-4 text-sm text-slate-500">
                Anteprima non disponibile.{" "}
                <a
                  href={protocol.fileUrl}
                  className="font-medium text-brand-600 underline"
                >
                  Apri il PDF
                </a>
                .
              </div>
            </object>
          </div>
        )}

        <Disclaimer className="mt-6" />

        {/* Related protocols */}
        {related.length > 0 && (
          <section className="mt-7">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Protocolli correlati
            </h2>
            <div className="space-y-3">
              {related.map((p) => (
                <ProtocolCard key={p.id} protocol={p} />
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
        <span className="text-slate-400">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

function DownloadLink({
  href,
  fileType,
}: {
  href: string;
  fileType: Protocol["fileType"];
}) {
  // For external links a download attribute is meaningless; just open.
  const download = fileType !== "external";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      download={download || undefined}
      aria-label="Scarica documento"
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-50"
    >
      <Download className="h-4 w-4" aria-hidden />
    </a>
  );
}
