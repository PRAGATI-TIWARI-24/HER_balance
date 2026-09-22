import { Home, Droplet, LineChart, Bot, User } from 'lucide-react';

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center text-health-textMuted pb-safe">
      <button className="flex flex-col items-center text-health-primary">
        <Home size={24} />
        <span className="text-[10px] mt-1 font-medium">Home</span>
      </button>
      <button className="flex flex-col items-center hover:text-health-primary transition-colors">
        <Droplet size={24} />
        <span className="text-[10px] mt-1 font-medium">Cycle</span>
      </button>
      <button className="flex flex-col items-center hover:text-health-primary transition-colors">
        <LineChart size={24} />
        <span className="text-[10px] mt-1 font-medium">Progress</span>
      </button>
      <button className="flex flex-col items-center hover:text-health-primary transition-colors">
        <Bot size={24} />
        <span className="text-[10px] mt-1 font-medium">AI</span>
      </button>
      <button className="flex flex-col items-center hover:text-health-primary transition-colors">
        <User size={24} />
        <span className="text-[10px] mt-1 font-medium">Profile</span>
      </button>
    </div>
  );
}