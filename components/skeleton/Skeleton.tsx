import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes } from "react";

type SkeletonProps = HTMLAttributes<HTMLSpanElement> & {
  width?: string | number;
  height?: string | number;
  rounded?: boolean | string;
};

export function Skeleton({
  className,
  width,
  height,
  rounded,
  style,
  ...props
}: SkeletonProps) {
  const radius =
    rounded === true
      ? "999px"
      : typeof rounded === "string"
        ? rounded
        : undefined;

  return (
    <span
      className={["skeleton", className].filter(Boolean).join(" ")}
      aria-hidden="true"
      style={{
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
      {...props}
    />
  );
}

export function SkeletonText({
  lines = 1,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <span className={["skeleton-text", className].filter(Boolean).join(" ")} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className="skeleton-text-line"
          width={i === lines - 1 && lines > 1 ? "72%" : "100%"}
          height="0.85em"
        />
      ))}
    </span>
  );
}

type SkeletonButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: string;
};

export function SkeletonButton({
  loading = false,
  loadingLabel = "Loading",
  className,
  children,
  disabled,
  type = "button",
  ...props
}: SkeletonButtonProps) {
  return (
    <button
      type={type}
      className={["skeleton-button", loading ? "is-loading" : "", className]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      <span className="skeleton-button-label" aria-hidden={loading || undefined}>
        {children}
      </span>
      {loading ? (
        <>
          <Skeleton className="skeleton-button-bar" />
          <span className="visually-hidden">{loadingLabel}</span>
        </>
      ) : null}
    </button>
  );
}

export function SkeletonProgress({
  percent,
  className,
  style,
  label = "Loading",
}: {
  percent: number;
  className?: string;
  style?: CSSProperties;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div
      className={["skeleton-progress", className].filter(Boolean).join(" ")}
      style={style}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-label={label}
    >
      <div className="skeleton-progress-track">
        <Skeleton className="skeleton-progress-fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
