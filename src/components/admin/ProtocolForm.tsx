"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import type {
  Category,
  Protocol,
  ProtocolInput,
  ProtocolStatus,
} from "@/lib/types";
import { getCategories } from "@/lib/data/repository";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUploadField } from "@/components/admin/FileUploadField";
import { slugify } from "@/lib/utils";

const today = () => new Date().toISOString().slice(0, 10);

function buildInitial(protocol?: Protocol): ProtocolInput {
  return {
    slug: protocol?.slug ?? "",
    title: protocol?.title ?? "",
    categoryId: protocol?.categoryId ?? "",
    categoryName: protocol?.categoryName ?? "",
    description: protocol?.description ?? "",
    tags: protocol?.tags ?? [],
    fileUrl: protocol?.fileUrl ?? "",
    fileType: protocol?.fileType ?? "pdf",
    version: protocol?.version ?? "1.0",
    status: protocol?.status ?? "draft",
    author: protocol?.author ?? "",
    reviewer: protocol?.reviewer ?? "",
    lastUpdated: protocol?.lastUpdated ?? today(),
  };
}

const statuses: { value: ProtocolStatus; label: string }[] = [
  { value: "published", label: "Pubblicato" },
  { value: "draft", label: "Bozza" },
  { value: "archived", label: "Archiviato" },
];

export function ProtocolForm({
  protocol,
  onSubmit,
}: {
  protocol?: Protocol;
  onSubmit: (input: ProtocolInput) => Promise<void>;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProtocolInput>(() => buildInitial(protocol));
  const [tagsText, setTagsText] = useState((protocol?.tags ?? []).join(", "));
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug from title for new protocols only.
  const slugTouched = useMemo(() => Boolean(protocol), [protocol]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const set = <K extends keyof ProtocolInput>(
    key: K,
    value: ProtocolInput[K]
  ) => setForm((f) => ({ ...f, [key]: value }));

  const handleTitle = (value: string) => {
    setForm((f) => ({
      ...f,
      title: value,
      slug: slugTouched ? f.slug : slugify(value),
    }));
  };

  const handleCategory = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    setForm((f) => ({
      ...f,
      categoryId,
      categoryName: cat?.name ?? "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (!form.categoryId) {
      setError("Seleziona una categoria.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        slug: form.slug || slugify(form.title),
        tags,
        lastUpdated: today(),
      });
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Salvataggio non riuscito. Riprova.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-4 py-5">
      <div>
        <Label htmlFor="title">Titolo</Label>
        <Input
          id="title"
          required
          value={form.title}
          onChange={(e) => handleTitle(e.target.value)}
          placeholder="Es. Gestione della dispnea"
        />
      </div>

      <div>
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input
          id="slug"
          required
          value={form.slug}
          onChange={(e) => set("slug", slugify(e.target.value))}
          placeholder="gestione-dispnea"
        />
      </div>

      <div>
        <Label htmlFor="category">Categoria</Label>
        <Select
          id="category"
          value={form.categoryId}
          onChange={(e) => handleCategory(e.target.value)}
        >
          <option value="">Seleziona…</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Descrizione</Label>
        <Textarea
          id="description"
          required
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Breve descrizione del protocollo…"
        />
      </div>

      <div>
        <Label htmlFor="tags">Tag (separati da virgola)</Label>
        <Input
          id="tags"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="dolore, oppioidi, titolazione"
        />
      </div>

      <FileUploadField
        fileUrl={form.fileUrl}
        fileType={form.fileType}
        titleForName={form.title}
        onChange={({ fileUrl, fileType }) => {
          set("fileUrl", fileUrl);
          set("fileType", fileType);
        }}
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="version">Versione</Label>
          <Input
            id="version"
            value={form.version}
            onChange={(e) => set("version", e.target.value)}
            placeholder="1.0"
          />
        </div>
        <div>
          <Label htmlFor="status">Stato</Label>
          <Select
            id="status"
            value={form.status}
            onChange={(e) => set("status", e.target.value as ProtocolStatus)}
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="author">Autore</Label>
          <Input
            id="author"
            value={form.author}
            onChange={(e) => set("author", e.target.value)}
            placeholder="Dr.ssa Elena Conti"
          />
        </div>
        <div>
          <Label htmlFor="reviewer">Revisore</Label>
          <Input
            id="reviewer"
            value={form.reviewer}
            onChange={(e) => set("reviewer", e.target.value)}
            placeholder="Dr. Marco Rossi"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
        >
          Annulla
        </Button>
        <Button type="submit" className="flex-1" disabled={submitting}>
          <Save className="h-4 w-4" aria-hidden />
          {submitting ? "Salvataggio…" : "Salva"}
        </Button>
      </div>
    </form>
  );
}
