"use client";

import { SkeletonButton } from "@/components/skeleton/Skeleton";
import { updateLandingContentAction } from "../../actions";
import styles from "../../admin.module.scss";
import type { LandingContent } from "@/lib/landingContent";
import { emitContentUpdate } from "@/lib/contentSync";
import { useMemo, useState } from "react";

const FIELD_META: Array<{ key: keyof LandingContent; label: string; multiline?: boolean }> = [
  { key: "nav_models_label", label: "Nav models label" },
  { key: "nav_hiring_label", label: "Nav hiring label" },
  { key: "nav_ecosystem_label", label: "Nav ecosystem label" },
  { key: "nav_insights_label", label: "Nav insights label" },
  { key: "nav_film_label", label: "Nav film label" },
  { key: "nav_editorial_label", label: "Nav editorial label" },
  { key: "nav_apply_label", label: "Nav apply label" },
  { key: "hero_badge", label: "Hero badge" },
  { key: "hero_title_prefix", label: "Hero title prefix" },
  { key: "hero_title_highlight", label: "Hero title highlight" },
  { key: "hero_subtitle", label: "Hero subtitle" },
  { key: "hero_primary_cta", label: "Hero primary CTA" },
  { key: "hero_secondary_cta", label: "Hero secondary CTA" },
  { key: "hero_scroll_label", label: "Hero scroll label" },
  { key: "models_section_label", label: "Models section label" },
  { key: "models_section_title", label: "Models section title" },
  { key: "models_section_description", label: "Models section description", multiline: true },
  { key: "hire_section_label", label: "Hire section label" },
  { key: "hire_section_title", label: "Hire section title" },
  { key: "hire_section_description", label: "Hire section description", multiline: true },
  { key: "hire_empty_text", label: "Hire empty text", multiline: true },
  { key: "hire_cta_text", label: "Hire CTA text", multiline: true },
  { key: "hire_cta_button", label: "Hire CTA button" },
  { key: "film_section_label", label: "Film section label" },
  { key: "film_section_title", label: "Film section title" },
  { key: "film_section_description", label: "Film section description", multiline: true },
  { key: "film_empty_text", label: "Film empty text", multiline: true },
  { key: "ecosystem_section_label", label: "Ecosystem section label" },
  { key: "ecosystem_section_title", label: "Ecosystem section title" },
  { key: "ecosystem_section_description", label: "Ecosystem section description", multiline: true },
  { key: "ecosystem_phase_1_title", label: "Ecosystem phase 1 title" },
  { key: "ecosystem_phase_1_description", label: "Ecosystem phase 1 description", multiline: true },
  { key: "ecosystem_phase_2_title", label: "Ecosystem phase 2 title" },
  { key: "ecosystem_phase_2_description", label: "Ecosystem phase 2 description", multiline: true },
  { key: "ecosystem_phase_3_title", label: "Ecosystem phase 3 title" },
  { key: "ecosystem_phase_3_description", label: "Ecosystem phase 3 description", multiline: true },
  { key: "ecosystem_phase_4_title", label: "Ecosystem phase 4 title" },
  { key: "ecosystem_phase_4_description", label: "Ecosystem phase 4 description", multiline: true },
  { key: "ecosystem_arrow_text", label: "Ecosystem arrow text" },
  { key: "data_section_label", label: "Data section label" },
  { key: "data_section_title", label: "Data section title" },
  { key: "data_section_description", label: "Data section description", multiline: true },
  { key: "stats_models_label", label: "Stats models label" },
  { key: "stats_campaigns_label", label: "Stats campaigns label" },
  { key: "stats_years_label", label: "Stats years label" },
  { key: "stats_placement_rate_label", label: "Stats placement rate label" },
  { key: "data_metric_total_earnings_label", label: "Data metric total earnings label" },
  { key: "data_metric_brand_partnerships_label", label: "Data metric brand partnerships label" },
  { key: "data_metric_countries_label", label: "Data metric countries label" },
  { key: "apply_section_label", label: "Apply section label" },
  { key: "apply_section_title", label: "Apply section title" },
  { key: "apply_section_description", label: "Apply section description", multiline: true },
  { key: "apply_requirements_title", label: "Apply requirements title" },
  { key: "apply_requirements_intro", label: "Apply requirements intro", multiline: true },
  { key: "apply_requirement_1", label: "Apply requirement 1" },
  { key: "apply_requirement_2", label: "Apply requirement 2" },
  { key: "apply_requirement_3", label: "Apply requirement 3" },
  { key: "apply_requirement_4", label: "Apply requirement 4" },
  { key: "apply_requirement_5", label: "Apply requirement 5" },
  { key: "apply_requirement_6", label: "Apply requirement 6" },
  { key: "gallery_section_label", label: "Gallery section label" },
  { key: "gallery_section_title", label: "Gallery section title" },
  { key: "gallery_section_description", label: "Gallery section description", multiline: true },
  { key: "gallery_empty_text", label: "Gallery empty text", multiline: true },
  { key: "footer_brand_description", label: "Footer brand description", multiline: true },
  { key: "footer_contact_location", label: "Footer contact location" },
  { key: "footer_contact_email", label: "Footer contact email" },
  { key: "footer_apply_button", label: "Footer apply button" },
  { key: "footer_portfolio_button", label: "Footer portfolio button" },
  { key: "footer_contact_button", label: "Footer contact button" },
  { key: "footer_copyright_year", label: "Footer copyright year" },
  { key: "footer_copyright_text", label: "Footer copyright text" },
];

export default function LandingContentEditor({
  initial,
  setupHint,
}: {
  initial: LandingContent;
  setupHint?: string | null;
}) {
  const [content, setContent] = useState<LandingContent>(initial);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const fields = useMemo(() => FIELD_META, []);

  return (
    <main className={styles.adminMain}>
      <h1 className={styles.adminTitle}>Landing content</h1>
      <p className={styles.adminSubtitle}>
        Edit all homepage copy from hero to footer. Fields are prefilled with current live values.
      </p>

      {setupHint ? (
        <p className={styles.inlineError} style={{ marginBottom: "1rem" }}>
          {setupHint}
        </p>
      ) : null}

      <form
        className={styles.card}
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          setNotice(null);
          try {
            const saved = await updateLandingContentAction(content);
            setContent(saved);
            emitContentUpdate("landing-content-update");
            setNotice({ kind: "ok", text: "Landing page content saved." });
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
        <div className={styles.formGrid}>
          {fields.map((field) => (
            <div key={field.key}>
              <label className={styles.label}>{field.label}</label>
              {field.multiline ? (
                <textarea
                  className={styles.input}
                  rows={4}
                  value={content[field.key]}
                  onChange={(e) =>
                    setContent((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                />
              ) : (
                <input
                  className={styles.input}
                  value={content[field.key]}
                  onChange={(e) =>
                    setContent((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                />
              )}
            </div>
          ))}
        </div>

        {notice ? (
          <p
            className={notice.kind === "ok" ? styles.adminSubtitle : styles.inlineError}
            style={{ marginTop: "1rem", marginBottom: 0 }}
          >
            {notice.text}
          </p>
        ) : null}

        <SkeletonButton
          type="submit"
          className={`${styles.btn} ${styles.btnGold}`}
          style={{ marginTop: "1.25rem" }}
          loading={saving}
          loadingLabel="Saving landing content"
        >
          Save landing content
        </SkeletonButton>
      </form>
    </main>
  );
}
