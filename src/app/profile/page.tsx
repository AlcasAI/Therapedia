"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Star, ShieldCheck, LogOut } from "lucide-react";
import type { UserProfile } from "@/lib/types";
import { getStoredProfile, saveStoredProfile } from "@/lib/storage";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Disclaimer } from "@/components/Disclaimer";
import { generateId } from "@/lib/utils";
import { isAdminEnabled } from "@/lib/config";

const EMPTY: UserProfile = {
  id: "",
  name: "",
  role: "",
  specialty: "",
  organization: "",
  email: "",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(EMPTY);
  const [saved, setSaved] = useState(false);
  const { favorites } = useFavorites();

  useEffect(() => {
    const stored = getStoredProfile();
    if (stored) setProfile(stored);
  }, []);

  const update = (field: keyof UserProfile, value: string) => {
    setProfile((p) => ({ ...p, [field]: value }));
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const toSave: UserProfile = {
      ...profile,
      id: profile.id || generateId("user"),
    };
    saveStoredProfile(toSave);
    setProfile(toSave);
    setSaved(true);
  };

  return (
    <div>
      <PageHeader title="Profilo" subtitle="Dati professionali" />

      <div className="px-4 py-5">
        {/* Favorites summary */}
        <Link href="/protocols?category=all">
          <Card className="mb-5">
            <CardContent className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                <Star className="h-5 w-5 fill-amber-400" aria-hidden />
              </span>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">
                  {favorites.length} preferiti
                </p>
                <p className="text-sm text-slate-500">
                  Protocolli salvati su questo dispositivo
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={profile.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Dr.ssa Anna Verdi"
              autoComplete="name"
            />
          </div>
          <div>
            <Label htmlFor="role">Ruolo</Label>
            <Input
              id="role"
              value={profile.role}
              onChange={(e) => update("role", e.target.value)}
              placeholder="Medico specialista"
            />
          </div>
          <div>
            <Label htmlFor="specialty">Specialità</Label>
            <Input
              id="specialty"
              value={profile.specialty}
              onChange={(e) => update("specialty", e.target.value)}
              placeholder="Medicina interna"
            />
          </div>
          <div>
            <Label htmlFor="organization">Organizzazione</Label>
            <Input
              id="organization"
              value={profile.organization}
              onChange={(e) => update("organization", e.target.value)}
              placeholder="Ospedale / ASL"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="nome@struttura.example"
              autoComplete="email"
            />
          </div>

          <Button type="submit" size="lg" className="w-full">
            {saved ? (
              <>
                <CheckCircle2 className="h-4 w-4" aria-hidden /> Salvato
              </>
            ) : (
              "Salva profilo"
            )}
          </Button>
        </form>

        {isAdminEnabled() && (
          <Link href="/admin" className="mt-4 block">
            <Button variant="outline" className="w-full">
              <ShieldCheck className="h-4 w-4" aria-hidden /> Area amministrazione
            </Button>
          </Link>
        )}

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
          <LogOut className="h-3.5 w-3.5" aria-hidden />
          Il profilo è salvato solo su questo dispositivo. Nessun dato paziente
          viene raccolto.
        </p>

        <Disclaimer className="mt-5" />
      </div>
    </div>
  );
}
