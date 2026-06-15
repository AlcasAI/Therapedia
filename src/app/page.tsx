"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Apple,
  Phone,
  User,
  ChevronRight,
  Search,
  Database,
  HardDrive,
} from "lucide-react";
import type { Protocol } from "@/lib/types";
import { getDataMode, getProtocols } from "@/lib/data/repository";
import { ProtocolCard } from "@/components/ProtocolCard";
import { Disclaimer } from "@/components/Disclaimer";
import { LoadingState } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { APP_NAME } from "@/lib/config";

const dashboardCards = [
  {
    href: "/protocols",
    title: "Protocolli",
    description: "Consulta e cerca i protocolli clinici",
    icon: FileText,
    color: "bg-brand-50 text-brand-600",
  },
  {
    href: "/protocols?category=nutrizione",
    title: "Risorse pratiche",
    description: "Consigli nutrizionali e materiali",
    icon: Apple,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    href: "/contacts",
    title: "Contatti utili",
    description: "Team e servizi di riferimento",
    icon: Phone,
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    href: "/profile",
    title: "Profilo",
    description: "Gestisci i tuoi dati professionali",
    icon: User,
    color: "bg-slate-100 text-slate-600",
  },
];

export default function HomePage() {
  const [recent, setRecent] = useState<Protocol[] | null>(null);
  const mode = getDataMode();

  useEffect(() => {
    getProtocols()
      .then((all) => setRecent(all.slice(0, 3)))
      .catch(() => setRecent([]));
  }, []);

  return (
    <div className="px-4 pt-6">
      {/* Greeting / brand header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Benvenuto</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {APP_NAME}
          </h1>
        </div>
        <Badge variant="muted" className="mt-1 shrink-0">
          {mode === "supabase" ? (
            <>
              <Database className="h-3 w-3" aria-hidden /> Supabase
            </>
          ) : (
            <>
              <HardDrive className="h-3 w-3" aria-hidden /> Mock
            </>
          )}
        </Badge>
      </div>

      {/* Search shortcut */}
      <Link
        href="/protocols"
        className="mb-5 flex h-12 items-center gap-2.5 rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-400 shadow-sm transition-colors hover:border-brand-300"
      >
        <Search className="h-4 w-4" aria-hidden />
        Cerca un protocollo…
      </Link>

      {/* Dashboard cards */}
      <div className="grid grid-cols-2 gap-3">
        {dashboardCards.map(({ href, title, description, icon: Icon, color }) => (
          <Link
            key={title}
            href={href}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-transform active:scale-[0.98] hover:border-brand-300"
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block font-semibold text-slate-900">
                {title}
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-slate-500">
                {description}
              </span>
            </span>
          </Link>
        ))}
      </div>

      {/* Recently updated */}
      <section className="mt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Aggiornati di recente
          </h2>
          <Link
            href="/protocols"
            className="flex items-center text-sm font-medium text-brand-600"
          >
            Tutti <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        {recent === null ? (
          <LoadingState />
        ) : (
          <div className="space-y-3">
            {recent.map((p) => (
              <ProtocolCard key={p.id} protocol={p} />
            ))}
          </div>
        )}
      </section>

      <Disclaimer className="mt-7" />
    </div>
  );
}
