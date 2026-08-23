import type { ComponentType } from "react";
import { Leaf, MapPin, Clock } from "lucide-react";
import {
  getIntensityBand,
  getRenewablePercentage,
  type RegionalReading,
} from "@/lib/carbonApi";
import { capitalize, formatUkTime } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";

interface MetricCardsProps {
  national: RegionalReading;
  regions: RegionalReading[];
  periodTo: string;
}

function CardShell({
  icon: Icon,
  label,
  children,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded bg-cg-surface border border-cg-border p-4">
      <div className="flex items-center gap-2 border-b border-cg-border pb-3 text-xs font-semibold tracking-wider uppercase text-cg-text-secondary">
        <Icon className="h-4 w-4 text-cg-green" strokeWidth={2.25} />
        {label}
      </div>
      {children}
    </div>
  );
}

export function MetricCards({ national, regions, periodTo }: MetricCardsProps) {
  const renewablePct = getRenewablePercentage(national.generationMix);

  const topFuels = [...national.generationMix]
    .filter((f) => f.perc > 0)
    .sort((a, b) => b.perc - a.perc)
    .slice(0, 2);

  const cleanest = [...regions].sort(
    (a, b) => a.intensity.forecast - b.intensity.forecast
  )[0];

  const nationalBand = getIntensityBand(national.intensity.index);
  const isOptimalNow = nationalBand === "green";

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <CardShell icon={Leaf} label="Renewable Generation">
        <p className="font-cg-mono text-4xl font-bold text-cg-text-primary">
          {renewablePct.toFixed(0)}
          <span className="text-lg text-cg-text-secondary">%</span>
        </p>
        <p className="text-sm text-cg-text-secondary">
          {topFuels.length > 0
            ? topFuels
                .map((f) => `${capitalize(f.fuel)} ${f.perc.toFixed(0)}%`)
                .join(" · ")
            : "No renewable output right now"}
        </p>
      </CardShell>

      <CardShell icon={MapPin} label="Cleanest UK Region">
        {cleanest ? (
          <>
            <p className="text-2xl font-semibold text-cg-text-primary">
              {cleanest.shortName}
            </p>
            <div className="flex items-center gap-2">
              <p className="font-cg-mono text-sm text-cg-text-secondary">
                {cleanest.intensity.forecast} gCO2/kWh
              </p>
              <StatusBadge band={getIntensityBand(cleanest.intensity.index)} />
            </div>
          </>
        ) : (
          <p className="text-sm text-cg-text-secondary">No regional data available</p>
        )}
      </CardShell>

      <CardShell icon={Clock} label="Next Optimal Compute Window">
        <p className="text-2xl font-semibold text-cg-text-primary">
          {isOptimalNow ? "Now" : `From ${formatUkTime(periodTo)}`}
        </p>
        <p className="text-sm text-cg-text-secondary">
          {isOptimalNow
            ? `Grid is low-carbon until ${formatUkTime(periodTo)}`
            : "Forecast index is next reviewed at this time"}
        </p>
      </CardShell>
    </div>
  );
}
