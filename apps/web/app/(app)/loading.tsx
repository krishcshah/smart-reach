export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-indigo-500/25 border-t-indigo-500" />
          <div className="absolute inset-2 rounded-full bg-indigo-500/10" />
        </div>
        <p className="text-xs text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}
