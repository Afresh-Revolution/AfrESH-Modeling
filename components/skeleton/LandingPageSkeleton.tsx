import { Skeleton } from "./Skeleton";

function SectionHeaderSkeleton() {
  return (
    <div className="section-header skeleton-section-header">
      <div>
        <Skeleton width={140} height={12} className="skeleton-section-label" />
        <Skeleton width="min(420px, 70vw)" height={42} className="skeleton-section-title" />
        <Skeleton width="min(520px, 85vw)" height={16} className="skeleton-section-desc" />
      </div>
    </div>
  );
}

export function LandingPageSkeleton() {
  return (
    <div className="landing-skeleton" aria-busy="true" aria-label="Loading page">
      <header className="landing-skeleton-nav">
        <Skeleton width={120} height={36} rounded />
        <div className="landing-skeleton-nav-links">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} width={72} height={12} />
          ))}
          <Skeleton width={96} height={36} rounded />
        </div>
      </header>

      <section className="landing-skeleton-hero">
        <Skeleton width={180} height={28} rounded className="landing-skeleton-hero-badge" />
        <Skeleton width="min(640px, 80vw)" height={72} className="landing-skeleton-hero-title" />
        <Skeleton width="min(420px, 60vw)" height={18} className="landing-skeleton-hero-subtitle" />
        <div className="landing-skeleton-hero-actions">
          <Skeleton width={160} height={46} rounded />
          <Skeleton width={160} height={46} rounded />
        </div>
      </section>

      <section className="landing-skeleton-stats">
        <div className="stats-grid">
          {Array.from({ length: 4 }, (_, i) => (
            <div className="stat-item" key={i}>
              <Skeleton width={96} height={34} />
              <Skeleton width={120} height={12} className="landing-skeleton-stat-label" />
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <SectionHeaderSkeleton />
          <div className="landing-skeleton-film-grid">
            {Array.from({ length: 2 }, (_, i) => (
              <Skeleton key={i} className="landing-skeleton-film-card" />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <SectionHeaderSkeleton />
          <div className="landing-skeleton-carousel">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="landing-skeleton-model-card" />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <SectionHeaderSkeleton />
          <div className="landing-skeleton-hire-grid">
            {Array.from({ length: 3 }, (_, i) => (
              <div className="landing-skeleton-hire-card" key={i}>
                <Skeleton className="landing-skeleton-hire-media" />
                <Skeleton width="55%" height={22} />
                <Skeleton width="90%" height={12} />
                <Skeleton width="75%" height={12} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section eco-section">
        <div className="section-inner">
          <SectionHeaderSkeleton />
          <div className="eco-flow">
            {Array.from({ length: 4 }, (_, i) => (
              <div className="landing-skeleton-eco-card" key={i}>
                <Skeleton width={44} height={44} rounded />
                <Skeleton width={72} height={12} />
                <Skeleton width="80%" height={22} />
                <Skeleton width="100%" height={12} />
                <Skeleton width="88%" height={12} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section data-section">
        <div className="section-inner">
          <SectionHeaderSkeleton />
          <div className="landing-skeleton-charts">
            {Array.from({ length: 2 }, (_, i) => (
              <Skeleton key={i} className="landing-skeleton-chart-card" />
            ))}
          </div>
          <div className="key-metrics">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="landing-skeleton-metric-card" />
            ))}
          </div>
        </div>
      </section>

      <section className="section apply-section">
        <div className="section-inner">
          <SectionHeaderSkeleton />
          <div className="apply-grid">
            <div className="landing-skeleton-apply-info">
              <Skeleton width="45%" height={28} />
              <Skeleton width="100%" height={12} />
              <Skeleton width="92%" height={12} />
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} width="78%" height={12} />
              ))}
            </div>
            <div className="landing-skeleton-apply-form">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} width="100%" height={48} rounded="12px" />
              ))}
              <Skeleton width="100%" height={120} rounded="12px" />
              <Skeleton width="100%" height={52} rounded="999px" />
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--bg-secondary)" }}>
        <div className="section-inner">
          <SectionHeaderSkeleton />
          <div className="gallery-grid landing-skeleton-gallery">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className={`landing-skeleton-gallery-item gallery-item-${i + 1}`} />
            ))}
          </div>
        </div>
      </section>

      <footer className="landing-skeleton-footer">
        <Skeleton width={120} height={36} />
        <Skeleton width="min(320px, 70vw)" height={14} />
        <div className="landing-skeleton-footer-links">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} width={64} height={12} />
          ))}
        </div>
      </footer>
    </div>
  );
}
