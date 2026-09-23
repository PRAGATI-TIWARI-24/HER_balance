import React from 'react';

export default function Dashboard({ user, onLogout, onNewAssessment }) {
  return (
    <div className="min-h-screen bg-vanilla p-4 md:p-8 animate-in fade-in duration-500">
      
      {/* ── Header Section ── */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10 mt-4">
        <div>
          <h1 className="text-3xl font-bold text-midnight font-display">
            Hello, <span className="text-rosewood">{user?.name || 'Beautiful'}</span> 🌸
          </h1>
          <p className="text-midnight/70 mt-1">Welcome to your personal health overview.</p>
        </div>
        <button 
          onClick={onLogout}
          className="border border-misty/50 text-midnight hover:border-rosewood hover:text-rosewood px-6 py-2.5 rounded-xl font-semibold transition-colors bg-white shadow-sm"
        >
          Log Out
        </button>
      </div>

      {/* ── Main Grid Layout ── */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Cycle Tracker Card */}
        <div className="bg-white p-6 rounded-3xl shadow-lg shadow-rosewood/5 border border-misty/30 hover:shadow-xl hover:shadow-rosewood/10 transition-shadow">
          <h2 className="text-lg font-bold text-midnight mb-4 flex items-center gap-2">
            🩸 Cycle Tracker
          </h2>
          <div className="bg-vanilla/40 rounded-2xl p-6 text-center border border-misty/30 mb-4">
            <p className="text-sm text-midnight/60 font-medium mb-1">Next period in</p>
            <p className="text-4xl font-extrabold text-rosewood">12 Days</p>
          </div>
          <div className="flex justify-between text-sm px-1">
            <span className="text-midnight/60">Average Cycle length:</span>
            <span className="font-semibold text-midnight">28 Days</span>
          </div>
        </div>

        {/* 2. AI Insights Card */}
        <div className="bg-white p-6 rounded-3xl shadow-lg shadow-rosewood/5 border border-misty/30 hover:shadow-xl hover:shadow-rosewood/10 transition-shadow">
          <h2 className="text-lg font-bold text-midnight mb-4 flex items-center gap-2">
            ✨ AI Health Status
          </h2>
          <div className="bg-sage/10 rounded-2xl p-5 border border-sage/30 mb-4">
            <p className="text-[10px] font-bold text-sage uppercase tracking-wider mb-1">Last Assessment Result</p>
            <p className="text-xl font-bold text-midnight">Low Risk (25%)</p>
            <p className="text-xs text-midnight/70 mt-1 leading-relaxed">Your patterns look typical. Keep maintaining a healthy lifestyle!</p>
          </div>
          <button 
            onClick={onNewAssessment}
            className="w-full bg-midnight text-white text-sm font-semibold py-3.5 rounded-xl hover:bg-midnight/90 transition-colors shadow-md shadow-midnight/20"
          >
            Take New Assessment
          </button>
        </div>

        {/* 3. Foods to Eat Card (Diet Plan) */}
        <div className="bg-white p-6 rounded-3xl shadow-lg shadow-rosewood/5 border border-misty/30 hover:shadow-xl hover:shadow-rosewood/10 transition-shadow md:row-span-2">
          <h2 className="text-lg font-bold text-midnight mb-2 flex items-center gap-2">
            🥗 Recommended Diet
          </h2>
          <p className="text-sm text-midnight/70 mb-5">Foods to balance your hormones naturally:</p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3.5 bg-vanilla/40 rounded-2xl border border-misty/30">
              <span className="text-2xl bg-white p-2 rounded-xl shadow-sm">🥑</span>
              <div>
                <p className="font-semibold text-midnight text-sm">Healthy Fats</p>
                <p className="text-xs text-midnight/60">Avocados, Walnuts, Chia seeds</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3.5 bg-vanilla/40 rounded-2xl border border-misty/30">
              <span className="text-2xl bg-white p-2 rounded-xl shadow-sm">🥦</span>
              <div>
                <p className="font-semibold text-midnight text-sm">Leafy Greens</p>
                <p className="text-xs text-midnight/60">Spinach, Kale, Broccoli</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3.5 bg-vanilla/40 rounded-2xl border border-misty/30">
              <span className="text-2xl bg-white p-2 rounded-xl shadow-sm">🐟</span>
              <div>
                <p className="font-semibold text-midnight text-sm">Omega-3 Rich</p>
                <p className="text-xs text-midnight/60">Salmon, Flaxseeds</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3.5 bg-rosewood/10 rounded-2xl border border-rosewood/20">
              <span className="text-2xl bg-white p-2 rounded-xl shadow-sm">🚫</span>
              <div>
                <p className="font-semibold text-rosewood text-sm">Foods to Avoid</p>
                <p className="text-xs text-rosewood/80">Refined sugar, Fast food, Dairy</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Quick Daily Logs */}
        <div className="bg-white p-6 rounded-3xl shadow-lg shadow-rosewood/5 border border-misty/30 hover:shadow-xl hover:shadow-rosewood/10 transition-shadow md:col-span-2">
          <h2 className="text-lg font-bold text-midnight mb-4 flex items-center gap-2">
            📝 Daily Quick Logs
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 bg-vanilla/40 border border-misty/30 rounded-2xl p-5 hover:border-rosewood hover:bg-vanilla/60 transition-all text-left group">
              <span className="text-3xl mb-3 block">💧</span>
              <p className="font-semibold text-midnight group-hover:text-rosewood">Log Water</p>
            </button>
            <button className="flex-1 bg-vanilla/40 border border-misty/30 rounded-2xl p-5 hover:border-rosewood hover:bg-vanilla/60 transition-all text-left group">
              <span className="text-3xl mb-3 block">🏃‍♀️</span>
              <p className="font-semibold text-midnight group-hover:text-rosewood">Log Exercise</p>
            </button>
            <button className="flex-1 bg-vanilla/40 border border-misty/30 rounded-2xl p-5 hover:border-rosewood hover:bg-vanilla/60 transition-all text-left group">
              <span className="text-3xl mb-3 block">😴</span>
              <p className="font-semibold text-midnight group-hover:text-rosewood">Log Sleep</p>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}