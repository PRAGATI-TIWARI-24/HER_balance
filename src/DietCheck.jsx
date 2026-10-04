import { useState } from "react";

export default function DietCheck() {
  const [diet, setDiet] = useState("");
  const [sleep, setSleep] = useState("6-8 hours");
  const [stress, setStress] = useState("Medium");
  const [aiTip, setAiTip] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    setAiTip(""); // Purana reply clear kar do
    
    try {
      // Ye line tumhare FastAPI backend ko data bhejti hai
      const response = await fetch("http://127.0.0.1:8000/holistic-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ diet, sleep, stress }),
      });
      
      const data = await response.json();
      setAiTip(data.reply);
    } catch (error) {
      setAiTip("Oops! Backend se connect nahi ho paaya. Check karo ki uvicorn server chal raha hai ya nahi.");
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-[#FCFBF5] text-[#5B0015] rounded-3xl shadow-xl border border-[#EDE5CD]">
      <h2 className="text-xl font-black text-[#5B0015] mb-4 flex items-center gap-2">
        Holistic AI Dietitian 🥗
      </h2>
      
      <div className="flex flex-col gap-4">
        {/* Diet Input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#5B0015]/80 mb-1">Aaj kya khaya?</label>
          <textarea 
            className="w-full mt-1 p-3 border border-[#EDE5CD] bg-white rounded-xl outline-none focus:ring-2 focus:ring-[#80AEE8] text-[#5B0015] font-semibold text-xs resize-none"
            placeholder="Jaise: 1 maggi aur cold drink..."
            rows="3"
            value={diet}
            onChange={(e) => setDiet(e.target.value)}
          />
        </div>

        {/* Sleep Dropdown */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#5B0015]/80 mb-1">Neend kaisi aayi?</label>
          <select 
            className="w-full mt-1 p-2.5 border border-[#EDE5CD] bg-white rounded-xl outline-none focus:ring-2 focus:ring-[#80AEE8] text-[#5B0015] font-bold text-xs"
            value={sleep}
            onChange={(e) => setSleep(e.target.value)}
          >
            <option value="Less than 6 hours">6 ghante se kam 😴</option>
            <option value="6-8 hours">6-8 ghante (Theek thaak) 😊</option>
            <option value="More than 8 hours">8 ghante se zyada ✨</option>
          </select>
        </div>

        {/* Stress Dropdown */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#5B0015]/80 mb-1">Stress level kaisa tha?</label>
          <select 
            className="w-full mt-1 p-2.5 border border-[#EDE5CD] bg-white rounded-xl outline-none focus:ring-2 focus:ring-[#80AEE8] text-[#5B0015] font-bold text-xs"
            value={stress}
            onChange={(e) => setStress(e.target.value)}
          >
            <option value="Low">Low (Ekdum chill) 🌿</option>
            <option value="Medium">Medium (Thoda bahut) 😐</option>
            <option value="High">High (Bohot zyada) 🚨</option>
          </select>
        </div>

        {/* Submit Button */}
        <button 
          onClick={handleCheck}
          disabled={loading || !diet}
          className="w-full bg-[#5B0015] text-[#F7F2E0] py-3 rounded-xl hover:bg-[#450010] transition-all font-black text-xs shadow-md active:scale-95 disabled:opacity-50 cursor-pointer mt-1"
        >
          {loading ? "AI Soch raha hai..." : "Ask AI Dietitian ➔"}
        </button>

        {/* AI Answer dikhane ki jagah */}
        {aiTip && (
          <div className="mt-4 p-4 bg-[#F7F2E0] text-[#5B0015] rounded-2xl border border-[#EDE5CD] text-xs leading-relaxed shadow-sm">
            <strong className="block text-[#80AEE8] uppercase tracking-wider font-black mb-1">✨ AI Recommendation:</strong>
            {aiTip}
          </div>
        )}
      </div>
    </div>
  );
}