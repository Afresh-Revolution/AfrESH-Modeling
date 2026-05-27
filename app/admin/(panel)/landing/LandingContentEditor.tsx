"use client";

import { updateLandingContentAction } from "../../actions";
import styles from "../../admin.module.scss";
import type { LandingContent } from "@/lib/landingContent";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const FIELD_META: Array<{ key: keyof LandingContent; label: string; multiline?: boolean }> = [
  { key: "hero_badge", label: "Hero badge" },
  { key: "hero_title_prefix", label: "Hero title prefix" },
  { key: "hero_title_highlight", label: "Hero title highlight" },
  { key: "hero_subtitle", label: "Hero subtitle" },
  { key: "hero_primary_cta", label: "Hero primary CTA" },
  { key: "hero_secondary_cta", label: "Hero secondary CTA" },
  { key: "models_section_label", label: "Models section label" },
  { key: "models_section_title", label: "Models section title" },
  { key: "models_section_description", label: "Models section description", multiline: true },
  { key: "ecosystem_section_label", label: "Ecosystem section label" },
  { key: "ecosystem_section_title", label: "Ecosystem section title" },
  { key: "ecosystem_section_description", label: "Ecosystem section description", multiline: true },
  { key: "data_section_label", label: "Data section label" },
  { key: "data_section_title", label: "Data section title" },
  { key: "data_section_description", label: "Data section description", multiline: true },
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
  const router = useRouter();
  const [content, setContent] = useState<LandingContent>(initial);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const fields = useMemo(() => FIELD_META, []);

  useEffect(() => {
    setContent(initial);
  }, [initial]);

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
            await updateLandingContentAction(content);
            setNotice({ kind: "ok", text: "Landing page content saved." });
            router.refresh();
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

        <button
          type="submit"
          className={`${styles.btn} ${styles.btnGold}`}
          style={{ marginTop: "1.25rem" }}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save landing content"}
        </button>
      </form>
    </main>
  );
}
