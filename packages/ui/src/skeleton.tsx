import { cn } from "./utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-lg bg-muted/60", className)} {...props} />;
}

/** Stat-card skeleton used on dashboard & list pages while loading. */
export function StatSkeleton() {
  return (
    <div className="rounded-xl border border-border/70 bg-card/80 p-5 space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-14" />
    </div>
  );
}

/** Table skeleton with n rows. */
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/80 p-4 space-y-3">
      <div className="flex gap-3">{Array.from({ length: cols }).map((_, i) => <Skeleton key={i} className="h-3 flex-1" />)}</div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: cols }).map((_, c) => <Skeleton key={c} className="h-4 flex-1" />)}
        </div>
      ))}
    </div>
  );
}
