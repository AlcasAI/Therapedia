import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <FileQuestion className="h-8 w-8" aria-hidden />
      </div>
      <div>
        <h1 className="text-lg font-semibold text-slate-900">
          Pagina non trovata
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Il contenuto richiesto non esiste o è stato spostato.
        </p>
      </div>
      <Link href="/">
        <Button>Torna alla home</Button>
      </Link>
    </div>
  );
}
