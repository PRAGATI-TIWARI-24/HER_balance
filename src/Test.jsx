import { useState } from 'react';

export default function Assessment({ onBack }) {
  const [formData, setFormData] = useState({
    age: '', height: '', weight: '', cycle_ri: 0, cycle_length: '',
    weight_gain: 0, hair_growth: 0, skin_darkening: 0, 
    hair_loss: 0, pimples: 0, fast_food: 0, reg_exercise: 0
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
    }));
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // --- 🛡️ SMART FORM VALIDATION ---
    const age = parseInt(formData.age);
    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    const cycle = parseInt(formData.cycle_length);

    if (age < 12 || age > 80) {
      setFormError("Please enter a valid age between 12 and 80.");
      return;
    }
    if (height < 120 || height > 220) {
      setFormError("Please enter a valid height in cm (120 - 220).");
      return;
    }
    if (weight < 30 || weight > 200) {
      setFormError("Please enter a valid weight in kg (30 - 200).");
      return;
    }
    if (cycle < 15 || cycle > 90) {
      setFormError("Please enter a valid cycle length in days (15 - 90).");
      return;
    }

    setLoading(true);
    setFormError("");

    const heightInMeters = height / 100;
    const calculatedBMI = weight / (heightInMeters * heightInMeters);

    const apiData = {
      age: age,
      weight: weight,
      bmi: calculatedBMI,
      cycle_ri: parseInt(formData.cycle_ri),
      cycle_length: cycle,
      weight_gain: formData.weight_gain,
      hair_growth: formData.hair_growth,
      skin_darkening: formData.skin_darkening,
      hair_loss: formData.hair_loss,
      pimples: formData.pimples,
      fast_food: formData.fast_food,
      reg_exercise: formData.reg_exercise
    };

    try {
      const response = await fetch("https://her-balance.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData)
      });
      const data = await response.json();
      
      // Result ke sath BMI aur Exercise data bhi save kar rahe hain tips ke liye
      setResult({
        ...data,
        bmi: calculatedBMI,
        exercises: formData.reg_exercise
      });
    } catch (error) {
      console.error("Error connecting to server:", error);
      setFormError("Server error! Make sure your FastAPI backend is awake and running.");
    } finally {
      setLoading(false);
    }
  };

  // --- 🧠 SMART TIPS GENERATOR ---
  const getActionableTip = () => {
    if (result.bmi > 25) {
      return "💡 Tip: Your BMI is slightly elevated. Focusing on a protein-rich diet and reducing fast food can help balance hormones naturally.";
    } else if (result.exercises === 0) {
      return "💡 Tip: Adding just 30 minutes of daily movement (like brisk walking or yoga) can significantly improve your cycle regularity.";
    } else {
      return "💡 Tip: You are maintaining a good lifestyle! Keep up with your regular exercise and balanced diet to support your hormonal health.";
    }
  };

  // --- 🎨 DYNAMIC COLOR CODING ---
  const getRiskStyle = () => {
    const prob = result.probability_percentage;
    if (prob < 40) return { color: "#A8BFA3", bg: "#E8F0E7", text: "Low Risk", icon: "🌿" }; // Green
    if (prob < 70) return { color: "#EAB308", bg: "#FEF9C3", text: "Moderate Risk", icon: "⚠️" }; // Yellow
    return { color: "#D99AA5", bg: "#F5E8EB", text: "High Risk", icon: "🚨" }; // Red
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] py-12 px-5">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-[#E8E4DE] p-8">
        <button onClick={onBack} className="text-[#8B7BB5] text-sm font-semibold mb-6 hover:underline">
          ← Back to Home
        </button>
        
        {!result ? (
          <>
            <h2 className="text-3xl font-bold text-[#29272D] mb-2 font-display">Let's understand your patterns</h2>
            <p className="text-[#7A7880] mb-6">Fill out this quick assessment to get personalized insights.</p>

            {formError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 flex items-center gap-2 animate-in fade-in">
                ⚠️ {formError}
              </div>
            )}

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

              <button type="submit" disabled={loading} className="w-full bg-[#8B7BB5] text-white font-bold py-4 rounded-xl hover:bg-[#7A6AA4] transition-all flex justify-center items-center h-14">
                {loading ? (
                  <span className="flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing Patterns...
                  </span>
                ) : "Generate Insights"}
              </button>
            </form>
          </>
        ) : (
          <div className="animate-in fade-in zoom-in duration-300">
            {/* --- 📊 MINI HEALTH REPORT UI --- */}
            <h2 className="text-2xl font-bold text-[#29272D] mb-6 text-center font-display">Your Health Report</h2>
            
            <div className="bg-[#FAF9F6] border border-[#E8E4DE] rounded-2xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-[#7A7880] uppercase tracking-wider">AI Assessment</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: getRiskStyle().bg, color: getRiskStyle().color }}>
                  {getRiskStyle().text}
                </span>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shrink-0" style={{ backgroundColor: getRiskStyle().bg }}>
                  {getRiskStyle().icon}
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold text-[#29272D]">{result.probability_percentage}%</h3>
                  <p className="text-sm text-[#7A7880]">Pattern match probability</p>
                </div>
              </div>

              <div className="w-full bg-[#E8E4DE] rounded-full h-2.5 mb-6">
                <div className="h-2.5 rounded-full transition-all duration-1000" style={{ width: `${result.probability_percentage}%`, backgroundColor: getRiskStyle().color }}></div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#E8E4DE]">
                <p className="text-sm text-[#29272D] leading-relaxed font-medium">
                  {getActionableTip()}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#7A7880] text-center mb-6 px-4 leading-relaxed">
              <strong>Disclaimer:</strong> This assessment is powered by an AI model trained on general health datasets. It is not a medical diagnosis. Please consult a qualified healthcare professional for medical advice.
            </p>

            <button onClick={() => setResult(null)} className="w-full border border-[#8B7BB5] text-[#8B7BB5] font-bold py-3.5 rounded-xl hover:bg-[#FAF9F6] transition-colors">
              Take Assessment Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}