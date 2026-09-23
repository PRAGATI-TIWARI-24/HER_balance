import React from 'react';

export default function Dashboard({ user, onLogout, onNewAssessment }) {
  return (
    <div className="min-h-screen bg-[#FAF9F6] p-4 md:p-8 animate-in fade-in duration-500">
      
      {/* ── Header Section ── */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10 mt-4">
        <div>
          <h1 className="text-3xl font-bold text-[#29272D] font-display">
            Hello, <span className="text-[#8B7BB5]">{user?.name || 'Beautiful'}</span> 🌸
          </h1>
          <p className="text-[#7A7880] mt-1">Welcome to your personal health overview.</p>
        </div>
        <button 
          onClick={onLogout}
          className="border border-[#E8E4DE] text-[#29272D] hover:border-[#8B7BB5] hover:text-[#8B7BB5] px-6 py-2.5 rounded-xl font-semibold transition-colors bg-white shadow-sm"
        >
          Log Out
        </button>
      </div>

      {/* ── Main Grid Layout ── */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Cycle Tracker Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E8E4DE] hover:shadow-md transition-shadow">
          <h2 className="text-lg font-bold text-[#29272D] mb-4 flex items-center gap-2">
            🩸 Cycle Tracker
          </h2>
          <div className="bg-[#FAF9F6] rounded-2xl p-6 text-center border border-[#E8E4DE] mb-4">
            <p className="text-sm text-[#7A7880] font-medium mb-1">Next period in</p>
            <p className="text-4xl font-extrabold text-[#8B7BB5]">12 Days</p>
          </div>
          <div className="flex justify-between text-sm px-1">
            <span className="text-[#7A7880]">Average Cycle length:</span>
            <span className="font-semibold text-[#29272D]">28 Days</span>
          </div>
        </div>

        {/* 2. AI Insights Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E8E4DE] hover:shadow-md transition-shadow">
          <h2 className="text-lg font-bold text-[#29272D] mb-4 flex items-center gap-2">
            ✨ AI Health Status
          </h2>
          <div className="bg-[#EAE6F4] rounded-2xl p-5 border border-[#D5CDE8] mb-4">
            <p className="text-[10px] font-bold text-[#8B7BB5] uppercase tracking-wider mb-1">Last Assessment Result</p>
            <p className="text-xl font-bold text-[#29272D]">Low Risk (25%)</p>
            <p className="text-xs text-[#7A7880] mt-1 leading-relaxed">Your patterns look typical. Keep maintaining a healthy lifestyle!</p>
          </div>
          <button 
            onClick={onNewAssessment}
            className="w-full bg-[#29272D] text-white text-sm font-semibold py-3.5 rounded-xl hover:bg-black transition-colors"
          >
            Take New Assessment
          </button>
        </div>

        {/* 3. Foods to Eat Card (Diet Plan) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E8E4DE] hover:shadow-md transition-shadow md:row-span-2">
          <h2 className="text-lg font-bold text-[#29272D] mb-2 flex items-center gap-2">
            🥗 Recommended Diet
          </h2>
          <p className="text-sm text-[#7A7880] mb-5">Foods to balance your hormones naturally:</p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3.5 bg-[#FAF9F6] rounded-2xl border border-[#E8E4DE]">
              <span className="text-2xl bg-white p-2 rounded-xl shadow-sm">🥑</span>
              <div>
                <p className="font-semibold text-[#29272D] text-sm">Healthy Fats</p>
                <p className="text-xs text-[#7A7880]">Avocados, Walnuts, Chia seeds</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3.5 bg-[#FAF9F6] rounded-2xl border border-[#E8E4DE]">
              <span className="text-2xl bg-white p-2 rounded-xl shadow-sm">🥦</span>
              <div>
                <p className="font-semibold text-[#29272D] text-sm">Leafy Greens</p>
                <p className="text-xs text-[#7A7880]">Spinach, Kale, Broccoli</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3.5 bg-[#FAF9F6] rounded-2xl border border-[#E8E4DE]">
              <span className="text-2xl bg-white p-2 rounded-xl shadow-sm">🐟</span>
              <div>
                <p className="font-semibold text-[#29272D] text-sm">Omega-3 Rich</p>
                <p className="text-xs text-[#7A7880]">Salmon, Flaxseeds</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3.5 bg-[#FFF5F5] rounded-2xl border border-[#FFE1E1]">
              <span className="text-2xl bg-white p-2 rounded-xl shadow-sm">🚫</span>
              <div>
                <p className="font-semibold text-red-600 text-sm">Foods to Avoid</p>
                <p className="text-xs text-red-500">Refined sugar, Fast food, Dairy</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Quick Daily Logs */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E8E4DE] hover:shadow-md transition-shadow md:col-span-2">
          <h2 className="text-lg font-bold text-[#29272D] mb-4 flex items-center gap-2">
            📝 Daily Quick Logs
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 bg-[#FAF9F6] border border-[#E8E4DE] rounded-2xl p-5 hover:border-[#8B7BB5] hover:bg-white transition-all text-left group">
              <span className="text-3xl mb-3 block">💧</span>
              <p className="font-semibold text-[#29272D] group-hover:text-[#8B7BB5]">Log Water</p>
            </button>
            <button className="flex-1 bg-[#FAF9F6] border border-[#E8E4DE] rounded-2xl p-5 hover:border-[#8B7BB5] hover:bg-white transition-all text-left group">
              <span className="text-3xl mb-3 block">🏃‍♀️</span>
              <p className="font-semibold text-[#29272D] group-hover:text-[#8B7BB5]">Log Exercise</p>
            </button>
            <button className="flex-1 bg-[#FAF9F6] border border-[#E8E4DE] rounded-2xl p-5 hover:border-[#8B7BB5] hover:bg-white transition-all text-left group">
              <span className="text-3xl mb-3 block">😴</span>
              <p className="font-semibold text-[#29272D] group-hover:text-[#8B7BB5]">Log Sleep</p>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}