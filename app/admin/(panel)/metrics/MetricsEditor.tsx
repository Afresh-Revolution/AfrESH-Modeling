"use client";

import { SkeletonButton } from "@/components/skeleton/Skeleton";
import { updateSiteMetricsAction } from "../../actions";
import styles from "../../admin.module.scss";
import type { CategorySlice, SiteMetrics, YearRate } from "@/lib/siteMetrics";
import { emitContentUpdate } from "@/lib/contentSync";
import { useState } from "react";

function clone<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

export function MetricsEditor({ initial }: { initial: SiteMetrics }) {
  const [m, setM] = useState<SiteMetrics>(() => clone(initial));
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function updateCategory(i: number, patch: Partial<CategorySlice>) {
    setM((prev) => {
      const next = clone(prev);
      next.category_distribution[i] = { ...next.category_distribution[i], ...patch };
      return next;
    });
  }

  function addCategory() {
    setM((prev) => ({
      ...prev,
      category_distribution: [...prev.category_distribution, { label: "New", value: 0 }],
    }));
  }

  function removeCategory(i: number) {
    setM((prev) => ({
      ...prev,
      category_distribution: prev.category_distribution.filter((_, j) => j !== i),
    }));
  }

  function updateYear(i: number, patch: Partial<YearRate>) {
    setM((prev) => {
      const next = clone(prev);
      next.placement_by_year[i] = { ...next.placement_by_year[i], ...patch };
      return next;
    });
  }

  function addYear() {
    setM((prev) => {
      const years = prev.placement_by_year.map((r) => r.year);
      const nextYear = years.length ? Math.max(...years) + 1 : new Date().getFullYear();
      return {
        ...prev,
        placement_by_year: [...prev.placement_by_year, { year: nextYear, rate: 0 }],
      };
    });
  }

  function removeYear(i: number) {
    setM((prev) => ({
      ...prev,
      placement_by_year: prev.placement_by_year.filter((_, j) => j !== i),
    }));
  }

  return (
    <main className={styles.adminMain}>
      <h1 className={styles.adminTitle}>Site metrics &amp; charts</h1>
      <p className={styles.adminSubtitle}>
        Values here power the homepage stats bar, &ldquo;By The Numbers&rdquo; headline cards, and the
        two performance charts. Save to update the live site.
      </p>

      <form
        className={styles.card}
        onSubmit={async (e) => {
          e.preventDefault();
          setNotice(null);
          if (m.category_distribution.length < 1) {
            setNotice({ kind: "err", text: "Add at least one category slice." });
            return;
          }
          if (m.placement_by_year.length < 1) {
            setNotice({ kind: "err", text: "Add at least one year for the bar chart." });
            return;
          }
          if (m.placement_rate_percent < 0 || m.placement_rate_percent > 100) {
            setNotice({ kind: "err", text: "Placement rate must be between 0 and 100." });
            return;
          }
          setSaving(true);
          try {
            const saved = await updateSiteMetricsAction(m);
            setM(clone(saved));
            emitContentUpdate("site-metrics-update");
            setNotice({ kind: "ok", text: "Saved. Homepage updated." });
          } catch (err) {
            setNotice({
              kind: "err",
              text: err instanceof Error ? err.message : "Save failed",
            });
          } finally {
            setSaving(false);
          }
        }}
      >
        <h2 className={styles.adminTitle} style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
          Key metrics (homepage cards)
        </h2>
        <div className={styles.formGrid}>
          <div>
            <label className={styles.label} htmlFor="earn">
              Total earnings (Naira display text)
            </label>
            <input
              id="earn"
              className={styles.input}
              value={m.total_earnings_display}
              onChange={(e) => setM((p) => ({ ...p, total_earnings_display: e.target.value }))}
              placeholder="₦6.5B"
            />
          </div>
          <div>
            <label className={styles.label} htmlFor="bp">
              Brand partnerships
            </label>
            <input
              id="bp"
              type="number"
              min={0}
              className={styles.input}
              value={m.brand_partnerships}
              onChange={(e) =>
                setM((p) => ({ ...p, brand_partnerships: Number(e.target.value) || 0 }))
              }
            />
          </div>
          <div>
            <label className={styles.label} htmlFor="cc">
              Countries with placements
            </label>
            <input
              id="cc"
              type="number"
              min={0}
              className={styles.input}
              value={m.countries_placements}
              onChange={(e) =>
                setM((p) => ({ ...p, countries_placements: Number(e.target.value) || 0 }))
              }
            />
          </div>
        </div>

        <h2 className={styles.adminTitle} style={{ fontSize: "1.1rem", margin: "2rem 0 1rem" }}>
          Stats bar (hero strip)
        </h2>
        <div className={styles.formGrid}>
          <div>
            <label className={styles.label}>Models represented</label>
            <input
              type="number"
              min={0}
              className={styles.input}
              value={m.models_represented}
              onChange={(e) =>
                setM((p) => ({ ...p, models_represented: Number(e.target.value) || 0 }))
              }
            />
          </div>
          <div>
            <label className={styles.label}>Campaigns delivered</label>
            <input
              type="number"
              min={0}
              className={styles.input}
              value={m.campaigns_delivered}
              onChange={(e) =>
                setM((p) => ({ ...p, campaigns_delivered: Number(e.target.value) || 0 }))
              }
            />
          </div>
          <div>
            <label className={styles.label}>Years of excellence</label>
            <input
              type="number"
              min={0}
              className={styles.input}
              value={m.years_excellence}
              onChange={(e) =>
                setM((p) => ({ ...p, years_excellence: Number(e.target.value) || 0 }))
              }
            />
          </div>
          <div>
            <label className={styles.label}>Placement rate (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              className={styles.input}
              value={m.placement_rate_percent}
              onChange={(e) =>
                setM((p) => ({ ...p, placement_rate_percent: Number(e.target.value) || 0 }))
              }
            />
          </div>
        </div>

        <h2 className={styles.adminTitle} style={{ fontSize: "1.1rem", margin: "2rem 0 1rem" }}>
          Doughnut chart — category slices (values shown as % in tooltip)
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {m.category_distribution.map((row, i) => (
            <div
              key={`cat-${i}`}
              style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}
            >
              <input
                className={styles.input}
                style={{ flex: "1 1 140px" }}
                value={row.label}
                onChange={(e) => updateCategory(i, { label: e.target.value })}
                aria-label={`Category ${i + 1} label`}
              />
              <input
                type="number"
                className={styles.input}
                style={{ width: "100px" }}
                value={row.value}
                onChange={(e) =>
                  updateCategory(i, { value: Number(e.target.value) || 0 })
                }
                aria-label={`Category ${i + 1} value`}
              />
              <button
                type="button"
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={() => removeCategory(i)}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={addCategory}>
            Add slice
          </button>
        </div>

        <h2 className={styles.adminTitle} style={{ fontSize: "1.1rem", margin: "2rem 0 1rem" }}>
          Bar chart — placement rate by year
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {m.placement_by_year.map((row, i) => (
            <div
              key={`yr-${row.year}-${i}`}
              style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}
            >
              <input
                type="number"
                className={styles.input}
                style={{ width: "110px" }}
                value={row.year}
                onChange={(e) => updateYear(i, { year: Number(e.target.value) || 0 })}
                aria-label={`Year ${i + 1}`}
              />
              <input
                type="number"
                min={0}
                max={100}
                className={styles.input}
                style={{ width: "100px" }}
                value={row.rate}
                onChange={(e) => updateYear(i, { rate: Number(e.target.value) || 0 })}
                aria-label={`Rate ${i + 1}`}
              />
              <span style={{ fontSize: "0.75rem", color: "#888" }}>%</span>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={() => removeYear(i)}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={addYear}>
            Add year
          </button>
        </div>

        {notice ? (
          <p
            className={notice.kind === "ok" ? styles.adminSubtitle : styles.inlineError}
            style={{ marginTop: "1.25rem" }}
          >
            {notice.text}
          </p>
        ) : null}

        <SkeletonButton
          type="submit"
          className={`${styles.btn} ${styles.btnGold}`}
          style={{ marginTop: "1.5rem" }}
          loading={saving}
          loadingLabel="Saving metrics"
        >
          Save all metrics
        </SkeletonButton>
      </form>
    </main>
  );
}
