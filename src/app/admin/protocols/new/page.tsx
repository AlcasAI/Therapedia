"use client";

import { createProtocol } from "@/lib/data/repository";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProtocolForm } from "@/components/admin/ProtocolForm";

export default function NewProtocolPage() {
  return (
    <AdminGuard>
      <PageHeader title="Nuovo protocollo" back="/admin" />
      <ProtocolForm onSubmit={async (input) => void (await createProtocol(input))} />
    </AdminGuard>
  );
}
