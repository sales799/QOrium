export default function Loading() {
  return (
    <div className="min-h-dvh bg-background text-foreground" role="status" aria-label="Loading">
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl items-center justify-center px-6">
        <div className="h-2 w-40 overflow-hidden rounded-full bg-border">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-foreground" />
        </div>
      </div>
    </div>
  );
}
