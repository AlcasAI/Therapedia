"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { isAdminEnabled } from "@/lib/config";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/States";

/**
 * Minimal admin gate. In this MVP admin access is controlled by the
 * NEXT_PUBLIC_ENABLE_ADMIN flag — NOT real authentication. Replacing this with
 * proper auth + RBAC is the first item on the roadmap (see README).
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  if (!isAdminEnabled()) {
    return (
      <div>
        <PageHeader title="Area amministrazione" back="/" />
        <EmptyState
          icon={<Lock className="h-6 w-6" />}
          title="Area riservata disattivata"
          description="Imposta NEXT_PUBLIC_ENABLE_ADMIN=true per abilitare le funzioni di amministrazione."
          action={
            <Link
              href="/"
              className="text-sm font-medium text-brand-600 hover:underline"
            >
              Torna alla home
            </Link>
          }
        />
      </div>
    );
  }
  return <>{children}</>;
}
