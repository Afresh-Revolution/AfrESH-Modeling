import Link from "next/link";
import styles from "../admin.module.scss";

export default function AdminHomePage() {
  return (
    <main className={styles.adminMain}>
      <h1 className={styles.adminTitle}>Dashboard</h1>
      <p className={styles.adminSubtitle}>
        Review applications, update the talent roster and photos, and manage campaigns and film clips for the public site.
      </p>
      <div className={styles.card}>
        <h2 className={styles.adminTitle} style={{ fontSize: "1.1rem" }}>
          Quick links
        </h2>
        <ul style={{ marginTop: "1rem", lineHeight: 2, color: "#a09888" }}>
          <li>
            <Link href="/admin/applications" style={{ color: "#c9a84c" }}>
              Model submissions
            </Link>{" "}
            — review applications from the site
          </li>
          <li>
            <Link href="/admin/roster" style={{ color: "#c9a84c" }}>
              Roster
            </Link>{" "}
            — add/update talent cards & photos
          </li>
          <li>
            <Link href="/admin/editorial" style={{ color: "#c9a84c" }}>
              Campaigns
            </Link>{" "}
            — homepage gallery and optional film clips
          </li>
          <li>
            <Link href="/admin/editorial#film" style={{ color: "#c9a84c" }}>
              Film
            </Link>{" "}
            — open the film section on this page
          </li>
          <li>
            <Link href="/admin/metrics" style={{ color: "#c9a84c" }}>
              Metrics
            </Link>{" "}
            — homepage stats, key figures, and chart data
          </li>
        </ul>
      </div>
    </main>
  );
}
