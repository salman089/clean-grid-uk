"use client";

import { useState } from "react";
import { Minus, Search, TrendingDown, TrendingUp } from "lucide-react";
import { getIntensityBand, type RegionalReading } from "@/lib/carbonApi";
import { StatusBadge } from "./StatusBadge";

interface RegionalTableProps {
  regions: RegionalReading[];
  /** Same regions ~24h ago, for the trend column. Null while unavailable — trend renders as "—". */
  previousRegions: RegionalReading[] | null;
}

export function RegionalTable({ regions, previousRegions }: RegionalTableProps) {
  const [query, setQuery] = useState("");

  const previousByRegionId = new Map(
    (previousRegions ?? []).map((r) => [r.regionId, r.intensity.forecast])
  );

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? regions.filter(
        (region) =>
          region.shortName.toLowerCase().includes(normalizedQuery) ||
          region.dnoRegion.toLowerCase().includes(normalizedQuery) ||
          String(region.regionId) === normalizedQuery
      )
    : regions;

  const sorted = [...filtered].sort(
    (a, b) => a.intensity.forecast - b.intensity.forecast
  );

  return (
    <div className="rounded bg-cg-surface border border-cg-border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cg-border px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold text-cg-text-primary">
            Regional Carbon Breakdown
          </h2>
          <p className="text-xs text-cg-text-secondary">
            Sorted cleanest to dirtiest, gCO2/kWh
          </p>
        </div>

        <div className="relative w-full sm:w-56">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cg-text-secondary"
            strokeWidth={2.25}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search region or ID…"
            aria-label="Search regions by name or ID"
            className="w-full rounded border border-cg-border bg-cg-input-bg py-1.5 pl-8 pr-3 text-sm text-cg-text-primary placeholder:text-cg-text-secondary focus:outline-none focus:ring-2 focus:ring-cg-green/60"
          />
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-cg-text-secondary">
          No regions match &ldquo;{query}&rdquo;
        </p>
      ) : (
        <>
          {/* Mobile: stacked cards, no horizontal scrolling. */}
          <div className="flex flex-col divide-y divide-cg-border md:hidden">
            {sorted.map((region) => (
              <div key={region.regionId} className="flex flex-col gap-2 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-cg-text-primary">{region.shortName}</p>
                    <p className="text-xs text-cg-text-secondary">
                      {region.dnoRegion}
                    </p>
                  </div>
                  <p className="font-cg-mono text-lg font-semibold text-cg-text-primary">
                    {region.intensity.forecast}
                    <span className="ml-1 text-xs font-normal text-cg-text-secondary">
                      gCO2/kWh
                    </span>
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <StatusBadge band={getIntensityBand(region.intensity.index)} />
                  <ChangeIndicator
                    current={region.intensity.forecast}
                    previous={previousByRegionId.get(region.regionId) ?? null}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop / tablet: full table. */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-120 border-collapse text-left">
              <thead>
                <tr className="text-xs font-semibold tracking-wider uppercase text-cg-text-secondary">
                  <th className="px-4 py-3 font-semibold">Region</th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Intensity (gCO2/kWh)
                  </th>
                  <th className="px-4 py-3 font-semibold text-right">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">24h Change</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((region) => (
                  <tr
                    key={region.regionId}
                    className="border-t border-cg-border text-sm"
                  >
                    <td className="px-4 py-3">
                      <p className="text-cg-text-primary">{region.shortName}</p>
                      <p className="text-xs text-cg-text-secondary">
                        {region.dnoRegion}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right font-cg-mono text-cg-text-primary">
                      {region.intensity.forecast}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <StatusBadge band={getIntensityBand(region.intensity.index)} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ChangeIndicator
                        current={region.intensity.forecast}
                        previous={previousByRegionId.get(region.regionId) ?? null}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/** A less-carbon-than-24h-ago change is "good" (green, down arrow); more is "bad" (red, up arrow). */
function ChangeIndicator({
  current,
  previous,
}: {
  current: number;
  previous: number | null;
}) {
  if (previous === null || previous === 0) {
    return <span className="text-xs text-cg-text-secondary">—</span>;
  }

  const deltaPct = ((current - previous) / previous) * 100;

  if (Math.abs(deltaPct) < 0.5) {
    return (
      <span className="inline-flex items-center justify-end gap-1 text-xs text-cg-text-secondary">
        <Minus className="h-3 w-3" strokeWidth={2.25} />
        0%
      </span>
    );
  }

  const isImproving = deltaPct < 0;

  return (
    <span
      className={`inline-flex items-center justify-end gap-1 text-xs font-semibold ${
        isImproving ? "text-cg-green" : "text-cg-red"
      }`}
    >
      {isImproving ? (
        <TrendingDown className="h-3 w-3" strokeWidth={2.25} />
      ) : (
        <TrendingUp className="h-3 w-3" strokeWidth={2.25} />
      )}
      {Math.abs(deltaPct).toFixed(0)}%
    </span>
  );
}
