"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Send } from "lucide-react";
import type { RequestType } from "@/lib/types";
import { createContactRequest, getDataMode } from "@/lib/data/repository";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const requestTypes: { value: RequestType; label: string }[] = [
  { value: "technical issue", label: "Problema tecnico" },
  { value: "protocol update", label: "Aggiornamento protocollo" },
  { value: "new protocol request", label: "Richiesta nuovo protocollo" },
  { value: "other", label: "Altro" },
];

export default function ContactPage() {
  const mode = getDataMode();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [requestType, setRequestType] = useState<RequestType>("technical issue");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createContactRequest({ name, email, requestType, message });
      setSuccess(true);
    } catch {
      setError("Invio non riuscito. Riprova più tardi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div>
        <PageHeader title="Richiesta inviata" back="/contacts" />
        <div className="px-4 py-10">
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" aria-hidden />
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Grazie!
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  La tua richiesta è stata registrata
                  {mode === "mock" ? " localmente (mock mode)." : "."}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSuccess(false);
                    setName("");
                    setEmail("");
                    setMessage("");
                    setRequestType("technical issue");
                  }}
                >
                  Nuova richiesta
                </Button>
                <Link href="/contacts">
                  <Button>Torna ai contatti</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Contatta il team" back="/contacts" />

      <form onSubmit={handleSubmit} className="px-4 py-5">
        <p className="mb-5 text-sm text-slate-500">
          Usa questo modulo per segnalare problemi o richiedere aggiornamenti.
          Non inserire dati relativi ai pazienti.
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Mario Rossi"
              autoComplete="name"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@struttura.example"
              autoComplete="email"
            />
          </div>

          <div>
            <Label htmlFor="requestType">Tipo di richiesta</Label>
            <Select
              id="requestType"
              value={requestType}
              onChange={(e) => setRequestType(e.target.value as RequestType)}
            >
              {requestTypes.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="message">Messaggio</Label>
            <Textarea
              id="message"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Descrivi la tua richiesta…"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-5 w-full" disabled={submitting}>
          <Send className="h-4 w-4" aria-hidden />
          {submitting ? "Invio in corso…" : "Invia richiesta"}
        </Button>
      </form>
    </div>
  );
}
