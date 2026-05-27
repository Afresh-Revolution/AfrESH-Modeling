export type LandingContent = {
  hero_badge: string;
  hero_title_prefix: string;
  hero_title_highlight: string;
  hero_subtitle: string;
  hero_primary_cta: string;
  hero_secondary_cta: string;
  models_section_label: string;
  models_section_title: string;
  models_section_description: string;
  ecosystem_section_label: string;
  ecosystem_section_title: string;
  ecosystem_section_description: string;
  data_section_label: string;
  data_section_title: string;
  data_section_description: string;
  apply_section_label: string;
  apply_section_title: string;
  apply_section_description: string;
  apply_requirements_title: string;
  apply_requirements_intro: string;
  apply_requirement_1: string;
  apply_requirement_2: string;
  apply_requirement_3: string;
  apply_requirement_4: string;
  apply_requirement_5: string;
  apply_requirement_6: string;
  gallery_section_label: string;
  gallery_section_title: string;
  gallery_section_description: string;
  footer_brand_description: string;
  footer_contact_location: string;
  footer_contact_email: string;
  footer_apply_button: string;
  footer_portfolio_button: string;
  footer_contact_button: string;
  footer_copyright_year: string;
  footer_copyright_text: string;
};

export const DEFAULT_LANDING_CONTENT: LandingContent = {
  hero_badge: "Now Accepting Applications",
  hero_title_prefix: "AfrESH",
  hero_title_highlight: "Modeling",
  hero_subtitle: "Where Elegance Meets Excellence",
  hero_primary_cta: "View Our Talent",
  hero_secondary_cta: "Apply Now",
  models_section_label: "Featured Talent",
  models_section_title: "Our Roster",
  models_section_description:
    "Discover the faces that define AfrESH Modeling — each selected for their unique presence and professional drive.",
  ecosystem_section_label: "Our Process",
  ecosystem_section_title: "The AfrESH Modeling Ecosystem",
  ecosystem_section_description:
    "A scientifically structured pipeline that transforms raw potential into industry-leading talent.",
  data_section_label: "Performance Metrics",
  data_section_title: "By The Numbers",
  data_section_description:
    "Data-driven results that validate our approach to model development and market placement.",
  apply_section_label: "Open Call",
  apply_section_title: "Become Part of AfrESH Modeling",
  apply_section_description:
    "We are always looking for extraordinary individuals. Submit your application below.",
  apply_requirements_title: "What We Look For",
  apply_requirements_intro:
    "AfrESH Modeling represents a curated selection of talent. Our scouting process is both intuitive and analytical, seeking individuals who bring something unmistakable to the industry.",
  apply_requirement_1: "Height preference: 5'8\" and above for women, 6'0\" and above for men",
  apply_requirement_2: "Strong facial bone structure and unique features",
  apply_requirement_3: "Professional attitude and reliability",
  apply_requirement_4: "No prior experience required — we develop raw talent",
  apply_requirement_5: "Must be 16 years or older to apply",
  apply_requirement_6:
    "Open to all ethnicities, body types within our diverse categories",
  gallery_section_label: "Editorial",
  gallery_section_title: "Recent Campaigns",
  gallery_section_description:
    "A glimpse into the campaigns and editorial work produced through the AfrESH Modeling ecosystem.",
  footer_brand_description:
    "Redefining the modeling industry through data-driven talent development and uncompromising standards of elegance.",
  footer_contact_location: "Jos, Nigeria",
  footer_contact_email: "afreshmodeling@gmail.com",
  footer_apply_button: "Apply Now",
  footer_portfolio_button: "View Portfolio",
  footer_contact_button: "Contact Us",
  footer_copyright_year: "2026",
  footer_copyright_text: "AfrESH Modeling. All rights reserved.",
};

export function parseLandingContent(raw: unknown): LandingContent {
  if (!raw || typeof raw !== "object") return DEFAULT_LANDING_CONTENT;
  const rec = raw as Record<string, unknown>;
  const next: LandingContent = { ...DEFAULT_LANDING_CONTENT };
  for (const key of Object.keys(DEFAULT_LANDING_CONTENT) as (keyof LandingContent)[]) {
    const value = rec[key];
    if (typeof value === "string") next[key] = value;
  }
  return next;
}
