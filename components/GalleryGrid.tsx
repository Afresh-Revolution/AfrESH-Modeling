"use client";

import type { EditorialItem } from "@/lib/types";
import { RotatingGalleryImage } from "@/components/RotatingGalleryImage";

export function GalleryGrid({ items }: { items: EditorialItem[] }) {
  const campaignItems = items.filter(
    (item) => typeof item.image_url === "string" && item.image_url.length > 0,
  );

  if (campaignItems.length === 0) {
    return (
      <p className="film-empty reveal">
        Campaign images uploaded from admin will appear here.
      </p>
    );
  }

  return (
    <div className="gallery-grid reveal">
      {campaignItems.map((item, i) => (
        <div className="gallery-item" key={item.id ?? `${item.title}-${i}`}>
          <RotatingGalleryImage
            images={[item.image_url]}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="gallery-img"
          />
          <div className="gallery-item-overlay">
            <span>{item.title}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
