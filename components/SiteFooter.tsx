 "use client";

import { LogoSvg } from "@/components/LogoSvg";
import { PwaInstallButton } from "@/components/PwaInstallButton";
import type { LandingContent } from "@/lib/landingContent";
import { useEffect, useMemo, useState } from "react";

type FooterModalId =
  | "model-scouting"
  | "development-programs"
  | "brand-partnerships"
  | "event-casting"
  | "content-production"
  | "privacy-policy"
  | "terms-of-service"
  | "cookie-settings";

type FooterModalContent = {
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
};

const FOOTER_MODALS: Record<FooterModalId, FooterModalContent> = {
  "model-scouting": {
    title: "Model Scouting",
    body: "We identify emerging talent through digital review, live evaluations, and market-fit analysis. Submit your profile and our scouting team will review your look, movement, and long-term potential.",
    ctaLabel: "Back To Apply Form",
    ctaHref: "#apply",
  },
  "development-programs": {
    title: "Development Programs",
    body: "Our development track combines runway coaching, posing, personal branding, and industry readiness to move talent from discovery to placement with confidence.",
    ctaLabel: "Back To Apply Form",
    ctaHref: "#apply",
  },
  "brand-partnerships": {
    title: "Brand Partnerships",
    body: "We connect fashion and lifestyle brands with curated talent for campaigns, ambassador programs, and strategic collaborations designed for measurable impact.",
    ctaLabel: "Contact Partnerships",
    ctaHref: "mailto:afreshmodeling@gmail.com",
  },
  "event-casting": {
    title: "Event Casting",
    body: "From runway shows to private brand activations, we provide casting support, shortlist management, and on-site coordination tailored to your event goals.",
    ctaLabel: "Request Casting Support",
    ctaHref: "mailto:afreshmodeling@gmail.com",
  },
  "content-production": {
    title: "Content Production",
    body: "Our creative team supports editorials, campaign shoots, and social-first content with talent direction and production-ready execution.",
    ctaLabel: "Discuss A Project",
    ctaHref: "mailto:afreshmodeling@gmail.com",
  },
  "privacy-policy": {
    title: "Privacy Policy",
    body: "At AfrESH Modeling, your privacy is a priority. We are committed to protecting your personal information and ensuring transparency in how your data is collected, used, and safeguarded. We may collect personal details such as your name, contact information, portfolio submissions, and other relevant data strictly for purposes including membership management, talent development, communications, and service improvement. All information provided is handled with strict confidentiality and will not be sold, rented, or shared with third parties without your consent, except where required by law or necessary for operational purposes (such as collaborations or bookings). By engaging with AfrESH Modeling, you agree to the collection and use of information in accordance with this policy. We implement appropriate security measures to protect your data from unauthorized access or disclosure.",
    ctaLabel: "Back To Apply Form",
    ctaHref: "#apply",
  },
  "terms-of-service": {
    title: "Terms Of Service",
    body: "By accessing or becoming a member of AfrESH Modeling, you agree to uphold the standards, values, and operational guidelines of the agency. Members are expected to maintain professionalism, integrity, and respect in all engagements—both within and outside the agency. AfrESH Modeling reserves the right to review, approve, or decline participation in projects, events, or collaborations to maintain brand quality and reputation. All content, branding, and materials associated with AfrESH Modeling remain the intellectual property of the organization unless otherwise stated. Unauthorized use, reproduction, or distribution is prohibited. AfrESH Modeling also reserves the right to update, modify, or terminate services or memberships where necessary, ensuring the continuous growth and exclusivity of the brand.",
    ctaLabel: "Back To Apply Form",
    ctaHref: "#apply",
  },
  "cookie-settings": {
    title: "Cookie Settings",
    body: "AfrESH Modeling uses cookies and similar technologies to enhance user experience, analyze website performance, and deliver tailored content. Cookies help us understand how visitors interact with our platform, allowing us to improve functionality, design, and overall user experience. These may include essential cookies for site operation and optional cookies for analytics and personalization. Users have the option to manage or disable cookies through their browser settings. Please note that disabling certain cookies may affect the functionality of the website. By continuing to use our platform, you consent to the use of cookies in accordance with this policy.",
    ctaLabel: "Update Cookie Preferences",
    ctaHref: "mailto:afreshmodeling@gmail.com?subject=Cookie%20Preference%20Request",
  },
};

