import { Skeleton } from "./Skeleton";

export function AdminLoginSkeleton() {
  return (
    <div className="admin-login-skeleton" aria-busy="true" aria-label="Loading sign in">
      <Skeleton width={120} height={80} className="admin-login-skeleton-logo" />
      <div className="admin-login-skeleton-card">
        <Skeleton width={120} height={12} />
        <Skeleton width={220} height={34} className="admin-login-skeleton-heading" />
        <Skeleton width={160} height={14} />
        <Skeleton width="100%" height={48} rounded="10px" className="admin-login-skeleton-field" />
        <Skeleton width="100%" height={48} rounded="10px" />
        <Skeleton width="100%" height={48} rounded="999px" className="admin-login-skeleton-submit" />
      </div>
      <Skeleton width={120} height={14} />
    </div>
  );
}
