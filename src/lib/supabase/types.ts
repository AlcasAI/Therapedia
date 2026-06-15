// =============================================================================
// Minimal hand-written Supabase Database types.
//
// These mirror the tables defined in /supabase/schema.sql. For a real project
// you would generate these with `supabase gen types typescript`. They are kept
// intentionally small here so the repository layer stays strongly typed.
// =============================================================================

import type {
  Category,
  Contact,
  ContactRequest,
  Protocol,
  UserProfile,
} from "@/lib/types";

// supabase-js requires each table's Row/Insert/Update to be assignable to
// `Record<string, unknown>`. Plain `interface` types are NOT (they lack an
// implicit index signature), which would silently collapse the schema to
// `never`. Re-mapping through `AsRecord` produces an index-signature-compatible
// type alias so payload typing resolves correctly.
type AsRecord<T> = { [K in keyof T]: T[K] };

interface TableShape<T> {
  Row: AsRecord<T>;
  Insert: Partial<AsRecord<T>>;
  Update: Partial<AsRecord<T>>;
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      profiles: TableShape<UserProfile>;
      categories: TableShape<Category>;
      protocols: TableShape<Protocol>;
      contacts: TableShape<Contact>;
      contact_requests: TableShape<ContactRequest>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