export function SiteFooter({ content }: { content: LandingContent }) {
  const [activeModal, setActiveModal] = useState<FooterModalId | null>(null);
  const modalContent = useMemo(
    () => (activeModal ? FOOTER_MODALS[activeModal] : null),
    [activeModal]
  );

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setActiveModal(null);
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  function openModal(id: FooterModalId) {
    setActiveModal(id);
  }

  function closeModal() {
    setActiveModal(null);
  }

  return (
    <footer className="site-footer">
      <div className="runway-strip" />
      <div className="footer-body">
        <div className="footer-top">
          <div className="footer-brand">
            <LogoSvg height={48} className="footer-logo" />
            <p>
              {content.footer_brand_description}
            </p>
            <div className="footer-socials">
              <a href="#" aria-label="Instagram">
                <i className="fab fa-instagram" aria-hidden />
              </a>
              <a href="#" aria-label="X">
                <i className="fab fa-x-twitter" aria-hidden />
              </a>
              <a href="#" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in" aria-hidden />
              </a>
              <a href="#" aria-label="YouTube">
                <i className="fab fa-youtube" aria-hidden />
              </a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Navigation</h4>
            <ul>
              <li>
                <a href="#models">Models</a>
              </li>
              <li>
                <a href="#hire-models">Hiring</a>
              </li>
              <li>
                <a href="#ecosystem">Ecosystem</a>
              </li>
              <li>
                <a href="#data">Insights</a>
              </li>
              <li>
                <a href="#film">Film</a>
              </li>
              <li>
                <a href="#gallery">Editorial</a>
              </li>
              <li>
                <a href="#apply">Apply</a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Services</h4>
            <ul>
              <li>
                <button type="button" className="footer-link-button" onClick={() => openModal("model-scouting")}>
                  Model Scouting
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-button"
                  onClick={() => openModal("development-programs")}
                >
                  Development Programs
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-button"
                  onClick={() => openModal("brand-partnerships")}
                >
                  Brand Partnerships
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-button" onClick={() => openModal("event-casting")}>
                  Event Casting
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="footer-link-button"
                  onClick={() => openModal("content-production")}
                >
                  Content Production
                </button>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li>
                <a href="#">{content.footer_contact_location}</a>
              </li>
              <li>
                <a href={`mailto:${content.footer_contact_email}`}>{content.footer_contact_email}</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-buttons reveal">
          <a href="#apply" className="footer-btn footer-btn-gold">
            <i className="fas fa-paper-plane" aria-hidden /> {content.footer_apply_button}
          </a>
          <a href="#models" className="footer-btn footer-btn-outline">
            <i className="fas fa-eye" aria-hidden /> {content.footer_portfolio_button}
          </a>
          <PwaInstallButton />
          <a href={`mailto:${content.footer_contact_email}`} className="footer-btn footer-btn-ghost">
            <i className="fas fa-envelope" aria-hidden /> {content.footer_contact_button}
          </a>
        </div>
        <div className="footer-bottom">
          <p>
            <a href="/admin/login" className="footer-admin-year">
              {content.footer_copyright_year}
            </a>{" "}
            {content.footer_copyright_text}
          </p>
          <div className="footer-bottom-links">
            <button type="button" className="footer-link-button" onClick={() => openModal("privacy-policy")}>
              Privacy Policy
            </button>
            <button type="button" className="footer-link-button" onClick={() => openModal("terms-of-service")}>
              Terms of Service
            </button>
            <button type="button" className="footer-link-button" onClick={() => openModal("cookie-settings")}>
              Cookie Settings
            </button>
          </div>
        </div>
      </div>

      {modalContent ? (
        <div className="footer-modal-overlay" role="presentation" onClick={closeModal}>
          <div
            className="footer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="footer-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="footer-modal-close" aria-label="Close" onClick={closeModal}>
              <i className="fas fa-xmark" aria-hidden />
            </button>
            <h3 id="footer-modal-title">{modalContent.title}</h3>
            <p>{modalContent.body}</p>
            <div className="footer-modal-actions">
              {modalContent.ctaLabel && modalContent.ctaHref ? (
                <a href={modalContent.ctaHref} className="footer-btn footer-btn-gold" onClick={closeModal}>
                  {modalContent.ctaLabel}
                </a>
              ) : null}
              <button type="button" className="footer-btn footer-btn-outline" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </footer>
  );
}
