import styles from "../admin.module.scss";
import Link from "next/link";
import { adminLogoutAction } from "../actions";

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.admin}>
      <header className={styles.adminHeader}>
        <span className={styles.adminBrand}>ONYXX ADMIN</span>
        <nav className={styles.adminNav}>
          <Link href="/admin">Overview</Link>
          <Link href="/admin/applications">Submissions</Link>
          <Link href="/admin/roster">Roster</Link>
          <Link href="/admin/editorial">Campaigns</Link>
          <Link href="/admin/editorial#film">Film</Link>
          <Link href="/">View site</Link>
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
