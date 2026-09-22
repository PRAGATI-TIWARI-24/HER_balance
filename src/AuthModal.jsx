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
    const url = `http://127.0.0.1:8000${endpoint}`;

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
    <div className="fixed inset-0 bg-[#29272D]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Pop-up Box */}
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl relative animate-in fade-in zoom-in duration-200">
        
        {/* Close (X) Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-6 text-[#7A7880] hover:text-[#29272D] text-2xl font-bold"
        >
          ✕
        </button>

        <h2 className="text-3xl font-bold text-[#29272D] mb-2 font-display">
          {isLogin ? "Welcome Back! 🌸" : "Join HerBalance ✨"}
        </h2>
        <p className="text-[#7A7880] mb-6">
          {isLogin ? "Log in to access your personalized dashboard." : "Create an account to start your health journey."}
        </p>

        {/* Error Message Dikhane ke liye */}
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm mb-5 border border-red-100 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Agar Signup hai toh Name wala box bhi dikhao */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-[#29272D] mb-1">Full Name</label>
              <input 
                type="text" name="name" value={formData.name} onChange={handleChange} required={!isLogin}
                className="w-full border border-[#E8E4DE] rounded-xl p-3 bg-[#FAF9F6] focus:border-[#8B7BB5] outline-none transition-colors" 
                placeholder="e.g. Priya Sharma" 
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-[#29272D] mb-1">Email Address</label>
            <input 
              type="email" name="email" value={formData.email} onChange={handleChange} required
              className="w-full border border-[#E8E4DE] rounded-xl p-3 bg-[#FAF9F6] focus:border-[#8B7BB5] outline-none transition-colors" 
              placeholder="priya@example.com" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#29272D] mb-1">Password</label>
            <input 
              type="password" name="password" value={formData.password} onChange={handleChange} required
              className="w-full border border-[#E8E4DE] rounded-xl p-3 bg-[#FAF9F6] focus:border-[#8B7BB5] outline-none transition-colors" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-[#8B7BB5] text-white font-bold py-3.5 rounded-xl hover:bg-[#7A6AA4] transition-all mt-2"
          >
            {loading ? "Please wait..." : (isLogin ? "Log In" : "Create Account")}
          </button>
        </form>

        {/* Switch between Login and Signup */}
        <div className="mt-6 text-center text-sm text-[#7A7880]">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-[#8B7BB5] font-bold hover:underline"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </div>

      </div>
    </div>
  );
}