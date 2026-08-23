const REGIONAL_ENDPOINT = "https://api.carbonintensity.org.uk/regional";
const REGIONAL_RANGE_ENDPOINT = "https://api.carbonintensity.org.uk/regional/intensity";
const GENERATION_ENDPOINT = "https://api.carbonintensity.org.uk/generation";
const NATIONAL_FORECAST_ENDPOINT = "https://api.carbonintensity.org.uk/intensity";
const REGIONAL_FORECAST_ENDPOINT =
  "https://api.carbonintensity.org.uk/regional/intensity";

/** Fuel sources counted toward "renewable" (excludes low-carbon-but-not-renewable nuclear/imports). */
const RENEWABLE_FUELS = new Set(["biomass", "hydro", "solar", "wind"]);

/** regionid values that are country/GB aggregates rather than a real DNO region. */
const AGGREGATE_REGION_IDS = new Set([15, 16, 17, 18]);
const NATIONAL_REGION_ID = 18;

export type CarbonIntensityIndex =
  | "very low"
  | "low"
  | "moderate"
  | "high"
  | "very high";

export type IntensityBand = "green" | "amber" | "red";

export interface FuelMix {
  fuel: string;
  perc: number;
}

export interface RegionIntensity {
  forecast: number;
  index: CarbonIntensityIndex;
}

export interface RegionalReading {
  regionId: number;
  dnoRegion: string;
  shortName: string;
  intensity: RegionIntensity;
  generationMix: FuelMix[];
}

export interface RegionalSnapshot {
  /** Start of the current half-hourly settlement period (ISO 8601). */
  from: string;
  /** End of the current half-hourly settlement period (ISO 8601). */
  to: string;
  /** The 14 DNO distribution regions, excludes country/GB aggregates. */
  regions: RegionalReading[];
  /** The GB-wide aggregate reading (regionid 18). */
  national: RegionalReading;
}

interface RawRegionalResponse {
  data: {
    from: string;
    to: string;
    regions: {
      regionid: number;
      dnoregion: string;
      shortname: string;
      intensity: RegionIntensity;
      generationmix: FuelMix[];
    }[];
  }[];
}

function toReading(raw: RawRegionalResponse["data"][number]["regions"][number]): RegionalReading {
  return {
    regionId: raw.regionid,
    dnoRegion: raw.dnoregion,
    shortName: raw.shortname,
    intensity: raw.intensity,
    generationMix: raw.generationmix,
  };
}

async function fetchRegionalPeriod(url: string): Promise<RegionalSnapshot> {
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(
      `Carbon Intensity API responded with ${res.status} ${res.statusText}`
    );
  }

  const json = (await res.json()) as RawRegionalResponse;
  const period = json.data?.[0];

  if (!period || !Array.isArray(period.regions)) {
    throw new Error("Carbon Intensity API returned an unexpected response shape");
  }

  const readings = period.regions.map(toReading);
  const national = readings.find((r) => r.regionId === NATIONAL_REGION_ID);

  if (!national) {
    throw new Error("Carbon Intensity API response is missing the GB national reading");
  }

  return {
    from: period.from,
    to: period.to,
    regions: readings.filter((r) => !AGGREGATE_REGION_IDS.has(r.regionId)),
    national,
  };
}

/** Fetches the current GB regional carbon intensity snapshot. */
export async function fetchRegionalIntensity(): Promise<RegionalSnapshot> {
  return fetchRegionalPeriod(REGIONAL_ENDPOINT);
}

/** Fetches the regional snapshot for the half-hour settlement period ~24 hours ago, for trend comparison. */
export async function fetchRegionalIntensity24hAgo(): Promise<RegionalSnapshot> {
  const from = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const to = new Date(from.getTime() + 30 * 60 * 1000);
  return fetchRegionalPeriod(
    `${REGIONAL_RANGE_ENDPOINT}/${from.toISOString()}/${to.toISOString()}`
  );
}

