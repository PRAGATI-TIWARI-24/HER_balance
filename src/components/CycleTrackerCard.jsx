import React from 'react';

export default function CycleTrackerCard({ cycleState }) {
  const phases = ['Flow Phase', 'Follicular', 'Ovulation', 'Luteal'];

  return (
    <div className="bg-[#FCFBF5] rounded-3xl p-6 border border-[#EDE5CD] shadow-sm space-y-4 text-[#5B0015]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#5B0015]/70 text-xs font-bold uppercase tracking-wider mb-1">Cycle Overview</p>
          <p className="text-[#5B0015] font-black text-3xl">Day {cycleState.cycleDay}</p>
          <p className="text-[#5B0015] text-xs font-bold mt-1">
            Current Phase: <span className="text-[#80AEE8] underline">{cycleState.phase}</span>
          </p>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-black ${
          cycleState.symptomStatus === 'Needs Attention' 
            ? 'bg-[#5B0015] text-[#F7F2E0] animate-pulse' 
            : 'bg-[#80AEE8]/30 text-[#5B0015]'
        }`}>
          {cycleState.symptomStatus}
        </div>
      </div>

      {/* Progress Phases Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] text-[#5B0015]/70 font-bold uppercase tracking-wider">
          <span>Flow</span>
          <span>Follicular</span>
          <span>Ovulation</span>
          <span>Luteal</span>
        </div>
        <div className="flex gap-1.5">
          {phases.map((p) => (
            <div
              key={p}
              className={`flex-1 h-2 rounded-full transition-all ${
                cycleState.phase === p 
                  ? 'bg-[#80AEE8]' 
                  : 'bg-[#EDE5CD]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Active Logged Symptoms */}
      {cycleState.loggedSymptoms && cycleState.loggedSymptoms.length > 0 && (
        <div className="bg-[#F7F2E0] p-3 rounded-2xl border border-[#EDE5CD]">
          <p className="text-[11px] text-[#5B0015]/70 font-bold uppercase tracking-wider mb-1.5">Today's Active Symptoms:</p>
          <div className="flex flex-wrap gap-1.5">
            {cycleState.loggedSymptoms.slice(-4).map((s, idx) => (
              <span key={idx} className="bg-[#80AEE8]/40 text-[#5B0015] text-[10px] px-2.5 py-0.5 rounded-md font-bold">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}