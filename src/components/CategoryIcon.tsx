import {
  Activity,
  Apple,
  Brain,
  HeartPulse,
  Pill,
  Stethoscope,
  FileText,
  type LucideIcon,
} from "lucide-react";

// Map the optional `icon` string on a Category to a lucide component.
const ICONS: Record<string, LucideIcon> = {
  Activity,
  Apple,
  Brain,
  HeartPulse,
  Pill,
  Stethoscope,
  FileText,
};

export function CategoryIcon({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  const Icon = (name && ICONS[name]) || FileText;
  return <Icon className={className} aria-hidden />;
}
