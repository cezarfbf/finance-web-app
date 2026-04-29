import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { Classification } from "@/types/transaction";

const classificationColor: Record<Classification, string> = {
  Receita: "var(--kpi-receita)",
  "IVA Apurado": "var(--kpi-iva-apurado)",
  "IVA Pago": "var(--kpi-iva-pago)",
  "Custos Oper.": "var(--kpi-custos)",
  Retiradas: "var(--kpi-retiradas)",
  "Gastos Pessoais": "var(--kpi-pessoais)",
  IGNORAR: "var(--kpi-ignorar)",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  classification: Classification;
}

export function Badge({ classification, className, ...props }: BadgeProps) {
  const c = classificationColor[classification] ?? "var(--color-text-muted)";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        className,
      )}
      style={{
        // 0x22 ≈ 13% opacity, mirrors the report's #color22 background trick.
        background: `color-mix(in srgb, ${c} 13%, transparent)`,
        color: c,
      }}
      {...props}
    >
      {classification}
    </span>
  );
}

export { classificationColor };
