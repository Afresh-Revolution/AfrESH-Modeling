import type { CSSProperties } from "react";
import type { EditorialItem } from "@/lib/types";
import type { LandingContent } from "@/lib/landingContent";

export function VideoShowcase({
  items,
  content,
}: {
  items: EditorialItem[];
  content: LandingContent;
}) {
  return (
    <section className="section film-section" id="film">
      <div
        className="bg-glow"
        style={{
          background: "var(--gold)",
          left: "50%",
          top: "20%",
          transform: "translateX(-50%)",
        }}
      />
      <div className="section-inner">
        <div className="section-header reveal">
          <div>
            <div className="section-label">
              <span className="line" /> {content.film_section_label}
            </div>
            <h2 className="section-title">{content.film_section_title}</h2>
            <p className="section-desc">{content.film_section_description}</p>
          </div>
        </div>
        {items.length === 0 ? (
          <p className="film-empty reveal">{content.film_empty_text}</p>
        ) : (
          <div
            className="film-grid reveal"
            data-layout={items.length === 1 ? "single" : "multi"}
            style={
              {
                "--film-cols-lg": Math.min(items.length, 4),
                "--film-cols-sm": Math.min(items.length, 2),
              } as CSSProperties
            }
          >
            {items.map((item, i) => (
              <div className="film-card" key={item.id ?? `${item.title}-${i}`}>
                <video
                  controls
                  playsInline
                  preload="metadata"
                  {...(item.image_url
                    ? { poster: item.image_url }
                    : {})}
                  className="film-video"
                >
                  <source src={item.video_url!} />
                </video>
                <div className="film-card-caption">{item.title}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
