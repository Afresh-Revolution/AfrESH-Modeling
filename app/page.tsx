import { ApplyForm } from "@/components/ApplyForm";
import { DataCharts } from "@/components/DataCharts";
import { GalleryGrid } from "@/components/GalleryGrid";
import { HeroSection } from "@/components/HeroSection";
import { LandingLiveUpdates } from "@/components/LandingLiveUpdates";
import { LandingPullToRefresh } from "@/components/LandingPullToRefresh";
import { ModelsCarousel } from "@/components/ModelsCarousel";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { StatsBar } from "@/components/StatsBar";
import { VideoShowcase } from "@/components/VideoShowcase";
import { HireModelsSection } from "@/components/HireModelsSection";
import {
  fetchEditorial,
  fetchHireModels,
  fetchLandingContent,
  fetchRoster,
  fetchSiteMetrics,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [roster, editorial, hireModels, metrics, landing] = await Promise.all([
    fetchRoster(),
    fetchEditorial(),
    fetchHireModels(),
    fetchSiteMetrics(),
    fetchLandingContent(),
  ]);
  const filmItems = editorial.filter(
    (e) => typeof e.video_url === "string" && e.video_url.length > 0,
  );
  const campaignItems = editorial.filter(
    (e) => typeof e.image_url === "string" && e.image_url.length > 0,
  );

  return (
    <>
      <LandingLiveUpdates />
      <LandingPullToRefresh />
      <SiteNav content={landing} />
      <HeroSection content={landing} />
      <StatsBar metrics={metrics} content={landing} />

      <VideoShowcase items={filmItems} content={landing} />

      <section className="section" id="models">
        <div
          className="bg-glow"
          style={{
            background: "var(--gold)",
            left: "-200px",
            top: 0,
          }}
        />
        <div className="section-inner">
          <div className="section-header reveal">
            <div>
              <div className="section-label">
                <span className="line" /> {landing.models_section_label}
              </div>
              <h2 className="section-title">{landing.models_section_title}</h2>
              <p className="section-desc">{landing.models_section_description}</p>
            </div>
          </div>
          <ModelsCarousel models={roster} />
        </div>
      </section>

      <HireModelsSection models={hireModels} content={landing} />

      <section className="section eco-section" id="ecosystem">
        <div
          className="bg-glow"
          style={{
            background: "var(--gold)",
            right: "-200px",
            top: "50%",
          }}
        />
        <div className="section-inner">
          <div className="section-header reveal">
            <div>
              <div className="section-label">
                <span className="line" /> {landing.ecosystem_section_label}
              </div>
              <h2 className="section-title">{landing.ecosystem_section_title}</h2>
              <p className="section-desc">{landing.ecosystem_section_description}</p>
            </div>
          </div>
          <div className="eco-flow">
            <div className="eco-card reveal reveal-delay-1">
              <div className="eco-icon">
                <i className="fas fa-search" aria-hidden />
              </div>
              <div className="eco-step">Phase 01</div>
              <h3 className="eco-title">{landing.ecosystem_phase_1_title}</h3>
              <p className="eco-desc">{landing.ecosystem_phase_1_description}</p>
            </div>
            <div className="eco-card reveal reveal-delay-2">
              <div className="eco-icon">
                <i className="fas fa-gem" aria-hidden />
              </div>
              <div className="eco-step">Phase 02</div>
              <h3 className="eco-title">{landing.ecosystem_phase_2_title}</h3>
              <p className="eco-desc">{landing.ecosystem_phase_2_description}</p>
            </div>
            <div className="eco-card reveal reveal-delay-3">
              <div className="eco-icon">
                <i className="fas fa-rocket" aria-hidden />
              </div>
              <div className="eco-step">Phase 03</div>
              <h3 className="eco-title">{landing.ecosystem_phase_3_title}</h3>
              <p className="eco-desc">{landing.ecosystem_phase_3_description}</p>
            </div>
            <div className="eco-card reveal reveal-delay-4">
              <div className="eco-icon">
                <i className="fas fa-chart-line" aria-hidden />
              </div>
              <div className="eco-step">Phase 04</div>
              <h3 className="eco-title">{landing.ecosystem_phase_4_title}</h3>
              <p className="eco-desc">{landing.ecosystem_phase_4_description}</p>
            </div>
          </div>
          <div className="eco-arrows reveal">
            <div className="eco-arrow">
              {landing.ecosystem_arrow_text}
            </div>
          </div>
        </div>
      </section>

      <section className="section data-section" id="data">
        <div className="section-inner">
          <div className="section-header reveal">
            <div>
              <div className="section-label">
                <span className="line" /> {landing.data_section_label}
              </div>
              <h2 className="section-title">{landing.data_section_title}</h2>
              <p className="section-desc">{landing.data_section_description}</p>
            </div>
          </div>
          <DataCharts metrics={metrics} />
          <div className="key-metrics reveal">
            <div className="metric-card">
              <div className="metric-value">{metrics.total_earnings_display}</div>
              <div className="metric-label">{landing.data_metric_total_earnings_label}</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{metrics.brand_partnerships.toLocaleString()}</div>
              <div className="metric-label">{landing.data_metric_brand_partnerships_label}</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{metrics.countries_placements.toLocaleString()}</div>
              <div className="metric-label">{landing.data_metric_countries_label}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section apply-section" id="apply">
        <div
          className="bg-glow"
          style={{
            background: "var(--gold)",
            left: "50%",
            top: "-100px",
            transform: "translateX(-50%)",
          }}
        />
        <div className="section-inner">
          <div className="reveal">
            <div className="section-label">
              <span className="line" /> {landing.apply_section_label}
            </div>
            <h2 className="section-title">{landing.apply_section_title}</h2>
            <p className="section-desc" style={{ marginBottom: 0 }}>
              {landing.apply_section_description}
            </p>
          </div>
          <div className="apply-grid">
            <div className="apply-info reveal reveal-delay-1">
              <h3>{landing.apply_requirements_title}</h3>
              <p>{landing.apply_requirements_intro}</p>
              <ul className="apply-requirements">
                <li>
                  <i className="fas fa-circle" aria-hidden />
                  {landing.apply_requirement_1}
                </li>
                <li>
                  <i className="fas fa-circle" aria-hidden />
                  {landing.apply_requirement_2}
                </li>
                <li>
                  <i className="fas fa-circle" aria-hidden />
                  {landing.apply_requirement_3}
                </li>
                <li>
                  <i className="fas fa-circle" aria-hidden />
                  {landing.apply_requirement_4}
                </li>
                <li>
                  <i className="fas fa-circle" aria-hidden />
                  {landing.apply_requirement_5}
                </li>
                <li>
                  <i className="fas fa-circle" aria-hidden />
                  {landing.apply_requirement_6}
                </li>
              </ul>
            </div>
            <ApplyForm />
          </div>
        </div>
      </section>

      <section
        className="section"
        id="gallery"
        style={{ background: "var(--bg-secondary)" }}
      >
        <div className="section-inner">
          <div className="section-header reveal">
            <div>
              <div className="section-label">
                <span className="line" /> {landing.gallery_section_label}
              </div>
              <h2 className="section-title">{landing.gallery_section_title}</h2>
              <p className="section-desc">{landing.gallery_section_description}</p>
            </div>
          </div>
          <GalleryGrid items={campaignItems} emptyText={landing.gallery_empty_text} />
        </div>
      </section>

      <SiteFooter content={landing} />
      <ScrollToTopButton />
    </>
  );
}
