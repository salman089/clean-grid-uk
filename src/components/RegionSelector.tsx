"use client";

import { useState } from "react";
import { LoaderCircle, LocateFixed, MapPin, X } from "lucide-react";
import { getIntensityBand, getRenewablePercentage, type RegionalReading } from "@/lib/carbonApi";
import { UK_REGIONS, findNearestRegion } from "@/lib/ukRegions";
import { StatusBadge } from "./StatusBadge";

interface RegionSelectorProps {
  selectedRegionId: number | null;
  onSelectRegion: (id: number | null) => void;
  selectedRegionData: RegionalReading | null;
}

export function RegionSelector({
  selectedRegionId,
  onSelectRegion,
  selectedRegionData,
}: RegionSelectorProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectError, setDetectError] = useState<string | null>(null);

  function handleDetect() {
    if (!("geolocation" in navigator)) {
      setDetectError("Geolocation isn't supported by this browser");
      return;
    }

    setIsDetecting(true);
    setDetectError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nearest = findNearestRegion(
          position.coords.latitude,
          position.coords.longitude
        );
        onSelectRegion(nearest.id);
        setIsDetecting(false);
      },
      () => {
        setDetectError("Location unavailable — pick your region below instead");
        setIsDetecting(false);
      },
      { timeout: 10_000 }
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded bg-cg-surface border border-cg-border p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleDetect}
          disabled={isDetecting}
          className="inline-flex items-center gap-2 rounded bg-cg-green px-3 py-2 text-sm font-semibold text-cg-on-green transition-colors hover:bg-cg-green/90 disabled:opacity-60"
        >
          {isDetecting ? (
            <LoaderCircle className="h-4 w-4 animate-spin" strokeWidth={2.25} />
          ) : (
            <LocateFixed className="h-4 w-4" strokeWidth={2.25} />
          )}
          Detect My Region
        </button>

        <label className="flex items-center gap-2 text-sm text-cg-text-secondary">
          or pick a region
          <select
            value={selectedRegionId ?? ""}
            onChange={(e) =>
              onSelectRegion(e.target.value ? Number(e.target.value) : null)
            }
            className="rounded border border-cg-border bg-cg-input-bg px-2 py-1.5 text-sm text-cg-text-primary focus:outline-none focus:ring-2 focus:ring-cg-green/60"
          >
            <option value="">Select…</option>
            {UK_REGIONS.map((region) => (
              <option key={region.id} value={region.id}>
                {region.shortName}
              </option>
            ))}
          </select>
        </label>

        {selectedRegionId !== null && (
          <button
            type="button"
            onClick={() => onSelectRegion(null)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-cg-text-secondary hover:text-cg-text-primary"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.25} />
            Clear
          </button>
        )}

        {detectError && (
          <p className="text-xs text-cg-amber">{detectError}</p>
        )}
      </div>

      {selectedRegionData && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded bg-cg-surface-high border border-cg-border px-4 py-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-cg-green" strokeWidth={2.25} />
            <div>
              <p className="text-xs uppercase tracking-wider text-cg-text-secondary">
                Your local grid — {selectedRegionData.shortName}
              </p>
              <p className="font-cg-mono text-2xl font-bold text-cg-text-primary">
                {selectedRegionData.intensity.forecast}
                <span className="ml-1 text-sm font-normal text-cg-text-secondary">
                  gCO2/kWh
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-cg-text-secondary">
              {getRenewablePercentage(selectedRegionData.generationMix).toFixed(0)}%
              renewable
            </p>
            <StatusBadge band={getIntensityBand(selectedRegionData.intensity.index)} />
          </div>
        </div>
      )}
    </div>
  );
}
