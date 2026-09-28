import React from 'react';

export default function CycleTrackerCard({ cycleState }) {
  return (
    <div className="bg-gradient-to-br from-[#F7F4FB] to-[#FAF9F6] rounded-2xl p-5 border border-[#EAE6F4] shadow-sm space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#7A7880] text-xs font-medium mb-1">Cycle Overview</p>
          <p className="text-[#29272D] font-bold text-3xl">Day {cycleState.cycleDay}</p>
          <p className="text-[#8B7BB5] text-xs font-semibold mt-1">
            Current Phase: <span className="underline">{cycleState.phase}</span>
          </p>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          cycleState.symptomStatus === 'Needs Attention' 
            ? 'bg-red-100 text-red-600' 
            : 'bg-[#E8F0E7] text-[#6A9F65]'
        }`}>
          {cycleState.symptomStatus}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] text-[#7A7880] font-medium">
          <span>Flow</span>
          <span>Follicular</span>
          <span>Ovulation</span>
          <span>Luteal</span>
        </div>
        <div className="flex gap-1.5">
          {['Flow Phase', 'Follicular', 'Ovulation', 'Luteal'].map((p) => (
            <div
              key={p}
              className={`flex-1 h-2 rounded-full transition-all ${
                cycleState.phase === p ? 'bg-[#8B7BB5]' : 'bg-[#E8E4DE]'
              }`}
            />
          ))}
        </div>
      </div>

      {cycleState.loggedSymptoms.length > 0 && (
        <div className="bg-white p-3 rounded-xl border border-[#E8E4DE]">
          <p className="text-[11px] text-[#7A7880] font-semibold mb-1.5">Today's Active Symptoms:</p>
          <div className="flex flex-wrap gap-1.5">
            {cycleState.loggedSymptoms.slice(-4).map((s, idx) => (
              <span key={idx} className="bg-[#EAE6F4] text-[#8B7BB5] text-[10px] px-2 py-0.5 rounded-md font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}