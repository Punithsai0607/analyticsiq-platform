export default function HeatmapLoading() {
  return (
    <div className="space-y-6 max-w-7xl animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-36 bg-white/8 rounded-lg" />
          <div className="h-3 w-52 bg-white/5 rounded" />
        </div>
        <div className="h-10 w-52 bg-white/5 rounded-xl" />
      </div>

      {/* Stats bar */}
      <div className="flex gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="glass rounded-xl px-4 py-2.5 flex items-center gap-3">
            <div className="w-4 h-4 bg-white/8 rounded" />
            <div className="space-y-1">
              <div className="h-2.5 w-16 bg-white/5 rounded" />
              <div className="h-4 w-20 bg-white/8 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Heatmap canvas */}
      <div className="glass rounded-2xl w-full" style={{ aspectRatio: "16/9" }}>
        <div className="h-full flex items-center justify-center">
          <div className="space-y-3 text-center">
            <div className="w-12 h-12 bg-white/5 rounded-2xl mx-auto" />
            <div className="h-3 w-32 bg-white/5 rounded mx-auto" />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="h-3 w-36 bg-white/8 rounded" />
        <div className="flex gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white/8 rounded-full" />
              <div className="h-3 w-20 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
