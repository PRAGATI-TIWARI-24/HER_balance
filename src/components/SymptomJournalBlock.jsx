import React, { useState } from 'react';

export default function SymptomJournalBlock({ onSave }) {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState('None');
  const [selectedMood, setSelectedMood] = useState('😊 Neutral');
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
    <div className="bg-white rounded-2xl border border-[#E8E4DE] p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[#29272D] text-base">🌸 Symptom & Flow Journal</h3>
        <span className="text-xs text-[#7A7880]">Today</span>
      </div>

      <div>
        <p className="text-xs font-semibold text-[#7A7880] mb-2">Period Flow Today:</p>
        <div className="flex gap-2">
          {flowOptions.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFlow(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                selectedFlow === f
                  ? 'bg-[#8B7BB5] text-white border-[#8B7BB5]'
                  : 'bg-[#FAF9F6] text-[#29272D] border-[#E8E4DE] hover:border-[#8B7BB5]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-[#7A7880] mb-2">Physical Symptoms:</p>
        <div className="flex flex-wrap gap-2">
          {symptomOptions.map((s) => {
            const active = selectedSymptoms.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSymptom(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  active
                    ? 'bg-[#D99AA5] text-white shadow-sm'
                    : 'bg-[#FAF9F6] text-[#7A7880] border border-[#E8E4DE] hover:border-[#D99AA5]'
                }`}
              >
                {s} {active ? '✓' : '+'}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-[#7A7880] mb-2">How are you feeling?</p>
        <div className="flex flex-wrap gap-2">
          {moodOptions.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMood(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                selectedMood === m
                  ? 'bg-[#A8BFA3] text-white border-[#A8BFA3]'
                  : 'bg-[#FAF9F6] text-[#29272D] border-[#E8E4DE]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-[#8B7BB5] hover:bg-[#7A6AA4] text-white font-semibold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
      >
        {isSaved ? '✓ Journal Logged & Cycle Updated!' : 'Save & Update Cycle Tracker'}
      </button>
    </div>
  );
}