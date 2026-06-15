"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function PageHeader({
  title,
  subtitle,
  back,
  right,
}: {
  title: string;
  subtitle?: string;
  /** When true, show a back button. Can also be a href string. */
  back?: boolean | string;
  right?: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-app items-center gap-2 px-4">
        {back &&
          (typeof back === "string" ? (
            <Link
              href={back}
              aria-label="Indietro"
              className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </Link>
          ) : (
            <button
              onClick={() => router.back()}
              aria-label="Indietro"
              className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
          ))}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold text-slate-900">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        {right}
      </div>
    </header>
  );
}
