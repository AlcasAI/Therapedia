"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Phone, Building2, StickyNote, MessageSquarePlus } from "lucide-react";
import type { Contact } from "@/lib/types";
import { getContacts } from "@/lib/data/repository";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/spinner";
import { EmptyState, ErrorState } from "@/components/States";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [error, setError] = useState(false);

  const load = () => {
    setError(false);
    setContacts(null);
    getContacts()
      .then(setContacts)
      .catch(() => setError(true));
  };

  useEffect(load, []);

  return (
    <div>
      <PageHeader title="Contatti utili" subtitle="Team e servizi di riferimento" />

      <div className="px-4 py-4">
        {/* Quick link to the request form */}
        <Link
          href="/contact"
          className="mb-4 flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-brand-800 transition-colors hover:bg-brand-100"
        >
          <MessageSquarePlus className="h-5 w-5 shrink-0" aria-hidden />
          <div className="min-w-0">
            <p className="font-semibold">Contatta il team</p>
            <p className="text-sm text-brand-700/80">
              Segnala un problema o richiedi un protocollo
            </p>
          </div>
        </Link>

        {error ? (
          <ErrorState onRetry={load} />
        ) : contacts === null ? (
          <LoadingState />
        ) : contacts.length === 0 ? (
          <EmptyState title="Nessun contatto disponibile" />
        ) : (
          <div className="space-y-3">
            {contacts.map((c) => (
              <Card key={c.id}>
                <CardContent>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900">{c.name}</h3>
                      <p className="text-sm text-brand-600">{c.role}</p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2 text-sm">
                    {c.department && (
                      <Row icon={<Building2 className="h-4 w-4" />}>
                        {c.department}
                      </Row>
                    )}
                    {c.email && (
                      <Row icon={<Mail className="h-4 w-4" />}>
                        <a
                          href={`mailto:${c.email}`}
                          className="text-brand-600 hover:underline"
                        >
                          {c.email}
                        </a>
                      </Row>
                    )}
                    {c.phone && (
                      <Row icon={<Phone className="h-4 w-4" />}>
                        <a
                          href={`tel:${c.phone.replace(/\s/g, "")}`}
                          className="text-brand-600 hover:underline"
                        >
                          {c.phone}
                        </a>
                      </Row>
                    )}
                    {c.notes && (
                      <Row icon={<StickyNote className="h-4 w-4" />}>
                        <span className="text-slate-500">{c.notes}</span>
                      </Row>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <span className="min-w-0 break-words text-slate-700">{children}</span>
    </div>
  );
}
