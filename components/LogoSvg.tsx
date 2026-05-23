import { BRAND_LOGO_SIZE, BRAND_LOGO_SRC, BRAND_NAME } from "@/lib/brand";
import Image from "next/image";

type LogoSvgProps = {
  className?: string;
  height?: number;
  /** Use empty string when parent provides the accessible name (e.g. nav link). */
  alt?: string;
  priority?: boolean;
};

export function LogoSvg({
  className,
  height = 42,
  alt = BRAND_NAME,
  priority,
}: LogoSvgProps) {
  return (
    <Image
      src={BRAND_LOGO_SRC}
      alt={alt}
      width={BRAND_LOGO_SIZE}
      height={BRAND_LOGO_SIZE}
      className={className ? `brand-logo ${className}` : "brand-logo"}
      style={{ width: "auto", height }}
      sizes={`${height}px`}
      priority={priority}
      unoptimized
    />
  );
}
