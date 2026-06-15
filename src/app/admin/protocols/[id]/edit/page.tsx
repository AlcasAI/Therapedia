"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Protocol } from "@/lib/types";
import { getProtocolById, updateProtocol } from "@/lib/data/repository";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProtocolForm } from "@/components/admin/ProtocolForm";
import { LoadingState } from "@/components/ui/spinner";
import { EmptyState } from "@/components/States";

function EditProtocol() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [protocol, setProtocol] = useState<Protocol | null | undefined>(
    undefined
  );

  useEffect(() => {
    getProtocolById(id)
      .then(setProtocol)
      .catch(() => setProtocol(null));
  }, [id]);

  if (protocol === undefined) {
    return (
      <>
        <PageHeader title="Modifica protocollo" back="/admin" />
        <LoadingState />
      </>
    );
  }

  if (protocol === null) {
    return (
      <>
        <PageHeader title="Modifica protocollo" back="/admin" />
        <EmptyState title="Protocollo non trovato" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Modifica protocollo"
        subtitle={protocol.title}
        back="/admin"
      />
      <ProtocolForm
        protocol={protocol}
        onSubmit={async (input) => void (await updateProtocol(id, input))}
      />
    </>
  );
}

export default function EditProtocolPage() {
  return (
    <AdminGuard>
      <EditProtocol />
    </AdminGuard>
  );
}
