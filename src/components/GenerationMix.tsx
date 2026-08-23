"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Factory, RefreshCw } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  fetchGenerationMix,
  getFuelBand,
  type FuelMix,
  type IntensityBand,
} from "@/lib/carbonApi";
import { capitalize } from "@/lib/format";

const REFRESH_INTERVAL_MS = 60_000;

/** Literal DESIGN.md hex values — SVG `fill` attributes don't resolve CSS custom properties. */
const BAND_HEX: Record<IntensityBand, string> = {
  green: "#4edea3",
  amber: "#ffb95f",
  red: "#ffb4ab",
};

export function GenerationMix() {
  const [mix, setMix] = useState<FuelMix[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const snapshot = await fetchGenerationMix();
      setMix(snapshot.mix);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load generation mix"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const kickoff = setTimeout(() => {
      load();
    }, 0);
    const id = setInterval(() => {
      load();
    }, REFRESH_INTERVAL_MS);
    return () => {
      clearTimeout(kickoff);
      clearInterval(id);
    };
  }, [load]);

  const chartData = (mix ?? [])
    .filter((f) => f.perc > 0)
    .sort((a, b) => b.perc - a.perc)
    .map((f) => ({
      fuel: capitalize(f.fuel),
      perc: f.perc,
      band: getFuelBand(f.fuel),
    }));

  return (
    <div className="flex flex-col gap-3 rounded bg-cg-surface border border-cg-border p-4">
      <div className="flex items-center gap-2 border-b border-cg-border pb-3">
        <Factory className="h-4 w-4 text-cg-green" strokeWidth={2.25} />
        <h2 className="text-xs font-semibold tracking-wider uppercase text-cg-text-secondary">
          Live Generation Mix
        </h2>
      </div>

      {isLoading && !mix && (
        <div
          className="h-64 animate-pulse rounded bg-cg-surface-high"
          role="status"
          aria-live="polite"
        >
          <span className="sr-only">Loading generation mix…</span>
        </div>
      )}

      {error && !mix && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <AlertTriangle className="h-5 w-5 text-cg-red" strokeWidth={2.25} />
          <p className="text-sm text-cg-text-secondary">{error}</p>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-cg-green hover:underline"
          >
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.25} />
            Retry
          </button>
        </div>
      )}

      {mix && (
        <>
          {error && (
            <p className="text-xs text-cg-amber">
              Showing last known mix — {error}
            </p>
          )}
          {chartData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 4, right: 24, bottom: 4, left: 8 }}
                >
                  <XAxis type="number" domain={[0, "dataMax"]} hide />
                  <YAxis
                    type="category"
                    dataKey="fuel"
                    width={90}
                    tick={{ fill: "#bbcabf", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    contentStyle={{
                      background: "#222a3d",
                      border: "1px solid #3c4a42",
                      borderRadius: 4,
                      color: "#dae2fd",
                      fontSize: 12,
                    }}
                    formatter={(value) => [`${Number(value).toFixed(1)}%`, "Share"]}
                  />
                  <Bar dataKey="perc" radius={[0, 2, 2, 0]} barSize={16}>
                    {chartData.map((entry) => (
                      <Cell key={entry.fuel} fill={BAND_HEX[entry.band]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-cg-text-secondary">
              No generation output currently reported
            </p>
          )}
        </>
      )}
    </div>
  );
}
