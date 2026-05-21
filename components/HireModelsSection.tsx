import type { HireModel } from "@/lib/types";
import Image from "next/image";

function accomplishmentLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function HireModelCard({ model, index }: { model: HireModel; index: number }) {
  const lines = accomplishmentLines(model.accomplishments);
  const hasVideo =
    typeof model.video_url === "string" && model.video_url.trim().length > 0;
  const hasImage =
    typeof model.image_url === "string" && model.image_url.trim().length > 0;

  return (
    <article className="hire-card reveal" style={{ transitionDelay: `${index * 0.08}s` }}>
      <div className="hire-card-media">
        {hasVideo ? (
          <video
            className="hire-card-video"
            controls
            playsInline
            preload="metadata"
            {...(hasImage ? { poster: model.image_url! } : {})}
          >
            <source src={model.video_url!} />
          </video>
        ) : hasImage ? (
          <Image
            src={model.image_url!}
            alt={model.name}
            width={480}
            height={640}
            className="hire-card-img"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={model.image_url!.includes("picsum.photos")}
          />
        ) : null}
      </div>
      <div className="hire-card-body">
        <h3 className="hire-card-name">{model.name}</h3>
        {lines.length > 0 ? (
          <ul className="hire-card-records">
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : (
          <p className="hire-card-records-empty">Career highlights coming soon.</p>
        )}
      </div>
    </article>
  );
}

export function HireModelsSection({ models }: { models: HireModel[] }) {
  return (
    <section className="section hire-section" id="hire-models">
      <div
        className="bg-glow"
        style={{
          background: "var(--gold)",
          right: "-180px",
          bottom: "10%",
        }}
      />
      <div className="section-inner">
        <div className="section-header reveal">
          <div>
            <div className="section-label">
              <span className="line" /> Available Talent
            </div>
            <h2 className="section-title">Hiring Models</h2>
            <p className="section-desc">
              Book proven faces for your next campaign, runway, or brand activation. Each profile
              includes verified experience and recent accomplishments.
            </p>
          </div>
        </div>

        {models.length === 0 ? (
          <p className="hire-empty reveal">Featured hire profiles will appear here soon.</p>
        ) : (
          <div className="hire-grid">
            {models.map((model, i) => (
              <HireModelCard key={model.id ?? `${model.name}-${i}`} model={model} index={i} />
            ))}
          </div>
        )}

        <div className="hire-cta reveal">
          <p>Need a specific look or market? Tell us your brief and we&apos;ll shortlist talent.</p>
          <a href="mailto:freshmodeling@gmail.com?subject=Model%20Hiring%20Inquiry" className="btn-primary">
            Request Talent
          </a>
        </div>
      </div>
    </section>
  );
}
