export type CategorySlice = { label: string; value: number };
export type YearRate = { year: number; rate: number };

export type SiteMetrics = {
  total_earnings_display: string;
  brand_partnerships: number;
  countries_placements: number;
  models_represented: number;
  campaigns_delivered: number;
  years_excellence: number;
  placement_rate_percent: number;
  category_distribution: CategorySlice[];
  placement_by_year: YearRate[];
};

export const DEFAULT_SITE_METRICS: SiteMetrics = {
  total_earnings_display: "₦6.5B",
  brand_partnerships: 87,
  countries_placements: 32,
  models_represented: 250,
  campaigns_delivered: 1200,
  years_excellence: 12,
  placement_rate_percent: 94,
  category_distribution: [
    { label: "Editorial", value: 35 },
    { label: "Commercial", value: 25 },
    { label: "Runway", value: 20 },
    { label: "Plus Size", value: 12 },
    { label: "Fitness", value: 8 },
  ],
  placement_by_year: [
    { year: 2019, rate: 72 },
    { year: 2020, rate: 65 },
    { year: 2021, rate: 78 },
    { year: 2022, rate: 85 },
    { year: 2023, rate: 91 },
    { year: 2024, rate: 94 },
    { year: 2025, rate: 95 },
    { year: 2026, rate: 96 },
  ],
};

function isCategorySlice(x: unknown): x is CategorySlice {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return typeof o.label === "string" && typeof o.value === "number" && Number.isFinite(o.value);
}

function isYearRate(x: unknown): x is YearRate {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return typeof o.year === "number" && typeof o.rate === "number" && Number.isFinite(o.rate);
}

export function parseSiteMetricsRow(row: Record<string, unknown>): SiteMetrics {
  let category_distribution: CategorySlice[] = DEFAULT_SITE_METRICS.category_distribution;
  const cd = row.category_distribution;
  if (Array.isArray(cd) && cd.every(isCategorySlice)) {
    category_distribution = cd;
  } else if (typeof cd === "string") {
    try {
      const j = JSON.parse(cd) as unknown;
      if (Array.isArray(j) && j.every(isCategorySlice)) category_distribution = j;
    } catch {
      /* keep default */
    }
  }

  let placement_by_year: YearRate[] = DEFAULT_SITE_METRICS.placement_by_year;
  const py = row.placement_by_year;
  if (Array.isArray(py) && py.every(isYearRate)) {
    placement_by_year = py;
  } else if (typeof py === "string") {
    try {
      const j = JSON.parse(py) as unknown;
      if (Array.isArray(j) && j.every(isYearRate)) placement_by_year = j;
    } catch {
      /* keep default */
    }
  }

  const num = (v: unknown, d: number) => {
    const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
    return Number.isFinite(n) ? Math.trunc(n) : d;
  };

  return {
    total_earnings_display:
      typeof row.total_earnings_display === "string" && row.total_earnings_display.trim()
        ? row.total_earnings_display.trim()
        : DEFAULT_SITE_METRICS.total_earnings_display,
    brand_partnerships: num(row.brand_partnerships, DEFAULT_SITE_METRICS.brand_partnerships),
    countries_placements: num(
      row.countries_placements,
      DEFAULT_SITE_METRICS.countries_placements
    ),
    models_represented: num(row.models_represented, DEFAULT_SITE_METRICS.models_represented),
    campaigns_delivered: num(row.campaigns_delivered, DEFAULT_SITE_METRICS.campaigns_delivered),
    years_excellence: num(row.years_excellence, DEFAULT_SITE_METRICS.years_excellence),
    placement_rate_percent: num(
      row.placement_rate_percent,
      DEFAULT_SITE_METRICS.placement_rate_percent
    ),
    category_distribution,
    placement_by_year,
  };
}
