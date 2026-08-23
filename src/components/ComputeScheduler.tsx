"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, Timer, TrendingDown } from "lucide-react";
import {
  fetchNationalForecast,
  fetchRegionalForecast,
  type ForecastPeriod,
} from "@/lib/carbonApi";
import { formatUkTime } from "@/lib/format";

const REFRESH_INTERVAL_MS = 5 * 60_000;
const MIN_HOURS = 1;
const MAX_HOURS = 8;

interface ComputeSchedulerProps {
  regionId: number | null;
  regionName: string;
}

interface ForecastWindow {
  startIndex: number;
  periods: ForecastPeriod[];
  avg: number;
}

/** All valid consecutive windows of `periodsNeeded` half-hour periods within the forecast. */
function findWindows(
  periods: ForecastPeriod[],
  periodsNeeded: number
): ForecastWindow[] {
  const windows: ForecastWindow[] = [];
  for (let i = 0; i + periodsNeeded <= periods.length; i++) {
    const slice = periods.slice(i, i + periodsNeeded);
    const avg = slice.reduce((sum, p) => sum + p.forecast, 0) / slice.length;
    windows.push({ startIndex: i, periods: slice, avg });
  }
  return windows;
}

export function ComputeScheduler({ regionId, regionName }: ComputeSchedulerProps) {
  const [durationHours, setDurationHours] = useState(2);
  const [forecast, setForecast] = useState<ForecastPeriod[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const periods = regionId
        ? await fetchRegionalForecast(regionId)
        : await fetchNationalForecast();
      setForecast(periods);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load forecast data"
      );
    } finally {
      setIsLoading(false);
    }
  }, [regionId]);

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

  const periodsNeeded = durationHours * 2;
  const windows = forecast ? findWindows(forecast, periodsNeeded) : [];
  const optimal =
    windows.length > 0
      ? windows.reduce((best, w) => (w.avg < best.avg ? w : best))
      : null;
  const runningNow = windows.length > 0 ? windows[0] : null;

  const savingsPct =
    optimal && runningNow && runningNow.avg > 0
      ? Math.max(0, ((runningNow.avg - optimal.avg) / runningNow.avg) * 100)
      : 0;

  const isOptimalNow = optimal !== null && optimal.startIndex === 0;

  return (
    <div className="flex flex-col gap-4 rounded bg-cg-surface border border-cg-border p-4">
      <div className="flex items-center gap-2 border-b border-cg-border pb-3">
        <Timer className="h-4 w-4 text-cg-green" strokeWidth={2.25} />
        <h2 className="text-xs font-semibold tracking-wider uppercase text-cg-text-secondary">
          Green Compute Scheduler — {regionName}
        </h2>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm text-cg-text-secondary">
          <label htmlFor="job-duration">Job duration</label>
          <span className="font-cg-mono text-cg-text-primary">
            {durationHours} {durationHours === 1 ? "hour" : "hours"}
          </span>
        </div>
        <input
          id="job-duration"
          type="range"
          min={MIN_HOURS}
          max={MAX_HOURS}
          step={1}
          value={durationHours}
          onChange={(e) => setDurationHours(Number(e.target.value))}
          className="w-full accent-cg-green"
        />
      </div>

      {isLoading && !forecast && (
        <div
          className="h-20 animate-pulse rounded bg-cg-surface-high"
          role="status"
          aria-live="polite"
        >
          <span className="sr-only">Loading forecast…</span>
        </div>
      )}

      {error && !forecast && (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
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

      {forecast && (
        <>
          {error && (
            <p className="text-xs text-cg-amber">
              Showing last known forecast — {error}
            </p>
          )}
          {optimal && runningNow ? (
            <div className="flex flex-col gap-3 rounded bg-cg-surface-high border border-cg-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-cg-text-secondary">
                  {isOptimalNow
                    ? "Best time to run — right now"
                    : "Best upcoming window"}
                </p>
                <p className="text-xl font-semibold text-cg-text-primary">
                  {formatUkTime(optimal.periods[0].from)} –{" "}
                  {formatUkTime(optimal.periods[optimal.periods.length - 1].to)}
                </p>
                <p className="font-cg-mono text-sm text-cg-text-secondary">
                  avg {optimal.avg.toFixed(0)} gCO2/kWh
                </p>
              </div>
              <div className="flex items-center gap-2 self-start rounded-full bg-cg-green/10 px-3 py-1.5 text-cg-green">
                <TrendingDown className="h-4 w-4" strokeWidth={2.25} />
                <span className="text-sm font-semibold">
                  {savingsPct > 0
                    ? `${savingsPct.toFixed(0)}% cleaner than now`
                    : "Already optimal"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-cg-text-secondary">
              Not enough forecast data for a {durationHours}-hour window yet.
            </p>
          )}
        </>
      )}
    </div>
  );
}
