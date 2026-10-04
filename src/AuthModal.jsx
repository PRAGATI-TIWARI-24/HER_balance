import { useState } from 'react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Data store karne ke liye
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Agar pop-up band hai, toh kuch mat dikhao
  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Type karte hi purana error hata do
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Backend ka link (isLogin true hai toh login par bhejo, warna signup par)
    const endpoint = isLogin ? '/login' : '/signup';
    const url = `https://her-balance.onrender.com${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isLogin 
            ? { email: formData.email, password: formData.password }
            : formData
        )
      });

      const data = await response.json();

      if (response.ok) {
        // Backend ne Code 200 (Success) bheja hai
        alert(data.message); // Popup message dikhayega "Welcome back!" ya "Account created!"
        // Success hone par App.jsx ko batao ki login ho gaya, aur modal band kar do
        onLoginSuccess(data.user_id, formData.name); 
      } else {
        // Galat password ya email already exists ka error
        setError(data.detail || "Something went wrong!");
      }
    } catch (err) {
      setError("Server is offline. Please make sure FastAPI backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
      {/* Pop-up Box */}
      <div className="bg-[#FCFBF5] text-[#5B0015] rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[#EDE5CD] relative animate-in zoom-in-95 duration-200">
        
        {/* Close (X) Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-6 text-[#5B0015]/70 hover:text-[#5B0015] bg-[#F7F2E0] w-8 h-8 rounded-full flex items-center justify-center border border-[#EDE5CD] text-sm font-bold cursor-pointer transition-colors"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#80AEE8]/30 rounded-2xl flex items-center justify-center mx-auto mb-2 text-2xl border border-[#80AEE8]/50">
            🌸
          </div>
          <h2 className="text-3xl font-black text-[#5B0015] mb-2 font-display">
            {isLogin ? "Welcome Back! 🌸" : "Join HerBalance ✨"}
          </h2>
          <p className="text-xs text-[#5B0015]/75 font-medium">
            {isLogin ? "Log in to access your personalized sanctuary dashboard." : "Create an account to start your hormonal calibration journey."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#F7F2E0] p-1 rounded-2xl flex gap-1 mb-5 border border-[#EDE5CD]">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              isLogin 
                ? 'bg-[#5B0015] text-[#F7F2E0] shadow-sm' 
                : 'text-[#5B0015]/70 hover:text-[#5B0015]'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              !isLogin 
                ? 'bg-[#5B0015] text-[#F7F2E0] shadow-sm' 
                : 'text-[#5B0015]/70 hover:text-[#5B0015]'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Message Dikhane ke liye */}
        {error && (
          <div className="bg-[#5B0015]/10 text-[#5B0015] p-3 rounded-xl text-xs mb-5 border border-[#5B0015]/30 font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Agar Signup hai toh Name wala box bhi dikhao */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-[#5B0015] mb-1 uppercase tracking-wider">Full Name</label>
              <input 
                type="text" name="name" value={formData.name} onChange={handleChange} required={!isLogin}
                className="w-full border border-[#EDE5CD] rounded-xl p-3 bg-white text-[#5B0015] font-semibold focus:ring-2 focus:ring-[#80AEE8] outline-none transition-colors text-xs" 
                placeholder="e.g. Priya Sharma" 
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-[#5B0015] mb-1 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" name="email" value={formData.email} onChange={handleChange} required
              className="w-full border border-[#EDE5CD] rounded-xl p-3 bg-white text-[#5B0015] font-semibold focus:ring-2 focus:ring-[#80AEE8] outline-none transition-colors text-xs" 
              placeholder="priya@example.com" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#5B0015] mb-1 uppercase tracking-wider">Password</label>
            <input 
              type="password" name="password" value={formData.password} onChange={handleChange} required
              className="w-full border border-[#EDE5CD] rounded-xl p-3 bg-white text-[#5B0015] font-semibold focus:ring-2 focus:ring-[#80AEE8] outline-none transition-colors text-xs" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-[#5B0015] text-[#F7F2E0] font-black py-3.5 rounded-xl hover:bg-[#450010] transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 mt-2 text-xs"
          >
            {loading ? "Please wait..." : (isLogin ? "Log In to Sanctuary ➔" : "Create Account ➔")}
          </button>
        </form>

        {/* Switch between Login and Signup */}
        <div className="mt-6 text-center text-xs text-[#5B0015]/75 font-medium">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-[#80AEE8] font-black hover:underline cursor-pointer"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </div>

      </div>
    </div>
  );
}