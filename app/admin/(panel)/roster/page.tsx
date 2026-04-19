import {
  createRosterEntry,
  deleteRosterEntry,
  fetchRosterJson,
  updateRosterEntry,
} from "../../actions";
import styles from "../../admin.module.scss";
import Image from "next/image";

export default async function AdminRosterPage() {
  const { roster } = await fetchRosterJson();

  return (
    <main className={styles.adminMain}>
      <h1 className={styles.adminTitle}>Roster</h1>
      <p className={styles.adminSubtitle}>
        Upload the main photo for each talent card. Files are saved automatically when you submit the form.
      </p>

      <div className={styles.card}>
        <h2 className={styles.adminTitle} style={{ fontSize: "1.1rem" }}>
          Add model
        </h2>
        <form action={createRosterEntry} style={{ marginTop: "1rem" }}>
          <div className={styles.formGrid}>
            <div>
              <label className={styles.label} htmlFor="new-name">
                Name
              </label>
              <input
                id="new-name"
                name="name"
                className={styles.input}
                required
                placeholder="Full name"
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="new-category">
                Category
              </label>
              <input
                id="new-category"
                name="category"
                className={styles.input}
                required
                placeholder="Editorial, Runway…"
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="new-sort">
                Display order
              </label>
              <input
                id="new-sort"
                name="sort_order"
                type="number"
                className={styles.input}
                defaultValue={0}
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="new-image">
                Image
              </label>
              <input
                id="new-image"
                name="image"
                type="file"
                accept="image/*"
                className={styles.file}
                required
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
              <th>Photo</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((m) => {
              const id = String(m.id);
              return (
                <tr key={id}>
                  <td>
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                      {m.image_url ? (
                        <Image
                          src={String(m.image_url)}
                          alt=""
                          width={56}
                          height={72}
                          className={styles.thumb}
                          unoptimized
                        />
                      ) : null}
                      <div style={{ fontSize: "0.8rem", color: "#a09888" }}>
                        <strong style={{ color: "#f5f0e8" }}>{String(m.name)}</strong>
                        <br />
                        {String(m.category)} · order {String(m.sort_order ?? 0)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <form action={updateRosterEntry.bind(null, id)}>
                      <div
                        className={styles.formGrid}
                        style={{ gridTemplateColumns: "1fr 1fr", minWidth: "280px" }}
                      >
                        <div>
                          <label className={styles.label}>Name</label>
                          <input
                            name="name"
                            className={styles.input}
                            defaultValue={String(m.name)}
                          />
                        </div>
                        <div>
                          <label className={styles.label}>Category</label>
                          <input
                            name="category"
                            className={styles.input}
                            defaultValue={String(m.category)}
                          />
                        </div>
                        <div>
                          <label className={styles.label}>Display order</label>
                          <input
                            name="sort_order"
                            type="number"
                            className={styles.input}
                            defaultValue={Number(m.sort_order ?? 0)}
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
                    <form action={deleteRosterEntry.bind(null, id)}>
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

      {roster.length === 0 ? (
        <p className={styles.adminSubtitle}>No talent profiles yet. Add one above.</p>
      ) : null}
    </main>
  );
}
