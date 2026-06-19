export default function SessionsLoading() {
  return (
    <div className="space-y-6 max-w-7xl animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-36 bg-white/8 rounded-lg" />
          <div className="h-3 w-28 bg-white/5 rounded" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-64 bg-white/5 rounded-xl" />
          <div className="h-10 w-10 bg-white/5 rounded-xl" />
        </div>
      </div>

      {/* Session cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5 space-y-4">
            {/* Card header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/8 rounded-xl" />
                <div className="space-y-1.5">
                  <div className="h-3 w-32 bg-white/8 rounded" />
                  <div className="h-2.5 w-20 bg-white/5 rounded" />
                </div>
              </div>
              <div className="w-4 h-4 bg-white/5 rounded" />
            </div>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="p-2.5 rounded-xl bg-white/[0.03] space-y-1.5 text-center">
                  <div className="h-3.5 w-3.5 bg-white/8 rounded mx-auto" />
                  <div className="h-4 w-8 bg-white/8 rounded mx-auto" />
                  <div className="h-2.5 w-14 bg-white/5 rounded mx-auto" />
                </div>
              ))}
            </div>
            {/* Pages */}
            <div className="space-y-1.5">
              <div className="h-2.5 w-20 bg-white/5 rounded" />
              {[...Array(2)].map((_, j) => (
                <div key={j} className="h-3 bg-white/5 rounded w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
