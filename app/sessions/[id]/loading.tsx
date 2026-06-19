export default function SessionDetailLoading() {
  return (
    <div className="space-y-6 max-w-5xl animate-pulse">
      {/* Back + header */}
      <div className="space-y-4">
        <div className="h-3 w-24 bg-white/5 rounded" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/8 rounded-xl" />
          <div className="space-y-1.5">
            <div className="h-5 w-48 bg-white/8 rounded-lg" />
            <div className="h-3 w-36 bg-white/5 rounded" />
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-xl p-4 space-y-2">
            <div className="h-4 w-4 bg-white/8 rounded" />
            <div className="h-6 w-16 bg-white/10 rounded-lg" />
            <div className="h-3 w-20 bg-white/5 rounded" />
          </div>
        ))}
      </div>

      {/* Timeline + meta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2 glass rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 w-32 bg-white/8 rounded" />
            <div className="h-3 w-16 bg-white/5 rounded" />
          </div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-11 h-11 bg-white/8 rounded-full flex-shrink-0" />
              <div className="flex-1 glass rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-16 bg-white/8 rounded-md" />
                  <div className="h-3 w-16 bg-white/5 rounded" />
                </div>
                <div className="h-3 w-full bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Meta sidebar */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5 space-y-4">
            <div className="h-4 w-24 bg-white/8 rounded" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-16 bg-white/5 rounded" />
                <div className="h-3 w-24 bg-white/8 rounded" />
              </div>
            ))}
          </div>
          <div className="glass rounded-2xl p-5 space-y-3">
            <div className="h-4 w-28 bg-white/8 rounded" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-3 bg-white/5 rounded w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
