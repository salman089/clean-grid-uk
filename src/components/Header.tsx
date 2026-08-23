"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { getIntensityBand, type IntensityBand, type RegionalReading } from "@/lib/carbonApi";
import { StatusBadge } from "./StatusBadge";

const HEADER_LABEL: Record<IntensityBand, string> = {
  green: "LOW CARBON",
  amber: "MODERATE CARBON",
  red: "HIGH CARBON",
};

export function Header({ national }: { national: RegionalReading | null }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const kickoff = setTimeout(() => setNow(new Date()), 0);
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearTimeout(kickoff);
      clearInterval(id);
    };
  }, []);

  const band = national ? getIntensityBand(national.intensity.index) : null;

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-cg-border pb-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded bg-cg-green/10 text-cg-green">
          <Zap className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <div>
          <h1 className="text-2xl font-semibold leading-tight text-cg-text-primary">
            CleanGrid UK
          </h1>
          <p className="text-xs text-cg-text-secondary">
            Live carbon intensity monitoring
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <time className="font-cg-mono text-sm tabular-nums text-cg-text-secondary">
          {now ? now.toLocaleTimeString("en-GB") : "--:--:--"}
        </time>
        {band && <StatusBadge band={band} label={HEADER_LABEL[band]} />}
      </div>
    </header>
  );
}
