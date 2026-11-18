import { Accessibility, Bus, Ellipsis, GraduationCap, HeartPulse, Lightbulb, Construction, ShieldAlert, Trash2, TreePine, type LucideIcon } from "lucide-react";
import { CATEGORY_BY_ID } from "@/lib/constants";
import type { CategoryId } from "@/lib/types";

export const CATEGORY_ICON: Record<CategoryId, LucideIcon> = {
  iluminacao: Lightbulb, pavimentacao: Construction, saude: HeartPulse, educacao: GraduationCap, seguranca: ShieldAlert,
  transporte: Bus, limpeza: Trash2, meio_ambiente: TreePine, acessibilidade: Accessibility, outros: Ellipsis,
};

export function CategoryIcon({ id, size = 18, boxed = true }: { id: CategoryId; size?: number; boxed?: boolean }) {
  const I = CATEGORY_ICON[id];
  const color = CATEGORY_BY_ID[id].color;
  if (!boxed) return <I size={size} style={{ color }} aria-hidden />;
  return (
    <span aria-hidden className="flex shrink-0 items-center justify-center rounded-xl" style={{ width: size * 2.1, height: size * 2.1, background: color + "1f", color }}>
      <I size={size} />
    </span>
  );
}
