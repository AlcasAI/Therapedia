import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "brand" | "muted" | "success" | "warning";

const variants: Record<Variant, string> = {
  default: "bg-slate-100 text-slate-700",
  brand: "bg-brand-50 text-brand-700",
  muted: "bg-slate-50 text-slate-500 border border-slate-200",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
