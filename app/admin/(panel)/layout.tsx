import styles from "../admin.module.scss";
import Link from "next/link";
import { adminLogoutAction } from "../actions";
import { AdminHeaderControls } from "./AdminHeaderControls";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.admin}>
      <header className={styles.adminHeader}>
        <span className={styles.adminBrand}>AfrESH ADMIN</span>
        <nav className={styles.adminNav}>
          <Link href="/admin">Overview</Link>
          <Link href="/admin/applications">Submissions</Link>
          <Link href="/admin/roster">Roster</Link>
          <Link href="/admin/hire-models">Hiring</Link>
          <Link href="/admin/editorial">Campaigns</Link>
          <Link href="/admin/editorial#film">Film</Link>
          <Link href="/admin/metrics">Metrics</Link>
          <AdminHeaderControls />
          <form action={adminLogoutAction}>
            <button type="submit" className={`${styles.btn} ${styles.btnGhost}`}>
              Sign out
            </button>
          </form>
        </nav>
      </header>
      {children}
    </div>
  );
}
