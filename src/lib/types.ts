// =============================================================================
// Domain types for the Clinical Protocol Hub.
//
// IMPORTANT: This is a professional document library for clinicians. It does
// NOT model patients. There are intentionally no patient-identifiable fields
// (name, DOB, diagnosis, health data) anywhere in this file.
// =============================================================================

export type FileType = "pdf" | "docx" | "html" | "external";

export type ProtocolStatus = "published" | "draft" | "archived";

export type RequestType =
  | "technical issue"
  | "protocol update"
  | "new protocol request"
  | "other";

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  specialty: string;
  organization: string;
  email: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** Optional lucide-react icon name, resolved in the UI. */
  icon?: string;
}

export interface Protocol {
  id: string;
  slug: string;
  title: string;
  categoryId: string;
  categoryName: string;
  description: string;
  tags: string[];
  fileUrl: string;
  fileType: FileType;
  version: string;
  status: ProtocolStatus;
  author: string;
  reviewer: string;
  /** ISO date string (YYYY-MM-DD). */
  lastUpdated: string;
  /** ISO date string (YYYY-MM-DD). */
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  notes: string;
}

export interface ContactRequest {
  id: string;
  name: string;
  email: string;
  requestType: RequestType;
  message: string;
  /** ISO timestamp. */
  createdAt: string;
}

/** Payload used by admin create/edit forms (no server-managed fields). */
export type ProtocolInput = Omit<Protocol, "id" | "createdAt">;
