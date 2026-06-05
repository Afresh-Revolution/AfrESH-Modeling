import { fetchApplicationsJson } from "../../actions";
import styles from "../../admin.module.scss";
import ApplicationsClient from "./ApplicationsClient";

export default async function AdminApplicationsPage() {
  const { applications, loadError } = await fetchApplicationsJson();

  return (
    <main className={styles.adminMain}>
      <h1 className={styles.adminTitle}>Model submissions</h1>
      <p className={styles.adminSubtitle}>
        Applications from the public Apply page. Shortlisted, Rejected, Accepted,
        and Denied each send an email to the applicant when you confirm the change.
      </p>

      {loadError ? (
        <p className={styles.inlineError} style={{ marginBottom: "1rem" }}>
          {loadError}
        </p>
      ) : null}

      <ApplicationsClient applications={applications} />
    </main>
  );
}
