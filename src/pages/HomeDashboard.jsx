import { Droplet, CheckCircle2, Circle, AlertCircle, Utensils, Activity, Moon, Info } from 'lucide-react';

export default function HomeDashboard() {
  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto">
      
      {/* Greeting Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-health-textMain">Good Morning, Priya 🌸</h1>
        <p className="text-health-textMuted text-sm mt-1">Let's take care of your health today</p>
      </div>

      {/* 1. Cycle Card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -z-0 opacity-50"></div>
        <div className="flex items-center gap-2 mb-3 relative z-10">
          <Droplet className="text-health-accent" size={20} fill="currentColor" />
          <h2 className="font-semibold text-health-textMain uppercase tracking-wide text-sm">Your Cycle</h2>
        </div>
        <div className="mb-4">
          <p className="text-3xl font-bold text-health-accent">Day 18</p>
          <p className="text-health-textMuted text-sm mt-1">Next period: ~12 days • Cycle: 38 days</p>
        </div>
        <div className="bg-amber-50 text-amber-800 p-3 rounded-xl text-sm flex items-start gap-2">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p>Your cycles have been irregular recently.</p>
        </div>
      </div>

      {/* 2. Today's Goals */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-5">
        <h2 className="font-semibold text-health-textMain uppercase tracking-wide text-sm mb-4">✨ Today's Goals</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-health-success shrink-0" size={22} />
            <span className="text-health-textMain text-sm line-through opacity-70">25 min walk</span>
          </div>
          <div className="flex items-center gap-3">
            <Circle className="text-slate-300 shrink-0" size={22} />
            <span className="text-health-textMain text-sm">Protein-rich breakfast</span>
          </div>
          <div className="flex items-center gap-3">
            <Circle className="text-slate-300 shrink-0" size={22} />
            <span className="text-health-textMain text-sm">7+ hours sleep</span>
          </div>
        </div>
      </div>

      {/* 3. Health Overview */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-5">
        <h2 className="font-semibold text-health-textMain uppercase tracking-wide text-sm mb-4">📊 Your Health</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
            <span className="text-sm font-medium text-health-textMuted">Cycle</span>
            <div className="w-3 h-3 rounded-full bg-health-warning"></div>
          </div>
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
            <span className="text-sm font-medium text-health-textMuted">Activity</span>
            <div className="w-3 h-3 rounded-full bg-health-success"></div>
          </div>
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
            <span className="text-sm font-medium text-health-textMuted">Sleep</span>
            <div className="w-3 h-3 rounded-full bg-health-warning"></div>
          </div>
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
            <span className="text-sm font-medium text-health-textMuted">Symptoms</span>
            <div className="w-3 h-3 rounded-full bg-health-success"></div>
          </div>
        </div>
      </div>

      {/* 4. Insight Alert */}
      <div className="bg-slate-800 text-white rounded-3xl p-5 shadow-sm mb-5">
        <div className="flex items-start gap-3">
          <Info className="text-blue-300 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-semibold text-sm mb-1 uppercase tracking-wide text-blue-200">Today's Insight</h3>
            <p className="text-sm leading-relaxed opacity-90">
              You've logged irregular cycles for 3 consecutive months. Consider generating a Health Report to discuss this pattern with a doctor.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Quick Actions */}
      <h2 className="font-semibold text-health-textMain uppercase tracking-wide text-sm mb-3 px-1">Quick Actions</h2>
      <div className="grid grid-cols-4 gap-3">
        <button className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 text-health-textMuted hover:border-health-primary transition-colors">
          <Droplet size={20} />
          <span className="text-[10px] font-medium">Period</span>
        </button>
        <button className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 text-health-textMuted hover:border-health-primary transition-colors">
          <Activity size={20} />
          <span className="text-[10px] font-medium">Symptoms</span>
        </button>
        <button className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 text-health-textMuted hover:border-health-primary transition-colors">
          <Utensils size={20} />
          <span className="text-[10px] font-medium">Food</span>
        </button>
        <button className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 text-health-textMuted hover:border-health-primary transition-colors">
          <Moon size={20} />
          <span className="text-[10px] font-medium">Sleep</span>
        </button>
      </div>
      
    </div>
  );
}