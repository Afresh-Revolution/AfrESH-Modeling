import type { EditorialItem } from "@/lib/types";

export function VideoShowcase({ items }: { items: EditorialItem[] }) {
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
              <span className="line" /> Motion
            </div>
            <h2 className="section-title">Film &amp; Campaign</h2>
            <p className="section-desc">
              Moving image from recent productions and brand work across the{" "}
              <strong style={{ color: "var(--gold)" }}>ONYXX</strong> roster.
            </p>
          </div>
        </div>
        {items.length === 0 ? (
          <p className="film-empty reveal">
            Featured campaign films and motion work will appear here.
          </p>
        ) : (
          <div className="film-grid reveal">
            {items.map((item, i) => (
              <div className="film-card" key={item.id ?? `${item.title}-${i}`}>
                <video
                  controls
                  playsInline
                  preload="metadata"
                  poster={item.image_url}
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
