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
import { fetchEditorial, fetchRoster, fetchSiteMetrics } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [roster, editorial, metrics] = await Promise.all([
    fetchRoster(),
    fetchEditorial(),
    fetchSiteMetrics(),
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
      <SiteNav />
      <HeroSection />
      <StatsBar metrics={metrics} />

      <VideoShowcase items={filmItems} />

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
                <span className="line" /> Featured Talent
              </div>
              <h2 className="section-title">Our Roster</h2>
              <p className="section-desc">
                Discover the faces that define{" "}
                <strong style={{ color: "var(--gold)" }}>ONYXX CLUB</strong> —
                each selected for their unique presence and professional drive.
              </p>
            </div>
          </div>
          <ModelsCarousel models={roster} />
        </div>
      </section>

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
                <span className="line" /> Our Process
              </div>
              <h2 className="section-title">The ONYXX Ecosystem</h2>
              <p className="section-desc">
                A{" "}
                <strong style={{ color: "var(--fg)" }}>
                  scientifically structured
                </strong>{" "}
                pipeline that transforms raw potential into industry-leading
                talent.
              </p>
            </div>
          </div>
          <div className="eco-flow">
            <div className="eco-card reveal reveal-delay-1">
              <div className="eco-icon">
                <i className="fas fa-search" aria-hidden />
              </div>
              <div className="eco-step">Phase 01</div>
              <h3 className="eco-title">Global Scouting</h3>
              <p className="eco-desc">
                Our scouts identify distinctive faces across 30+ countries using
                data-driven criteria and instinct.
              </p>
            </div>
            <div className="eco-card reveal reveal-delay-2">
              <div className="eco-icon">
                <i className="fas fa-gem" aria-hidden />
              </div>
              <div className="eco-step">Phase 02</div>
              <h3 className="eco-title">Talent Development</h3>
              <p className="eco-desc">
                Rigorous training in posing, walk, nutrition, and personal
                branding with industry mentors.
              </p>
            </div>
            <div className="eco-card reveal reveal-delay-3">
              <div className="eco-icon">
                <i className="fas fa-rocket" aria-hidden />
              </div>
              <div className="eco-step">Phase 03</div>
              <h3 className="eco-title">Strategic Placement</h3>
              <p className="eco-desc">
                AI-matched casting with agencies, brands, and editorial
                opportunities worldwide.
              </p>
            </div>
            <div className="eco-card reveal reveal-delay-4">
              <div className="eco-icon">
                <i className="fas fa-chart-line" aria-hidden />
              </div>
              <div className="eco-step">Phase 04</div>
              <h3 className="eco-title">Career Management</h3>
              <p className="eco-desc">
                Long-term trajectory planning, contract negotiation, and brand
                partnership curation.
              </p>
            </div>
          </div>
          <div className="eco-arrows reveal">
            <div className="eco-arrow">
              Scouting <i className="fas fa-chevron-right" aria-hidden />{" "}
              Development <i className="fas fa-chevron-right" aria-hidden />{" "}
              Placement <i className="fas fa-chevron-right" aria-hidden />{" "}
              Management
            </div>
          </div>
        </div>
      </section>

      <section className="section data-section" id="data">
        <div className="section-inner">
          <div className="section-header reveal">
            <div>
              <div className="section-label">
                <span className="line" /> Performance Metrics
              </div>
              <h2 className="section-title">By The Numbers</h2>
              <p className="section-desc">
                Data-driven results that validate our approach to{" "}
                <strong style={{ color: "var(--fg)" }}>
                  model development
                </strong>{" "}
                and market placement.
              </p>
            </div>
          </div>
          <DataCharts metrics={metrics} />
          <div className="key-metrics reveal">
            <div className="metric-card">
              <div className="metric-value">{metrics.total_earnings_display}</div>
              <div className="metric-label">Total Earnings Generated</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{metrics.brand_partnerships.toLocaleString()}</div>
              <div className="metric-label">Brand Partnerships Active</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{metrics.countries_placements.toLocaleString()}</div>
              <div className="metric-label">Countries With Placements</div>
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
              <span className="line" /> Open Call
            </div>
            <h2 className="section-title">Become Part of the Club</h2>
            <p className="section-desc" style={{ marginBottom: 0 }}>
              We are always looking for extraordinary individuals. Submit your
              application below.
            </p>
          </div>
          <div className="apply-grid">
            <div className="apply-info reveal reveal-delay-1">
              <h3>What We Look For</h3>
              <p>
                ONYXX CLUB represents a curated selection of talent. Our
                scouting process is both intuitive and analytical, seeking
                individuals who bring something unmistakable to the industry.
              </p>
              <ul className="apply-requirements">
                <li>
                  <i className="fas fa-circle" aria-hidden />
                  Height preference: 5&apos;8&quot; and above for women,
                  6&apos;0&quot; and above for men
                </li>
                <li>
                  <i className="fas fa-circle" aria-hidden />
                  Strong facial bone structure and unique features
                </li>
                <li>
                  <i className="fas fa-circle" aria-hidden />
                  Professional attitude and reliability
                </li>
                <li>
                  <i className="fas fa-circle" aria-hidden />
                  No prior experience required — we develop raw talent
                </li>
                <li>
                  <i className="fas fa-circle" aria-hidden />
                  Must be 16 years or older to apply
                </li>
                <li>
                  <i className="fas fa-circle" aria-hidden />
                  Open to all ethnicities, body types within our diverse
                  categories
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
                <span className="line" /> Editorial
              </div>
              <h2 className="section-title">Recent Campaigns</h2>
              <p className="section-desc">
                A glimpse into the campaigns and editorial work produced through
                the{" "}
                <strong style={{ color: "var(--gold)" }}>
                  ONYXX ecosystem
                </strong>
                .
              </p>
            </div>
          </div>
          <GalleryGrid items={campaignItems} />
        </div>
      </section>

      <SiteFooter />
      <ScrollToTopButton />
    </>
  );
}