/** Percentage of a generation mix coming from renewable sources (biomass, hydro, solar, wind). */
export function getRenewablePercentage(mix: FuelMix[]): number {
  const total = mix.reduce((sum, f) => sum + f.perc, 0);
  if (total <= 0) return 0;
  const renewable = mix
    .filter((f) => RENEWABLE_FUELS.has(f.fuel))
    .reduce((sum, f) => sum + f.perc, 0);
  return (renewable / total) * 100;
}

/** Maps the API's 5-level index onto the dashboard's 3-tier Green/Amber/Red status. */
export function getIntensityBand(index: CarbonIntensityIndex): IntensityBand {
  switch (index) {
    case "very low":
    case "low":
      return "green";
    case "moderate":
      return "amber";
    case "high":
    case "very high":
      return "red";
  }
}

/** Categorizes each fuel source onto the same Green/Amber/Red scale used for intensity. */
const FUEL_BAND: Record<string, IntensityBand> = {
  biomass: "green",
  hydro: "green",
  solar: "green",
  wind: "green",
  nuclear: "green",
  imports: "amber",
  other: "amber",
  gas: "red",
  coal: "red",
};

export function getFuelBand(fuel: string): IntensityBand {
  return FUEL_BAND[fuel] ?? "amber";
}

export interface GenerationSnapshot {
  from: string;
  to: string;
  mix: FuelMix[];
}

interface RawGenerationResponse {
  data: {
    from: string;
    to: string;
    generationmix: FuelMix[];
  };
}

/** Fetches the current GB-wide generation fuel mix. */
export async function fetchGenerationMix(): Promise<GenerationSnapshot> {
  const res = await fetch(GENERATION_ENDPOINT, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(
      `Carbon Intensity API responded with ${res.status} ${res.statusText}`
    );
  }

  const json = (await res.json()) as RawGenerationResponse;
  const period = json.data;

  if (!period || !Array.isArray(period.generationmix)) {
    throw new Error("Carbon Intensity API returned an unexpected response shape");
  }

  return { from: period.from, to: period.to, mix: period.generationmix };
}

export interface ForecastPeriod {
  from: string;
  to: string;
  forecast: number;
  index: CarbonIntensityIndex;
}

interface RawNationalForecastResponse {
  data: {
    from: string;
    to: string;
    intensity: { forecast: number; actual: number | null; index: CarbonIntensityIndex };
  }[];
}

interface RawRegionalForecastResponse {
  data: {
    regionid: number;
    dnoregion: string;
    shortname: string;
    data: {
      from: string;
      to: string;
      intensity: { forecast: number; index: CarbonIntensityIndex };
    }[];
  };
}

/** Fetches the GB national carbon intensity forecast for the next 24 hours (48 half-hour periods). */
export async function fetchNationalForecast(): Promise<ForecastPeriod[]> {
  const from = new Date().toISOString();
  const res = await fetch(`${NATIONAL_FORECAST_ENDPOINT}/${from}/fw24h`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(
      `Carbon Intensity API responded with ${res.status} ${res.statusText}`
    );
  }

  const json = (await res.json()) as RawNationalForecastResponse;

  if (!Array.isArray(json.data)) {
    throw new Error("Carbon Intensity API returned an unexpected response shape");
  }

  return json.data.map((p) => ({
    from: p.from,
    to: p.to,
    forecast: p.intensity.forecast,
    index: p.intensity.index,
  }));
}

/** Fetches a single DNO region's carbon intensity forecast for the next 24 hours. */
export async function fetchRegionalForecast(regionId: number): Promise<ForecastPeriod[]> {
  const from = new Date().toISOString();
  const res = await fetch(
    `${REGIONAL_FORECAST_ENDPOINT}/${from}/fw24h/regionid/${regionId}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error(
      `Carbon Intensity API responded with ${res.status} ${res.statusText}`
    );
  }

  const json = (await res.json()) as RawRegionalForecastResponse;
  const periods = json.data?.data;

  if (!Array.isArray(periods)) {
    throw new Error("Carbon Intensity API returned an unexpected response shape");
  }

  return periods.map((p) => ({
    from: p.from,
    to: p.to,
    forecast: p.intensity.forecast,
    index: p.intensity.index,
  }));
}
