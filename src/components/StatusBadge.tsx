import type { IntensityBand } from "@/lib/carbonApi";

const BAND_STYLES: Record<
  IntensityBand,
  { label: string; text: string; bg: string; dot: string }
> = {
  green: {
    label: "LOW",
    text: "text-cg-green",
    bg: "bg-cg-green/10",
    dot: "bg-cg-green",
  },
  amber: {
    label: "MODERATE",
    text: "text-cg-amber",
    bg: "bg-cg-amber/10",
    dot: "bg-cg-amber",
  },
  red: {
    label: "HIGH",
    text: "text-cg-red",
    bg: "bg-cg-red/10",
    dot: "bg-cg-red",
  },
};

export function StatusBadge({
  band,
  label,
}: {
  band: IntensityBand;
  label?: string;
}) {
  const style = BAND_STYLES[band];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold tracking-wider uppercase ${style.bg} ${style.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {label ?? style.label}
    </span>
  );
}
