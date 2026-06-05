import { Skeleton } from "./Skeleton";

export function AdminPanelSkeleton() {
  return (
    <main className="admin-skeleton" aria-busy="true" aria-label="Loading admin page">
      <Skeleton width={280} height={32} className="admin-skeleton-title" />
      <Skeleton width="min(640px, 100%)" height={16} className="admin-skeleton-subtitle" />

      <div className="admin-skeleton-toolbar">
        <Skeleton width="min(320px, 100%)" height={42} rounded="10px" />
        <Skeleton width={140} height={42} rounded="10px" />
      </div>

      <div className="admin-skeleton-card">
        <div className="admin-skeleton-table-head">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} width={`${12 + (i % 3) * 4}%`} height={12} />
          ))}
        </div>
        {Array.from({ length: 8 }, (_, row) => (
          <div className="admin-skeleton-table-row" key={row}>
            {Array.from({ length: 6 }, (_, col) => (
              <Skeleton key={col} width={`${10 + ((row + col) % 4) * 5}%`} height={14} />
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
