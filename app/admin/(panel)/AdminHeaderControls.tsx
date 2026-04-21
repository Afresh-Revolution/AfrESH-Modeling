"use client";

import styles from "../admin.module.scss";

export function AdminHeaderControls() {
  return (
    <>
      <button
        type="button"
        className={styles.adminNavButton}
        onClick={() => {
          // Force a full landing-page reload with cache-busting query.
          window.location.assign(`/?refresh=${Date.now()}`);
        }}
      >
        Visit site
      </button>
      <button
        type="button"
        className={styles.adminNavButton}
        onClick={() => {
          window.location.reload();
        }}
      >
        Refresh admin
      </button>
    </>
  );
}
