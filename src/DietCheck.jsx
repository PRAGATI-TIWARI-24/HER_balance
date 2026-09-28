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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <h2 className="text-xl font-bold text-[#A8B58A] mb-4">Holistic AI Dietitian 🌿</h2>
      
      <div className="flex flex-col gap-4">
        {/* Diet Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Aaj kya khaya?</label>
          <textarea 
            className="w-full mt-1 p-2 border rounded-md outline-none focus:border-[#A8B58A]"
            placeholder="Jaise: 1 maggi aur cold drink..."
            value={diet}
            onChange={(e) => setDiet(e.target.value)}
          />
        </div>

        {/* Sleep Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Neend kaisi aayi?</label>
          <select 
            className="w-full mt-1 p-2 border rounded-md outline-none focus:border-[#A8B58A]"
            value={sleep}
            onChange={(e) => setSleep(e.target.value)}
          >
            <option value="Less than 6 hours">6 ghante se kam 🥱</option>
            <option value="6-8 hours">6-8 ghante (Theek thaak) 😴</option>
            <option value="More than 8 hours">8 ghante se zyada 🛌</option>
          </select>
        </div>

        {/* Stress Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Stress level kaisa tha?</label>
          <select 
            className="w-full mt-1 p-2 border rounded-md outline-none focus:border-[#A8B58A]"
            value={stress}
            onChange={(e) => setStress(e.target.value)}
          >
            <option value="Low">Low (Ekdum chill) 😌</option>
            <option value="Medium">Medium (Thoda bahut) 😐</option>
            <option value="High">High (Bohot zyada) 🤯</option>
          </select>
        </div>

        {/* Submit Button */}
        <button 
          onClick={handleCheck}
          disabled={loading || !diet}
          className="w-full bg-[#A8B58A] text-white py-2 rounded-md hover:bg-[#8e9a74] transition disabled:opacity-50"
        >
          {loading ? "AI Soch raha hai..." : "Ask AI Dietitian"}
        </button>

        {/* AI Answer dikhane ki jagah */}
        {aiTip && (
          <div className="mt-4 p-4 bg-purple-50 text-purple-800 rounded-md border border-purple-100 text-sm leading-relaxed">
            <strong>AI Tip:</strong> {aiTip}
          </div>
        )}
      </div>
    </div>
  );
}