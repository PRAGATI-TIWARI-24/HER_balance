import { useState } from 'react';

export default function Assessment({ onBack, onCompleteAssessment }) {
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
      
      const fullReport = {
        ...data,
        bmi: calculatedBMI,
        exercises: formData.reg_exercise,
        assessed_at: new Date().toISOString()
      };

      setResult(fullReport);
      localStorage.setItem('herbalance_last_assessment_report', JSON.stringify(fullReport));
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

  // --- 🎨 DYNAMIC BRAND COLOR CODING ---
  const getRiskStyle = () => {
    const prob = result.probability_percentage;
    if (prob < 40) return { color: "#5B0015", bg: "#80AEE8", border: "#80AEE8", text: "Low Risk", icon: "🌿" };
    if (prob < 70) return { color: "#854D0E", bg: "#FEF9C3", border: "#FDE047", text: "Moderate Risk", icon: "⚠️" };
    return { color: "#5B0015", bg: "#F7F2E0", border: "#5B0015", text: "High Risk", icon: "🚨" };
  };

  return (
    <div className="min-h-screen bg-[#F7F2E0] py-10 md:py-16 px-4 sm:px-6 text-[#5B0015]">
      <div className="max-w-2xl mx-auto bg-[#FCFBF5] rounded-3xl shadow-sm border border-[#EDE5CD] p-6 sm:p-10">
        
        {/* Back Button */}
        <button 
          onClick={onBack} 
          className="text-[#80AEE8] hover:text-[#5B0015] text-xs sm:text-sm font-black mb-6 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>←</span>
          <span>Back to Home</span>
        </button>
        
        {!result ? (
          <>
            <div className="mb-6">
              <span className="text-2xl p-2 bg-[#F7F2E0] rounded-2xl border border-[#EDE5CD] inline-block mb-3">
                🌸
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#5B0015] tracking-tight">
                Let's understand your patterns
              </h2>
              <p className="text-xs sm:text-sm text-[#5B0015]/75 font-medium mt-1">
                Fill out this quick assessment to get personalized hormonal insights. 100% private & instant.
              </p>
            </div>

            {formError && (
              <div className="bg-[#5B0015]/10 text-[#5B0015] p-3.5 rounded-2xl text-xs mb-6 border border-[#5B0015]/30 flex items-center gap-2 font-bold animate-in fade-in">
                <span>⚠️</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-black text-[#5B0015]/75 uppercase tracking-wider mb-1">
                    Age
                  </label>
                  <input 
                    type="number" 
                    name="age" 
                    required 
                    onChange={handleChange} 
                    className="w-full border border-[#EDE5CD] rounded-xl p-2.5 sm:p-3 bg-white text-xs sm:text-sm font-bold text-[#5B0015] focus:ring-1 focus:ring-[#80AEE8] outline-none" 
                    placeholder="e.g. 24" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-[#5B0015]/75 uppercase tracking-wider mb-1">
                    Height (cm)
                  </label>
                  <input 
                    type="number" 
                    name="height" 
                    required 
                    onChange={handleChange} 
                    className="w-full border border-[#EDE5CD] rounded-xl p-2.5 sm:p-3 bg-white text-xs sm:text-sm font-bold text-[#5B0015] focus:ring-1 focus:ring-[#80AEE8] outline-none" 
                    placeholder="e.g. 160" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-[#5B0015]/75 uppercase tracking-wider mb-1">
                    Weight (kg)
                  </label>
                  <input 
                    type="number" 
                    name="weight" 
                    step="0.1" 
                    required 
                    onChange={handleChange} 
                    className="w-full border border-[#EDE5CD] rounded-xl p-2.5 sm:p-3 bg-white text-xs sm:text-sm font-bold text-[#5B0015] focus:ring-1 focus:ring-[#80AEE8] outline-none" 
                    placeholder="e.g. 60.5" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-[#5B0015]/75 uppercase tracking-wider mb-1">
                    Cycle Length (days)
                  </label>
                  <input 
                    type="number" 
                    name="cycle_length" 
                    required 
                    onChange={handleChange} 
                    className="w-full border border-[#EDE5CD] rounded-xl p-2.5 sm:p-3 bg-white text-xs sm:text-sm font-bold text-[#5B0015] focus:ring-1 focus:ring-[#80AEE8] outline-none" 
                    placeholder="e.g. 28" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-[#5B0015]/75 uppercase tracking-wider mb-1.5">
                  Is your cycle regular?
                </label>
                <select 
                  name="cycle_ri" 
                  onChange={handleChange} 
                  className="w-full border border-[#EDE5CD] rounded-xl p-2.5 sm:p-3 bg-white text-xs sm:text-sm font-bold text-[#5B0015] focus:ring-1 focus:ring-[#80AEE8] outline-none cursor-pointer"
                >
                  <option value={0}>Yes, it's mostly regular</option>
                  <option value={1}>No, it's irregular / unpredictable</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-[#5B0015]/75 uppercase tracking-wider mb-2">
                  Have you noticed any of these recently? (Check all that apply)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { name: 'weight_gain', label: 'Unusual Weight Gain' },
                    { name: 'hair_growth', label: 'Excess Facial/Body Hair' },
                    { name: 'skin_darkening', label: 'Skin Darkening (Neck/Creases)' },
                    { name: 'hair_loss', label: 'Noticeable Hair Loss' },
                    { name: 'pimples', label: 'Acne / Breakouts' },
                    { name: 'fast_food', label: 'Frequent Fast Food Intake' },
                  ].map(symptom => (
                    <label 
                      key={symptom.name} 
                      className="flex items-center gap-3 p-3 border border-[#EDE5CD] bg-white rounded-xl cursor-pointer hover:bg-[#F7F2E0] transition-colors"
                    >
                      <input 
                        type="checkbox" 
                        name={symptom.name} 
                        onChange={handleChange} 
                        className="w-4 h-4 rounded text-[#5B0015] accent-[#5B0015] cursor-pointer" 
                      />
                      <span className="text-xs sm:text-sm font-bold text-[#5B0015]">{symptom.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 p-3.5 border border-[#80AEE8]/40 bg-[#80AEE8]/15 rounded-2xl cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="reg_exercise" 
                    onChange={handleChange} 
                    className="w-4 h-4 rounded accent-[#5B0015] cursor-pointer" 
                  />
                  <span className="text-xs sm:text-sm font-bold text-[#5B0015]">
                    I exercise regularly (3+ times a week)
                  </span>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-[#5B0015] hover:bg-[#450010] text-[#F7F2E0] font-black py-3.5 rounded-2xl transition-all shadow-md active:scale-[0.99] disabled:opacity-50 flex justify-center items-center h-12 sm:h-13 text-xs sm:text-sm cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2.5">
                    <svg className="animate-spin h-4 w-4 text-[#F7F2E0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Analyzing Patterns...</span>
                  </span>
                ) : (
                  <span>Generate Free AI Insights ➔</span>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            {/* --- 📊 MINI HEALTH REPORT UI --- */}
            <h2 className="text-xl sm:text-2xl font-black text-[#5B0015] mb-5 text-center">
              Your Personalized Health Report
            </h2>
            
            <div className="bg-[#F7F2E0] border border-[#EDE5CD] rounded-2xl p-5 sm:p-6 mb-5 shadow-inner">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-[#5B0015]/70 uppercase tracking-wider">
                  AI Endocrine Assessment
                </span>
                <span 
                  className="px-3 py-1 rounded-full text-[10px] font-black border" 
                  style={{ 
                    backgroundColor: getRiskStyle().bg, 
                    color: getRiskStyle().color,
                    borderColor: getRiskStyle().border 
                  }}
                >
                  {getRiskStyle().text}
                </span>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 border border-[#EDE5CD] shadow-sm bg-white"
                >
                  {getRiskStyle().icon}
                </div>
                <div>
                  <h3 className="text-3xl font-black text-[#5B0015]">{result.probability_percentage}%</h3>
                  <p className="text-xs text-[#5B0015]/75 font-semibold">Pattern match probability</p>
                </div>
              </div>

              <div className="w-full bg-white rounded-full h-2.5 mb-5 border border-[#EDE5CD] overflow-hidden">
                <div 
                  className="h-2.5 rounded-full transition-all duration-1000 bg-[#5B0015]" 
                  style={{ width: `${result.probability_percentage}%` }}
                />
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-[#EDE5CD]">
                <p className="text-xs sm:text-sm text-[#5B0015] leading-relaxed font-semibold">
                  {getActionableTip()}
                </p>
              </div>
            </div>

            {/* ── 🚀 THE CONVERSION BRIDGE: SAVE & MOVE TO DASHBOARD ── */}
            <div className="bg-[#FCFBF5] border-2 border-[#80AEE8] p-4 rounded-2xl mb-5 space-y-3 shadow-md text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">🌿</span>
                <p className="text-xs font-black text-[#5B0015] uppercase tracking-wide">
                  Take Next Actionable Step
                </p>
              </div>
              <p className="text-xs text-[#5B0015]/80 font-medium">
                Save this report to your private dashboard to track daily water, seed intake rhythm, and get clinical summaries ready for your doctor.
              </p>
              <button 
                onClick={() => onCompleteAssessment ? onCompleteAssessment(result) : onBack()}
                className="w-full bg-[#5B0015] hover:bg-[#450010] text-[#F7F2E0] font-black py-3.5 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>💾 Save Report & Open Dashboard Routine ➔</span>
              </button>
            </div>

            <p className="text-[11px] text-[#5B0015]/70 text-center mb-5 px-3 leading-relaxed font-medium">
              <b>Disclaimer:</b> This assessment is powered by an AI pattern model trained on general health datasets. It is not a medical diagnosis. Please consult a qualified gynecologist for clinical advice.
            </p>

            <button 
              onClick={() => setResult(null)} 
              className="w-full border-2 border-[#EDE5CD] text-[#5B0015] font-black py-2.5 rounded-xl hover:bg-[#F7F2E0] transition-colors text-xs cursor-pointer"
            >
              ↺ Retake Assessment With New Values
            </button>
          </div>
        )}
      </div>
    </div>
  );
}