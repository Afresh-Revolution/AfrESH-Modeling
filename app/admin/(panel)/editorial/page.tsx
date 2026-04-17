import {
  createEditorialEntry,
  deleteEditorialEntry,
  fetchEditorialJson,
  updateEditorialEntry,
} from "../../actions";
import styles from "../../admin.module.scss";
import Image from "next/image";

export default async function AdminEditorialPage() {
  const { editorial } = await fetchEditorialJson();

  return (
    <main className={styles.adminMain}>
      <h1 className={styles.adminTitle}>Recent campaigns</h1>
      <p className={styles.adminSubtitle}>
        Editorial grid and film section on the homepage. Images and optional videos upload to
        Cloudinary (<code style={{ color: "#c9a84c" }}>onyxx/editorial</code>). Videos also
        appear in the <strong>Film &amp; Campaign</strong> block when set.
      </p>

      <div className={styles.card}>
        <h2 className={styles.adminTitle} style={{ fontSize: "1.1rem" }}>
          Add campaign
        </h2>
        <form action={createEditorialEntry} style={{ marginTop: "1rem" }}>
          <div className={styles.formGrid}>
            <div>
              <label className={styles.label} htmlFor="ed-title">
                Title / caption
              </label>
              <input
                id="ed-title"
                name="title"
                className={styles.input}
                required
                placeholder="Vogue — Spring 2026"
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="ed-sort">
                Sort order
              </label>
              <input
                id="ed-sort"
                name="sort_order"
                type="number"
                className={styles.input}
                defaultValue={0}
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="ed-image">
                Image
              </label>
              <input
                id="ed-image"
                name="image"
                type="file"
                accept="image/*"
                className={styles.file}
                required
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="ed-video">
                Video (optional)
              </label>
              <input
                id="ed-video"
                name="video"
                type="file"
                accept="video/*"
                className={styles.file}
              />
            </div>
            <div>
              <button type="submit" className={`${styles.btn} ${styles.btnGold}`}>
                Create
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Preview</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {editorial.map((item) => {
              const id = String(item.id);
              return (
                <tr key={id}>
                  <td>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                        {item.image_url ? (
                          <Image
                            src={String(item.image_url)}
                            alt=""
                            width={80}
                            height={56}
                            className={styles.thumb}
                            style={{ width: 80, height: 56 }}
                            unoptimized
                          />
                        ) : null}
                        {item.video_url ? (
                          <video
                            src={String(item.video_url)}
                            muted
                            playsInline
                            width={80}
                            height={45}
                            style={{ width: 80, height: 45, objectFit: "cover", borderRadius: 4 }}
                          />
                        ) : (
                          <span style={{ fontSize: "0.7rem", color: "#888" }}>No video</span>
                        )}
                      </div>
                      <span style={{ fontSize: "0.85rem" }}>{String(item.title)}</span>
                    </div>
                  </td>
                  <td>
                    <form action={updateEditorialEntry.bind(null, id)}>
                      <div
                        className={styles.formGrid}
                        style={{ gridTemplateColumns: "1fr", minWidth: "240px" }}
                      >
                        <div>
                          <label className={styles.label}>Title</label>
                          <input
                            name="title"
                            className={styles.input}
                            defaultValue={String(item.title)}
                          />
                        </div>
                        <div>
                          <label className={styles.label}>Sort</label>
                          <input
                            name="sort_order"
                            type="number"
                            className={styles.input}
                            defaultValue={Number(item.sort_order ?? 0)}
                          />
                        </div>
                        <div>
                          <label className={styles.label}>New image</label>
                          <input
                            name="image"
                            type="file"
                            accept="image/*"
                            className={styles.file}
                          />
                        </div>
                        <div>
                          <label className={styles.label}>New video (optional)</label>
                          <input
                            name="video"
                            type="file"
                            accept="video/*"
                            className={styles.file}
                          />
                        </div>
                        {item.video_url ? (
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              fontSize: "0.8rem",
                              color: "#aaa",
                            }}
                          >
                            <input type="checkbox" name="clear_video" value="1" />
                            Remove video
                          </label>
                        ) : null}
                      </div>
                      <button
                        type="submit"
                        className={`${styles.btn} ${styles.btnGold}`}
                        style={{ marginTop: "0.5rem" }}
                      >
                        Save
                      </button>
                    </form>
                  </td>
                  <td>
                    <form action={deleteEditorialEntry.bind(null, id)}>
                      <button type="submit" className={`${styles.btn} ${styles.btnDanger}`}>
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editorial.length === 0 ? (
        <p className={styles.adminSubtitle}>No campaigns yet.</p>
      ) : null}
    </main>
  );
}
