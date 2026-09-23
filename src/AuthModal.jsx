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
    <div className="fixed inset-0 bg-midnight/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Pop-up Box */}
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-rosewood/10 relative animate-in fade-in zoom-in duration-200">
        
        {/* Close (X) Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-6 text-midnight/50 hover:text-midnight text-2xl font-bold transition-colors"
        >
          ✕
        </button>

        <h2 className="text-3xl font-bold text-midnight mb-2 font-display">
          {isLogin ? "Welcome Back! 🌸" : "Join HerBalance ✨"}
        </h2>
        <p className="text-midnight/70 mb-6">
          {isLogin ? "Log in to access your personalized dashboard." : "Create an account to start your health journey."}
        </p>

        {/* Error Message Dikhane ke liye */}
        {error && (
          <div className="bg-rosewood/10 text-rosewood p-3 rounded-xl text-sm mb-5 border border-rosewood/20 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Agar Signup hai toh Name wala box bhi dikhao */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-midnight mb-1">Full Name</label>
              <input 
                type="text" name="name" value={formData.name} onChange={handleChange} required={!isLogin}
                className="w-full border border-misty/50 rounded-xl p-3 bg-vanilla/40 focus:border-rosewood focus:ring-2 focus:ring-blush outline-none transition-all text-midnight" 
                placeholder="e.g. Priya Sharma" 
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-midnight mb-1">Email Address</label>
            <input 
              type="email" name="email" value={formData.email} onChange={handleChange} required
              className="w-full border border-misty/50 rounded-xl p-3 bg-vanilla/40 focus:border-rosewood focus:ring-2 focus:ring-blush outline-none transition-all text-midnight" 
              placeholder="priya@example.com" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-midnight mb-1">Password</label>
            <input 
              type="password" name="password" value={formData.password} onChange={handleChange} required
              className="w-full border border-misty/50 rounded-xl p-3 bg-vanilla/40 focus:border-rosewood focus:ring-2 focus:ring-blush outline-none transition-all text-midnight" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-rosewood text-white font-bold py-3.5 rounded-xl hover:bg-rosewood/90 shadow-lg shadow-rosewood/30 transition-all mt-2"
          >
            {loading ? "Please wait..." : (isLogin ? "Log In" : "Create Account")}
          </button>
        </form>

        {/* Switch between Login and Signup */}
        <div className="mt-6 text-center text-sm text-midnight/70">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-rosewood font-bold hover:underline transition-all"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </div>

      </div>
    </div>
  );
}