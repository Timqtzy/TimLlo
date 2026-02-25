export default function PlannerPanel() {
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = now.getDate();

  const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7am to 6pm

  return (
    <div className="w-72 shrink-0 bg-base-200 border-r border-white/5 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 pb-2">
        <h2 className="font-bold text-xl">Planner</h2>
        <p className="text-xs text-base-content/50 mt-1">
          Organize your day by scheduling cards.
        </p>
        <p className="text-xs text-base-content/40 flex items-center gap-1 mt-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Only you can see your Planner.
        </p>
      </div>

      {/* Day header */}
      <div className="px-4 py-2 border-b border-white/5">
        <p className="text-xs text-base-content/50">{dayName}</p>
        <p className="text-2xl font-bold">{dayNum}</p>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto">
        {hours.map((hour) => {
          const label = hour <= 12 ? `${hour}am` : `${hour - 12}pm`;
          return (
            <div key={hour} className="flex border-b border-white/5 min-h-14">
              <div className="w-10 shrink-0 pt-1 pr-2 text-right">
                <span className="text-xs text-base-content/30">{label}</span>
              </div>
              <div className="flex-1 border-l border-white/5 hover:bg-white/5 transition-colors cursor-pointer" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
