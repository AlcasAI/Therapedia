import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const DISCLAIMER_TEXT =
  "This application is intended for healthcare professionals as a reference tool. It does not replace clinical judgment, local guidelines, or specialist consultation.";

export function Disclaimer({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900",
        className
      )}
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
      <p className="text-xs leading-relaxed">{DISCLAIMER_TEXT}</p>
    </div>
  );
}
