import React, { useState } from 'react';

export default function SymptomJournalBlock({ onSave }) {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState('None');
  const [selectedMood, setSelectedMood] = useState('😊 Calm');
  const [isSaved, setIsSaved] = useState(false);

  const symptomOptions = ['Cramps', 'Bloating', 'Acne', 'Fatigue', 'Headache', 'Backache', 'Mood Swings'];
  const flowOptions = ['None', 'Light', 'Medium', 'Heavy'];
  const moodOptions = ['😊 Calm', '😴 Tired', '😖 In Pain', '⚡ Energetic', '😡 Irritable'];

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSubmit = () => {
    onSave({
      symptoms: selectedSymptoms,
      flow: selectedFlow,
      mood: selectedMood,
      timestamp: new Date().toISOString()
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="bg-[#FCFBF5] rounded-3xl border border-[#EDE5CD] p-6 shadow-sm space-y-4 text-[#5B0015]">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-[#5B0015] text-base flex items-center gap-2">
          🌸 Symptom & Flow Journal
        </h3>
        <span className="text-[10px] font-bold text-[#5B0015]/70 uppercase tracking-wider bg-[#F7F2E0] px-2.5 py-1 rounded-full border border-[#EDE5CD]">
          Today
        </span>
      </div>

      {/* Period Flow Selector */}
      <div>
        <p className="text-[11px] font-bold text-[#5B0015]/70 uppercase tracking-wider mb-2">Period Flow Today:</p>
        <div className="flex gap-1.5">
          {flowOptions.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFlow(f)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                selectedFlow === f
                  ? 'bg-[#5B0015] text-[#F7F2E0] border-[#5B0015] shadow-sm'
                  : 'bg-[#F7F2E0] text-[#5B0015] border-[#EDE5CD] hover:border-[#80AEE8]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Physical Symptoms Multi-select */}
      <div>
        <p className="text-[11px] font-bold text-[#5B0015]/70 uppercase tracking-wider mb-2">Physical Symptoms:</p>
        <div className="flex flex-wrap gap-1.5">
          {symptomOptions.map((s) => {
            const active = selectedSymptoms.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSymptom(s)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-[#80AEE8] text-[#5B0015] shadow-sm border border-[#80AEE8]'
                    : 'bg-[#F7F2E0] text-[#5B0015]/80 border border-[#EDE5CD] hover:border-[#80AEE8]'
                }`}
              >
                {s} {active ? '✓' : '+'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mood Selector */}
      <div>
        <p className="text-[11px] font-bold text-[#5B0015]/70 uppercase tracking-wider mb-2">Mood & Emotional Balance:</p>
        <div className="flex flex-wrap gap-1.5">
          {moodOptions.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMood(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                selectedMood === m
                  ? 'bg-[#5B0015] text-[#F7F2E0] border-[#5B0015] shadow-sm'
                  : 'bg-[#F7F2E0] text-[#5B0015] border-[#EDE5CD] hover:border-[#80AEE8]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-[#5B0015] hover:bg-[#450010] text-[#F7F2E0] font-black py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-2"
      >
        {isSaved ? '✓ Journal Logged & Cycle Updated!' : 'Save & Update Cycle Tracker 🌸'}
      </button>
    </div>
  );
}