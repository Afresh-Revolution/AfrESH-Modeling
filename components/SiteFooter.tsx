import { LogoSvg } from "@/components/LogoSvg";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="runway-strip" />
      <div className="footer-body">
        <div className="footer-top">
          <div className="footer-brand">
            <LogoSvg height={48} />
            <p>
              Redefining the modeling industry through data-driven talent development and
              uncompromising standards of elegance.
            </p>
            <div className="footer-socials">
              <a href="#" aria-label="Instagram">
                <i className="fab fa-instagram" aria-hidden />
              </a>
              <a href="#" aria-label="Twitter">
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
                <a href="#">Model Scouting</a>
              </li>
              <li>
                <a href="#">Development Programs</a>
              </li>
              <li>
                <a href="#">Brand Partnerships</a>
              </li>
              <li>
                <a href="#">Event Casting</a>
              </li>
              <li>
                <a href="#">Content Production</a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li>
                <a href="#">New York, NY</a>
              </li>
              <li>
                <a href="#">London, UK</a>
              </li>
              <li>
                <a href="#">Milan, Italy</a>
              </li>
              <li>
                <a href="#">Paris, France</a>
              </li>
              <li>
                <a href="mailto:hello@onyxxclub.com">hello@onyxxclub.com</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-buttons reveal">
          <a href="#apply" className="footer-btn footer-btn-gold">
            <i className="fas fa-paper-plane" aria-hidden /> Apply Now
          </a>
          <a href="#models" className="footer-btn footer-btn-outline">
            <i className="fas fa-eye" aria-hidden /> View Portfolio
          </a>
          <a href="mailto:hello@onyxxclub.com" className="footer-btn footer-btn-ghost">
            <i className="fas fa-envelope" aria-hidden /> Contact Us
          </a>
        </div>
        <div className="footer-bottom">
          <p>
            <a href="/admin/login" className="footer-admin-year">
              2026
            </a>{" "}
            ONYXX CLUB. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
