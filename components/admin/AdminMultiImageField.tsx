"use client";

import { imageUrlsForRow } from "@/lib/imageUrls";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import styles from "@/app/admin/admin.module.scss";

export function AdminMultiImageField({
  row,
  inputId,
  label = "Photos",
}: {
  row?: Record<string, unknown>;
  inputId: string;
  label?: string;
}) {
  const initial = useMemo(
    () =>
      row
        ? imageUrlsForRow({
            image_urls: row.image_urls,
            image_url:
              typeof row.image_url === "string" ? row.image_url : null,
          })
        : [],
    [row],
  );
  const [keptUrls, setKeptUrls] = useState<string[]>(initial);

  useEffect(() => {
    setKeptUrls(initial);
  }, [initial.join("|")]);

  return (
    <div className={styles.multiImageField}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      {keptUrls.length > 0 ? (
        <div className={styles.multiImageThumbs}>
          {keptUrls.map((url) => (
            <div key={url} className={styles.multiImageThumb}>
              <Image src={url} alt="" width={48} height={64} className={styles.thumb} unoptimized />
              <button
                type="button"
                className={styles.multiImageRemove}
                aria-label="Remove photo"
                onClick={() => setKeptUrls((prev) => prev.filter((u) => u !== url))}
              >
                <i className="fas fa-xmark" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <input type="hidden" name="image_urls" value={JSON.stringify(keptUrls)} />
      <input
        id={inputId}
        name="images"
        type="file"
        accept="image/*"
        multiple
        className={styles.file}
      />
      <p className={styles.fieldHint}>Select one or more images. On the site they rotate every 3 seconds.</p>
    </div>
  );
}
