"use client";

import { useRef, useState } from "react";
import { UploadCloud, Link2, Check } from "lucide-react";
import type { FileType } from "@/lib/types";
import { getDataMode } from "@/lib/data/repository";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/utils";

/**
 * File source field for the admin protocol form.
 *
 * - MOCK MODE: enter a URL manually, or "simulate" picking a local file (the
 *   object URL is used as a placeholder — no real upload happens).
 * - SUPABASE MODE: uploads the chosen file to the "protocols" storage bucket
 *   and stores the resulting public URL.
 *
 * DOCX note: Word files are not rendered in-app; they are stored and opened /
 * downloaded externally. A future version may convert DOCX → HTML (see README).
 */
export function FileUploadField({
  fileUrl,
  fileType,
  titleForName,
  onChange,
}: {
  fileUrl: string;
  fileType: FileType;
  titleForName: string;
  onChange: (next: { fileUrl: string; fileType: FileType }) => void;
}) {
  const mode = getDataMode();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [justUploaded, setJustUploaded] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const detectType = (name: string): FileType => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "pdf";
    if (ext === "docx" || ext === "doc") return "docx";
    if (ext === "html" || ext === "htm") return "html";
    return "external";
  };

  const handleFile = async (file: File) => {
    setUploadError(null);
    setJustUploaded(false);
    const type = detectType(file.name);

    if (mode === "supabase") {
      const supabase = getSupabaseClient();
      if (!supabase) return;
      setUploading(true);
      try {
        const path = `${slugify(titleForName || "protocol")}-${Date.now()}-${file.name}`;
        const { error } = await supabase.storage
          .from("protocols")
          .upload(path, file, { upsert: false });
        if (error) throw error;
        const { data } = supabase.storage.from("protocols").getPublicUrl(path);
        onChange({ fileUrl: data.publicUrl, fileType: type });
        setJustUploaded(true);
      } catch {
        setUploadError("Upload non riuscito. Verifica il bucket 'protocols'.");
      } finally {
        setUploading(false);
      }
    } else {
      // Mock mode: simulate by referencing a local object URL placeholder.
      const placeholder = `/protocols/${slugify(
        titleForName || file.name.replace(/\.[^.]+$/, "")
      )}.${type === "external" ? "pdf" : type}`;
      onChange({ fileUrl: placeholder, fileType: type });
      setJustUploaded(true);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <Label className="mb-2">Documento</Label>

      {/* Manual URL entry */}
      <div className="relative">
        <Link2
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <Input
          value={fileUrl}
          onChange={(e) =>
            onChange({ fileUrl: e.target.value, fileType })
          }
          placeholder="/protocols/file.pdf oppure https://…"
          className="pl-9"
          inputMode="url"
        />
      </div>

      {/* File type selector */}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-slate-400">Tipo:</span>
        {(["pdf", "docx", "html", "external"] as FileType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange({ fileUrl, fileType: t })}
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              fileType === t
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-500 ring-1 ring-slate-200"
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Upload / simulate */}
      <div className="mt-3 flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.doc,.html,.htm"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <UploadCloud className="h-4 w-4" aria-hidden />
          {uploading
            ? "Caricamento…"
            : mode === "supabase"
              ? "Carica file"
              : "Simula upload"}
        </Button>
        {justUploaded && (
          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <Check className="h-3.5 w-3.5" aria-hidden /> Aggiornato
          </span>
        )}
      </div>

      {uploadError && (
        <p className="mt-2 text-xs text-red-600">{uploadError}</p>
      )}
      <p className="mt-2 text-[11px] leading-snug text-slate-400">
        {mode === "supabase"
          ? "I file vengono caricati nel bucket Supabase 'protocols'."
          : "Mock mode: nessun file viene caricato realmente. Inserisci un URL o simula l'upload."}
      </p>
    </div>
  );
}
