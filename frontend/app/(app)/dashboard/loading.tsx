export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <div className="skeleton h-5 w-40" />
          <div className="skeleton h-8 w-72 max-w-full" />
          <div className="skeleton h-4 w-96 max-w-full" />
        </div>
        <div className="flex gap-2">
          <div className="skeleton h-8 w-28" />
          <div className="skeleton h-8 w-28" />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-border/70 bg-card/50 p-4">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton mt-3 h-7 w-20" />
            <div className="skeleton mt-3 h-2 w-full" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="skeleton h-[320px] rounded-2xl xl:col-span-2" />
        <div className="skeleton h-[320px] rounded-2xl" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-border/70 bg-card/50">
            <div className="skeleton aspect-video rounded-none" />
            <div className="space-y-2 p-3.5">
              <div className="skeleton h-3.5 w-3/4" />
              <div className="skeleton h-2.5 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
