import type { EditorialItem } from "@/lib/types";
import Image from "next/image";

export function GalleryGrid({ items }: { items: EditorialItem[] }) {
  return (
    <div className="gallery-grid reveal">
      {items.map((item, i) => (
        <div className="gallery-item" key={item.id ?? `${item.title}-${i}`}>
          {item.video_url ? (
            <video
              controls
              playsInline
              preload="metadata"
              poster={item.image_url}
              className="gallery-img"
            >
              <source src={item.video_url} />
            </video>
          ) : (
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="gallery-img"
              unoptimized={item.image_url.includes("picsum.photos")}
            />
          )}
          <div className="gallery-item-overlay">
            <span>{item.title}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
