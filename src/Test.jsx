import { useState } from 'react';

export default function Assessment({ onBack }) {
  const [formData, setFormData] = useState({
    age: '', height: '', weight: '', cycle_ri: 0, cycle_length: '',
    weight_gain: 0, hair_growth: 0, skin_darkening: 0, 
    hair_loss: 0, pimples: 0, fast_food: 0, reg_exercise: 0
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const heightInMeters = parseFloat(formData.height) / 100;
    const calculatedBMI = parseFloat(formData.weight) / (heightInMeters * heightInMeters);

    const apiData = {
      age: parseInt(formData.age),
      weight: parseFloat(formData.weight),
      bmi: calculatedBMI,
      cycle_ri: parseInt(formData.cycle_ri),
      cycle_length: parseInt(formData.cycle_length),
      weight_gain: formData.weight_gain,
      hair_growth: formData.hair_growth,
      skin_darkening: formData.skin_darkening,
      hair_loss: formData.hair_loss,
      pimples: formData.pimples,
      fast_food: formData.fast_food,
      reg_exercise: formData.reg_exercise
    };

    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData)
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error connecting to server:", error);
      alert("Server error! Make sure your FastAPI backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-12 px-5">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-[#E8E4DE] p-8">
        <button onClick={onBack} className="text-[#8B7BB5] text-sm font-semibold mb-6 hover:underline">
          ← Back to Home
        </button>
        <h2 className="text-3xl font-bold text-[#29272D] mb-2 font-display">Let's understand your patterns</h2>
        <p className="text-[#7A7880] mb-8">Fill out this quick assessment to get personalized insights.</p>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#29272D] mb-1">Age</label>
                <input type="number" name="age" required onChange={handleChange} className="w-full border border-[#E8E4DE] rounded-xl p-3 bg-[#FAF9F6] focus:border-[#8B7BB5] outline-none" placeholder="e.g. 24" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#29272D] mb-1">Height (cm)</label>
                <input type="number" name="height" required onChange={handleChange} className="w-full border border-[#E8E4DE] rounded-xl p-3 bg-[#FAF9F6] focus:border-[#8B7BB5] outline-none" placeholder="e.g. 160" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#29272D] mb-1">Weight (kg)</label>
                <input type="number" name="weight" step="0.1" required onChange={handleChange} className="w-full border border-[#E8E4DE] rounded-xl p-3 bg-[#FAF9F6] focus:border-[#8B7BB5] outline-none" placeholder="e.g. 60.5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#29272D] mb-1">Cycle Length (days)</label>
                <input type="number" name="cycle_length" required onChange={handleChange} className="w-full border border-[#E8E4DE] rounded-xl p-3 bg-[#FAF9F6] focus:border-[#8B7BB5] outline-none" placeholder="e.g. 28" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#29272D] mb-2">Is your cycle regular?</label>
              <select name="cycle_ri" onChange={handleChange} className="w-full border border-[#E8E4DE] rounded-xl p-3 bg-[#FAF9F6] focus:border-[#8B7BB5] outline-none">
                <option value={0}>Yes, it's mostly regular</option>
                <option value={1}>No, it's irregular / unpredictable</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#29272D] mb-3">Have you noticed any of these recently? (Check all that apply)</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'weight_gain', label: 'Unusual Weight Gain' },
                  { name: 'hair_growth', label: 'Excess Facial/Body Hair' },
                  { name: 'skin_darkening', label: 'Skin Darkening (Neck/Creases)' },
                  { name: 'hair_loss', label: 'Noticeable Hair Loss' },
                  { name: 'pimples', label: 'Acne / Breakouts' },
                  { name: 'fast_food', label: 'Frequent Fast Food Intake' },
                ].map(symptom => (
                  <label key={symptom.name} className="flex items-center gap-3 p-3 border border-[#E8E4DE] rounded-xl cursor-pointer hover:bg-[#FAF9F6]">
                    <input type="checkbox" name={symptom.name} onChange={handleChange} className="w-4 h-4 text-[#8B7BB5] accent-[#8B7BB5]" />
                    <span className="text-sm text-[#29272D]">{symptom.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 p-3 border border-[#E8E4DE] bg-[#E8F0E7] rounded-xl cursor-pointer">
                <input type="checkbox" name="reg_exercise" onChange={handleChange} className="w-4 h-4 accent-[#A8BFA3]" />
                <span className="text-sm font-medium text-[#29272D]">I exercise regularly (3+ times a week)</span>
              </label>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#8B7BB5] text-white font-bold py-4 rounded-xl hover:bg-[#7A6AA4] transition-all flex justify-center items-center">
              {loading ? "Analyzing Patterns..." : "Generate Insights"}
            </button>
          </form>
        ) : (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${result.risk_flag === 1 ? 'bg-[#D99AA5]/20' : 'bg-[#A8BFA3]/20'}`}>
              <span className="text-3xl">{result.risk_flag === 1 ? '⚠️' : '🌿'}</span>
            </div>
            <h3 className="text-2xl font-bold text-[#29272D] mb-2 font-display">
              {result.risk_flag === 1 ? "PCOD Patterns Detected" : "Patterns look typical"}
            </h3>
            <p className="text-[#7A7880] mb-6">
              {result.risk_flag === 1 
                ? "Your logged symptoms share significant characteristics with PCOD patterns. We recommend discussing this with a healthcare professional." 
                : "Your current logs do not strongly indicate PCOD patterns. Keep tracking your health to maintain a good baseline."}
            </p>
            <div className="bg-[#FAF9F6] border border-[#E8E4DE] p-4 rounded-xl mb-6">
              <p className="text-xs text-[#7A7880] uppercase tracking-wider font-semibold mb-1">AI Confidence Score</p>
              <p className="text-xl font-bold text-[#8B7BB5]">{result.probability_percentage}%</p>
            </div>
            <button onClick={() => setResult(null)} className="w-full border border-[#8B7BB5] text-[#8B7BB5] font-bold py-3 rounded-xl hover:bg-[#FAF9F6] transition-colors">
              Take Assessment Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}