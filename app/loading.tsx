const BAR_HEIGHTS = [45, 62, 38, 75, 50, 88, 42, 65, 30, 72, 55, 40, 80, 58];

export default function Loading() {
  return (
    <div className="space-y-6 max-w-7xl animate-pulse">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-40 bg-white/[0.08] rounded-lg" />
          <div className="h-3 w-56 bg-white/[0.05] rounded-md" />
        </div>
        <div className="h-8 w-20 bg-white/[0.05] rounded-xl" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-white/[0.08] rounded" />
              <div className="w-10 h-10 bg-white/[0.08] rounded-xl" />
            </div>
            <div className="h-8 w-20 bg-white/[0.10] rounded-lg" />
            <div className="h-3 w-32 bg-white/[0.05] rounded" />
          </div>
        ))}
      </div>

      {/* Chart + table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 glass rounded-2xl p-5">
          <div className="h-4 w-32 bg-white/[0.08] rounded mb-6" />
          <div className="h-64 flex items-end gap-2">
            {BAR_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-white/[0.05] rounded-t-sm"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-5 space-y-4">
          <div className="h-4 w-24 bg-white/[0.08] rounded" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between">
                <div className="h-3 bg-white/[0.08] rounded flex-1 mr-4" />
                <div className="h-3 w-8 bg-white/[0.08] rounded" />
              </div>
              <div className="h-1 bg-white/[0.05] rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
