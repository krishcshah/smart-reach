export default function Loading() {
  return (
    <div className="flex min-h-[62vh] items-center justify-center">
      <div
        role="status"
        aria-label="loading"
        className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-primary"
      />
    </div>
  );
}
