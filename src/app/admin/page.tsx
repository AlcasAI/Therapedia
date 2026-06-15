"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Archive,
  HardDrive,
  Database,
  FileText,
} from "lucide-react";
import type { Protocol } from "@/lib/types";
import {
  archiveProtocol,
  getDataMode,
  getProtocols,
} from "@/lib/data/repository";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/spinner";
import { EmptyState, ErrorState } from "@/components/States";
import { formatDate } from "@/lib/utils";

function AdminDashboard() {
  const mode = getDataMode();
  const [protocols, setProtocols] = useState<Protocol[] | null>(null);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setError(false);
    setProtocols(null);
    getProtocols({ includeAllStatuses: true })
      .then(setProtocols)
      .catch(() => setError(true));
  };

  useEffect(load, []);

  const handleArchive = async (p: Protocol) => {
    if (!confirm(`Archiviare "${p.title}"?`)) return;
    setBusyId(p.id);
    try {
      await archiveProtocol(p.id);
      load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Amministrazione"
        subtitle="Gestione protocolli"
        back="/"
        right={
          <Link href="/admin/protocols/new" aria-label="Nuovo protocollo">
            <Button size="sm">
              <Plus className="h-4 w-4" aria-hidden /> Nuovo
            </Button>
          </Link>
        }
      />

      <div className="px-4 py-4">
        {/* Mode banner */}
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm">
          {mode === "supabase" ? (
            <>
              <Database className="h-4 w-4 text-brand-600" aria-hidden />
              <span className="text-slate-600">
                Supabase mode — le modifiche sono persistenti sul database.
              </span>
            </>
          ) : (
            <>
              <HardDrive className="h-4 w-4 text-amber-500" aria-hidden />
              <span className="text-slate-600">
                <strong className="text-amber-600">Mock mode</strong> — le
                modifiche sono salvate solo su questo dispositivo
                (localStorage).
              </span>
            </>
          )}
        </div>

        {error ? (
          <ErrorState onRetry={load} />
        ) : protocols === null ? (
          <LoadingState />
        ) : protocols.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title="Nessun protocollo"
            action={
              <Link href="/admin/protocols/new">
                <Button size="sm">
                  <Plus className="h-4 w-4" aria-hidden /> Crea il primo
                </Button>
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3">
            {protocols.map((p) => (
              <li
                key={p.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <Badge variant="brand">{p.categoryName}</Badge>
                      <Badge
                        variant={
                          p.status === "published"
                            ? "success"
                            : p.status === "draft"
                              ? "default"
                              : "warning"
                        }
                      >
                        {p.status === "published"
                          ? "Pubblicato"
                          : p.status === "draft"
                            ? "Bozza"
                            : "Archiviato"}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        v{p.version}
                      </span>
                    </div>
                    <h3 className="truncate font-semibold text-slate-900">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Aggiornato il {formatDate(p.lastUpdated)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/admin/protocols/${p.id}/edit`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Pencil className="h-4 w-4" aria-hidden /> Modifica
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={p.status === "archived" || busyId === p.id}
                    onClick={() => handleArchive(p)}
                  >
                    <Archive className="h-4 w-4" aria-hidden />
                    {p.status === "archived" ? "Archiviato" : "Archivia"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  );
}
