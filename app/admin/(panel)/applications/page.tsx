import { fetchApplicationsJson } from "../../actions";
import styles from "../../admin.module.scss";
import { ApplicationDeleteButton } from "./ApplicationDeleteButton";
import { ApplicationInterviewCell } from "./ApplicationInterviewCell";
import { ApplicationPhotoButton } from "./ApplicationPhotoButton";
import { ApplicationStatusSelect } from "./ApplicationStatusSelect";

function fmtPhotos(photo_urls: unknown): string {
  if (photo_urls == null) return "—";
  if (Array.isArray(photo_urls)) {
    const n = photo_urls.length;
    return n === 0 ? "None" : n === 1 ? "1 photo" : `${n} photos`;
  }
  if (typeof photo_urls === "object") {
    const n = Object.keys(photo_urls as object).length;
    return n === 0 ? "None" : n === 1 ? "1 photo" : `${n} photos`;
  }
  return String(photo_urls);
}

function AboutCell({ message }: { message: unknown }) {
  const t = typeof message === "string" ? message.trim() : "";
  if (!t) {
    return <span style={{ color: "#555" }}>—</span>;
  }
  const short = t.length > 120 ? `${t.slice(0, 120)}…` : t;
  return (
    <span
      title={t}
      style={{
        display: "inline-block",
        maxWidth: 260,
        fontSize: "0.8rem",
        lineHeight: 1.4,
        color: "#c8beb0",
      }}
    >
      {short}
    </span>
  );
}

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

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Name</th>
              <th>Email</th>
              <th>DOB</th>
              <th>City</th>
              <th>Experience</th>
              <th>About you</th>
              <th>Photos</th>
              <th>Interview</th>
              <th>Submitted</th>
              <th aria-label="Actions"></th>
            </tr>
          </thead>
          <tbody>
            {applications.map((row) => (
              <tr key={String(row.id)}>
                <td>
                  <ApplicationStatusSelect
                    id={String(row.id)}
                    value={String(row.status ?? "new")}
                  />
                </td>
                <td>{String(row.full_name ?? "")}</td>
                <td>
                  <a href={`mailto:${row.email}`} style={{ color: "#c9a84c" }}>
                    {String(row.email ?? "")}
                  </a>
                </td>
                <td>{String(row.date_of_birth ?? "")}</td>
                <td>{String(row.city ?? "—")}</td>
                <td>{String(row.experience_level ?? "—")}</td>
                <td>
                  <AboutCell message={row.message} />
                </td>
                <td>
                  <ApplicationPhotoButton
                    photoUrls={row.photo_urls}
                    label={fmtPhotos(row.photo_urls)}
                  />
                </td>
                <td>
                  <ApplicationInterviewCell
                    id={String(row.id)}
                    status={String(row.status ?? "")}
                    interviewAt={
                      row.interview_at != null ? String(row.interview_at) : null
                    }
                  />
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  {row.created_at
                    ? new Date(String(row.created_at)).toLocaleString()
                    : "—"}
                </td>
                <td>
                  <ApplicationDeleteButton
                    id={String(row.id)}
                    name={
                      typeof row.full_name === "string" ? row.full_name : null
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {applications.length === 0 ? (
        <p className={styles.adminSubtitle}>No submissions yet.</p>
      ) : null}
    </main>
  );
}
