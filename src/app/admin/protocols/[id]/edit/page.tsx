import { mockProtocols } from "@/lib/data/mock-data";
import EditProtocolClient from "./EditProtocolClient";

// Required for static export (GitHub Pages): pre-render an edit page per mock
// protocol id. Protocols created in the browser (mock mode, localStorage) won't
// have a pre-built page in a static deployment — that's expected for the demo;
// a live backend (Supabase) makes this fully dynamic.
export function generateStaticParams() {
  return mockProtocols.map((p) => ({ id: p.id }));
}

export const dynamicParams = false;

export default function EditProtocolPage() {
  return <EditProtocolClient />;
}
