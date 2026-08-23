"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import {
  fetchRegionalIntensity,
  fetchRegionalIntensity24hAgo,
  type RegionalSnapshot,
} from "@/lib/carbonApi";
import { Header } from "@/components/Header";
import { MetricCards } from "@/components/MetricCards";
import { RegionalTable } from "@/components/RegionalTable";
import { GenerationMix } from "@/components/GenerationMix";
import { ComputeScheduler } from "@/components/ComputeScheduler";
import { RegionSelector } from "@/components/RegionSelector";

const REFRESH_INTERVAL_MS = 60_000;

export default function Home() {
  const [snapshot, setSnapshot] = useState<RegionalSnapshot | null>(null);
  const [previousSnapshot, setPreviousSnapshot] = useState<RegionalSnapshot | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const [currentResult, previousResult] = await Promise.allSettled([
      fetchRegionalIntensity(),
      fetchRegionalIntensity24hAgo(),
    ]);

    if (currentResult.status === "fulfilled") {
      setSnapshot(currentResult.value);
      setError(null);
    } else {
      setError(
        currentResult.reason instanceof Error
          ? currentResult.reason.message
          : "Failed to load carbon intensity data"
      );
    }

    // The 24h-ago comparison is a nice-to-have — don't let its failure block the page.
    if (previousResult.status === "fulfilled") {
      setPreviousSnapshot(previousResult.value);
    }

    setIsLoading(false);
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

  const selectedRegionData = useMemo(
    () =>
      snapshot?.regions.find((r) => r.regionId === selectedRegionId) ?? null,
    [snapshot, selectedRegionId]
  );

  return (
    <div className="min-h-screen bg-cg-background">
      <div className="mx-auto flex max-w-360 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
        <Header national={snapshot?.national ?? null} />

        <RegionSelector
          selectedRegionId={selectedRegionId}
          onSelectRegion={setSelectedRegionId}
          selectedRegionData={selectedRegionData}
        />

        {isLoading && !snapshot && <LoadingState />}

        {error && !snapshot && <ErrorState message={error} onRetry={load} />}

        {snapshot && (
          <>
            {error && <StaleDataBanner message={error} onRetry={load} />}
            <MetricCards
              national={snapshot.national}
              regions={snapshot.regions}
              periodTo={snapshot.to}
            />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <GenerationMix />
              <ComputeScheduler
                regionId={selectedRegionId}
                regionName={selectedRegionData?.shortName ?? "National Grid"}
              />
            </div>

            <RegionalTable
              regions={snapshot.regions}
              previousRegions={previousSnapshot?.regions ?? null}
            />
          </>
        )}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-live="polite">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded bg-cg-surface border border-cg-border"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded bg-cg-surface border border-cg-border" />
      <span className="sr-only">Loading live carbon intensity data…</span>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded bg-cg-surface border border-cg-border p-8 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cg-red/10 text-cg-red">
        <AlertTriangle className="h-5 w-5" strokeWidth={2.25} />
      </span>
      <p className="text-lg font-semibold text-cg-text-primary">
        Unable to load grid data
      </p>
      <p className="max-w-md text-sm text-cg-text-secondary">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 inline-flex items-center gap-2 rounded bg-cg-green px-4 py-2 text-sm font-semibold text-cg-on-green transition-colors hover:bg-cg-green/90"
      >
        <RefreshCw className="h-4 w-4" strokeWidth={2.25} />
        Retry
      </button>
    </div>
  );
}

function StaleDataBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-cg-amber/30 bg-cg-amber/10 px-4 py-3 text-sm text-cg-amber">
      <span>Showing last known data — {message}</span>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 font-semibold underline-offset-2 hover:underline"
      >
        <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.25} />
        Retry now
      </button>
    </div>
  );
}
