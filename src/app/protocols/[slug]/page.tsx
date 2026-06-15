import { mockProtocols } from "@/lib/data/mock-data";
import ProtocolDetailClient from "./ProtocolDetailClient";

// Required for static export (GitHub Pages): pre-render one page per protocol.
// In mock mode the slugs come from the local data; with a live backend you
// would fetch the slugs here instead.
export function generateStaticParams() {
  return mockProtocols.map((p) => ({ slug: p.slug }));
}

// In static export, only the slugs above are generated; unknown slugs 404.
export const dynamicParams = false;

export default function ProtocolDetailPage() {
  return <ProtocolDetailClient />;
}
