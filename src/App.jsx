
import Assessment from "./Test";
import { useState } from 'react';
import AuthModal from './AuthModal';
import Dashboard from './Dashboard';
import {useRef, useEffect } from 'react';

// ─── Icons ───────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={path} />
  </svg>
)

const icons = 
{

  menu: "M3 12h18M3 6h18M3 18h18",
  x: "M18 6L6 18M6 6l12 12",
  cycle: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 4v4l3 3",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  moon: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  leaf: "M2 22C4 20 7 18 10 18c4 0 6-2 8-4s4-6 4-8c-2 0-6 2-8 4s-4 4-8 4c-3 0-6 2-6 2z",
  brain: "M9.5 2A2.5 2.5 0 017 4.5v1A2.5 2.5 0 014.5 8H4a2 2 0 000 4h.5A2.5 2.5 0 017 14.5v1A2.5 2.5 0 019.5 18h5a2.5 2.5 0 002.5-2.5v-1a2.5 2.5 0 012.5-2.5h.5a2 2 0 000-4h-.5A2.5 2.5 0 0117 5.5v-1A2.5 2.5 0 0114.5 2h-5z",
  chart: "M18 20V10M12 20V4M6 20v-6",
  lock: "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  check: "M20 6L9 17l-5-5",
  chevronDown: "M6 9l6 6 6-6",
  arrow: "M5 12h14M12 5l7 7-7 7",
  sparkle: "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z",
  india: "M12 2a10 10 0 100 20A10 10 0 0012 2z",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z",
  doc: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z M14 2v6h6 M16 13H8M16 17H8M10 9H8",
  msg: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  heart: "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
  info: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4M12 16h.01",
}

// ─── Progress Ring ────────────────────────────────────────────────────────────
function ProgressRing({ pct, color, size = 56, label }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const dash = circ * (pct / 100)
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F0EDE8" strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="text-xs font-medium text-[#7A7880]">{label}</span>
    </div>
  )
}

// ─── Dashboard Mockup ─────────────────────────────────────────────────────────
function DashboardMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-br from-[#8B7BB5]/10 via-[#A8BFA3]/10 to-[#D99AA5]/10 blur-2xl" />
      <div className="relative bg-white rounded-[28px] shadow-[0_24px_80px_rgba(139,123,181,0.18)] border border-[#E8E4DE] overflow-hidden w-full max-w-[420px] mx-auto">
        {/* Header bar */}
        <div className="bg-gradient-to-r from-[#8B7BB5] to-[#A89FCC] px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs font-medium">Good morning</p>
            <p className="text-white font-semibold text-sm">User 🌸</p>
          </div>
          <div className="bg-white/20 rounded-full px-3 py-1">
            <span className="text-white text-xs font-medium">Day --</span>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Cycle card */}
          <div className="bg-gradient-to-br from-[#F7F4FB] to-[#FAF9F6] rounded-2xl p-4 border border-[#EAE6F4]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#7A7880] text-xs font-medium mb-1">Cycle Overview</p>
                <p className="text-[#29272D] font-bold text-2xl">Day 18</p>
                <p className="text-[#7A7880] text-xs mt-0.5">Avg. cycle: 38 days</p>
              </div>
              <div className="flex gap-3">
                <ProgressRing pct={47} color="#8B7BB5" size={52} label="Cycle" />
                <ProgressRing pct={72} color="#A8BFA3" size={52} label="Activity" />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              {['Flow', 'Fertile', 'Luteal', 'Pre-period'].map((phase, i) => (
                <div key={phase} className={`flex-1 h-1.5 rounded-full ${i === 2 ? 'bg-[#8B7BB5]' : i < 2 ? 'bg-[#8B7BB5]/30' : 'bg-[#E8E4DE]'}`} />
              ))}
            </div>
            <p className="text-[#8B7BB5] text-xs font-medium mt-1.5">Next period est. ~20 days</p>
          </div>

          {/* Today's goals */}
          <div className="bg-white rounded-2xl p-4 border border-[#E8E4DE]">
            <p className="text-[#29272D] font-semibold text-sm mb-2.5">Today's Goals</p>
            <div className="space-y-2">
              {[
                { label: '25 min walk', done: true, color: '#A8BFA3' },
                { label: 'Protein-rich breakfast', done: true, color: '#A8BFA3' },
                { label: '7+ hours sleep', done: false, color: '#8B7BB5' },
              ].map(g => (
                <div key={g.label} className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${g.done ? 'border-[#A8BFA3] bg-[#A8BFA3]' : 'border-[#D5CFEA]'}`}>
                    {g.done && <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>}
                  </div>
                  <span className={`text-xs ${g.done ? 'text-[#7A7880] line-through' : 'text-[#29272D] font-medium'}`}>{g.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Health stats row */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Sleep', val: '6.5h', sub: 'Low', color: '#D99AA5' },
              { label: 'Steps', val: '4.2k', sub: 'Good', color: '#A8BFA3' },
              { label: 'Water', val: '1.8L', sub: 'OK', color: '#8B7BB5' },
              { label: 'Mood', val: '😊', sub: 'Good', color: '#A8BFA3' },
            ].map(s => (
              <div key={s.label} className="bg-[#FAF9F6] rounded-xl p-2.5 border border-[#E8E4DE] text-center">
                <p className="text-[#29272D] font-bold text-sm">{s.val}</p>
                <p className="text-[#7A7880] text-[10px] mt-0.5">{s.label}</p>
                <p className="text-[10px] font-medium mt-0.5" style={{ color: s.color }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Insight */}
          <div className="bg-gradient-to-r from-[#EAE6F4] to-[#F4EEF0] rounded-2xl p-3.5 border border-[#DDD7EF]">
            <div className="flex gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#8B7BB5] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon path={icons.sparkle} size={12} className="text-white" />
              </div>
              <p className="text-[#29272D] text-xs leading-relaxed">Your recent cycles have been longer than your previous average. Keep tracking and consider discussing this with your doctor.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
const handleComingSoon = () => {
  alert("✨ We are building this! Dashboard & Login features will be available soon. 🌸");
};
// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ onNavigate, onContactClick, onLoginClick }) {
  const [open, setOpen] = useState(false)
  const links = ['How It Works', 'Features', 'Why HerBalance', 'FAQ']

  return (
    <nav className="border-b border-[#E8E4DE] bg-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <div className="text-xl font-bold text-[#29272D] tracking-tight font-display">HerBalance</div>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm font-medium text-[#7A7880] hover:text-[#29272D] transition-colors">
              {link}
            </a>
          ))}
        </div>
        
        <div className="hidden md:flex items-center gap-3">
          {/* 🟢 NAYA: Log In button par onLoginClick laga diya */}
          <button onClick={onLoginClick} className="text-sm font-medium text-[#7A7880] hover:text-[#29272D] transition-colors px-3 py-1.5">
            Log In
          </button>
          <button onClick={() => onNavigate('assessment')} className="text-sm font-semibold bg-[#29272D] text-white px-5 py-2.5 rounded-xl hover:bg-[#1A181D] transition-all">
            Take Assessment
          </button>
        </div>

        <div className="flex items-center space-x-6"> {/* space-x-6 dono ke beech mein gap banayega */}
  
  {/* Contact Us Link */}
  <a 
    href="https://www.linkedin.com/in/pragati-tiwari-sde24/" 
    target="_blank" 
    rel="noopener noreferrer"
    className="text-gray-600 hover:text-pink-600 font-semibold transition-colors duration-300"
  >
    Contact Us
  </a>

  
</div>
      </div>
    </nav>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState(null)
  const faqs = [
    { q: "What is this platform for?", a: "HerBalance is a personal health companion to help you track your cycle, symptoms, and lifestyle patterns related to PCOD. It helps you understand your body better and prepare for more informed conversations with your healthcare provider." },
    { q: "Can this app diagnose PCOD/PCOS?", a: "No. HerBalance is not a diagnostic tool and cannot detect, diagnose, cure, or prevent PCOD/PCOS or any other medical condition. It is designed for personal tracking and self-management support only." },
    { q: "Who can use it?", a: "Anyone who wants to track and understand their menstrual health, symptoms, and lifestyle patterns — whether or not they have a PCOD diagnosis." },
    { q: "Can I use it if I already have a diagnosis?", a: "Absolutely. HerBalance is especially useful if you have been diagnosed, as it helps you monitor patterns over time and prepare useful summaries for your doctor visits." },
    { q: "Does it replace a doctor?", a: "No. HerBalance is a complementary tool, not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical concerns." },
    { q: "How is my health data handled?", a: "Your health data is stored securely with privacy as a core design principle. We collect only what is necessary, give you full control over your information, and do not sell your data to third parties." },
    { q: "Can I track Indian foods?", a: "Yes. Our nutrition guidance is built around realistic Indian food choices — including vegetarian, eggetarian, and regional options — so recommendations actually fit your lifestyle." },
  ]

  return (
    <section id="faq" className="py-24 px-5 max-w-3xl mx-auto">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold text-[#29272D] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Frequently asked questions</h2>
        <p className="text-[#7A7880] text-lg">Everything you need to know about HerBalance.</p>
      </div>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E8E4DE] overflow-hidden">
            <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setOpen(open === i ? null : i)}>
              <span className="font-semibold text-[#29272D] text-sm pr-4">{f.q}</span>
              <div className={`flex-shrink-0 w-6 h-6 rounded-full border border-[#E8E4DE] flex items-center justify-center transition-transform ${open === i ? 'rotate-180' : ''}`}>
                <Icon path={icons.chevronDown} size={14} className="text-[#7A7880]" />
              </div>
            </button>
            {open === i && (
              <div className="px-5 pb-5">
                <p className="text-[#7A7880] text-sm leading-relaxed">{f.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
// ─── Asli AI Chat Component ──────────────────────────────────────────────────
function AICompanionChat({ icons }) {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hi! I'm HerBalance AI. How are you feeling today? Share your symptoms, or ask me anything about PCOD/PCOS. 🌸" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Naya message aane par auto-scroll karne ke liye
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    // User ka message screen par turant dikhao
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput("");
    setIsLoading(true); // Loading animation chalu (Bouncing dots)

    try {
      const response = await fetch("https://her-balance.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText })
      });

      if (!response.ok) throw new Error("Server error");
      
      // Streaming data padhne ke liye setup
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break; // Jab AI chup ho jaye toh ruk jao
        
        // Chunk (hissa) ko text mein convert karo
        const chunk = decoder.decode(value, { stream: true });
        
        if (isFirstChunk) {
          // Jaise hi pehla word aaye, dots hatao aur chat bubble create karo
          setIsLoading(false);
          setMessages(prev => [...prev, { sender: 'ai', text: chunk }]);
          isFirstChunk = false;
        } else {
          // Uske baad wale har word ko pichle bubble mein jodte jao (Typing effect)
          setMessages(prev => {
            const newMessages = [...prev];
            const lastIndex = newMessages.length - 1;
            newMessages[lastIndex] = {
              ...newMessages[lastIndex],
              text: newMessages[lastIndex].text + chunk
            };
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { sender: 'ai', text: "Oops! AI backend is unreachable right now." }]);
      setIsLoading(false);
    }
  };
  return (
    <div className="bg-white rounded-2xl border border-[#E8E4DE] shadow-[0_8px_40px_rgba(139,123,181,0.10)] overflow-hidden flex flex-col h-[450px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#8B7BB5] to-[#A89FCC] px-5 py-4 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <Icon path={icons.sparkle} size={16} className="text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">HerBalance AI</p>
          <p className="text-white/70 text-xs">Health companion · Not a doctor</p>
        </div>
        <div className="ml-auto w-2 h-2 bg-green-300 rounded-full animate-pulse" />
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#FAF9F6]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start gap-3'}`}>
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-[#EAE6F4] flex items-center justify-center flex-shrink-0 mt-1">
                <Icon path={icons.sparkle} size={13} className="text-[#8B7BB5]" />
              </div>
            )}
            <div className={`text-sm rounded-2xl px-4 py-3 max-w-[85%] leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-[#8B7BB5] text-white rounded-tr-sm' 
                : 'bg-white border border-[#E8E4DE] text-[#29272D] rounded-tl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {/* Loading Spinner / Typing indicator */}
        {isLoading && (
          <div className="flex justify-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#EAE6F4] flex items-center justify-center flex-shrink-0 mt-1">
              <Icon path={icons.sparkle} size={13} className="text-[#8B7BB5]" />
            </div>
            <div className="bg-white border border-[#E8E4DE] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#8B7BB5]/50 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-[#8B7BB5]/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-[#8B7BB5]/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-[#E8E4DE] flex gap-2 shrink-0">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about symptoms, diet, or habits..." 
          className="flex-1 bg-[#FAF9F6] border border-[#E8E4DE] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#8B7BB5] text-[#29272D]"
        />
        <button 
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-[#8B7BB5] text-white px-5 py-3 rounded-xl hover:bg-[#7A6AA4] transition-colors disabled:opacity-50 font-semibold"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App({ onNavigate }) {
  const [showContact, setShowContact] = useState(false);
  const [currentPage, setCurrentPage] = useState('landing');
  
  // 🟢 NAYA: Modal (Popup) aur User ki detail yaad rakhne ke liye
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);

  // 🟢 NAYA: Jab Login successful ho jaye
  const handleLoginSuccess = (userId, userName) => {
    setUser({ id: userId, name: userName }); // User ka naam save kar liya
    setShowAuthModal(false); // Pop-up band kar diya
    setCurrentPage('dashboard'); // Dashboard page par bhej diya
  };

  // 🟢 NAYA: Dashboard Page View (Login ke baad ye dikhega)
  // 🟢 NAYA: Asli Premium Dashboard
  if (currentPage === 'dashboard') {
    return (
      <Dashboard 
        user={user} 
        onLogout={() => { 
          setUser(null); 
          setCurrentPage('landing'); 
        }} 
        onNewAssessment={() => setCurrentPage('assessment')}
      />
    );
  }
  // Assessment Form Page
  if(currentPage === 'assessment') {
    return <Assessment onback={() => setCurrentPage('landing')} />;
  }
  
  const handleStartJourney = () => setCurrentPage('assessment');

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* 🟢 NAYA: Navbar ko Login modal open karne ki permission de di */}
      <Navbar 
        onNavigate={onNavigate} 
        onContactClick={() => setShowContact(true)} 
        onLoginClick={() => setShowAuthModal(true)} 
      />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#EAE6F4] text-[#8B7BB5] text-xs font-semibold px-4 py-2 rounded-full">
              <Icon path={icons.sparkle} size={13} />
              Your health. Your patterns. Your journey.
            </div>
            <h1 className="text-4xl md:text-[52px] font-extrabold text-[#29272D] leading-[1.15] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Understand your body.<br />
              <span className="text-[#8B7BB5]">Take control</span> of your PCOD journey.
            </h1>
            <p className="text-[#7A7880] text-lg leading-relaxed max-w-md">
              Track your cycle, symptoms, and lifestyle — discover meaningful patterns and turn everyday health goals into simple, sustainable actions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleStartJourney} className="flex items-center justify-center gap-2 bg-[#8B7BB5] text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-[#7A6AA4] transition-all hover:shadow-[0_8px_24px_rgba(139,123,181,0.35)] active:scale-[0.98]">
                🌸 Start Your PCOD Journey
              </button>
              <button 
                onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })} 
                className="flex items-center justify-center gap-2 text-[#29272D] font-semibold px-6 py-3.5 rounded-xl border border-[#E8E4DE] hover:border-[#8B7BB5] hover:text-[#8B7BB5] transition-colors bg-white">
                See How It Works <Icon path={icons.chevronDown} size={16} />
              </button>         
            </div>
            <p className="text-xs text-[#7A7880] flex items-center gap-1.5">
              <Icon path={icons.info} size={13} />
              Built for informed self-management — not diagnosis.
            </p>
          </div>

          {/* Right */}
          <div className="flex justify-center md:justify-end">
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ── Trust Strip ────────────────────────────────────────────────────── */}
      <section className="border-y border-[#E8E4DE] bg-white py-8 px-5">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-semibold text-[#7A7880] uppercase tracking-widest mb-6">Designed around the things that matter every day</p>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { icon: '🩸', label: 'Cycle Tracking' },
              { icon: '🥗', label: 'Nutrition' },
              { icon: '🏃', label: 'Activity' },
              { icon: '😴', label: 'Sleep' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2.5">
                <span className="text-xl">{item.icon}</span>
                <span className="font-semibold text-[#29272D] text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-5 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-[#29272D] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            PCOD isn't just about your period.
          </h2>
          <p className="text-[#7A7880] text-lg max-w-xl mx-auto leading-relaxed">
            Understanding recurring patterns can be difficult when symptoms, lifestyle, and health information are scattered across different places.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { num: '01', title: 'Missed Patterns', body: 'Changes in cycles and symptoms can be difficult to notice over time without a consistent way to log and review them.' },
            { num: '02', title: 'Too Much Information', body: "Generic health advice doesn't always fit your lifestyle, food habits, or daily routine in the Indian context." },
            { num: '03', title: 'Hard to Stay Consistent', body: 'Knowing what to do is easier than turning it into sustainable daily habits that actually stick over weeks and months.' },
          ].map(c => (
            <div key={c.num} className="bg-white rounded-2xl border border-[#E8E4DE] p-7 hover:border-[#8B7BB5]/30 hover:shadow-[0_8px_32px_rgba(139,123,181,0.08)] transition-all">
              <span className="text-4xl font-extrabold text-[#F0EDE8]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{c.num}</span>
              <h3 className="font-bold text-[#29272D] text-lg mt-2 mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{c.title}</h3>
              <p className="text-[#7A7880] text-sm leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Solution / Timeline ─────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-5 bg-white border-y border-[#E8E4DE]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#29272D] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              One place to understand your health journey.
            </h2>
          </div>
          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-[#8B7BB5] via-[#A8BFA3] to-[#D99AA5]" />
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: 'Track', desc: 'Log your cycle, symptoms, sleep, activity and lifestyle.', color: '#8B7BB5', bg: '#EAE6F4' },
                { step: 'Understand', desc: 'See trends and recurring patterns in your personal data.', color: '#9BADC4', bg: '#E8EFF5' },
                { step: 'Act', desc: 'Receive personalized lifestyle suggestions and daily goals.', color: '#A8BFA3', bg: '#E8F0E7' },
                { step: 'Monitor', desc: 'Follow progress and prepare useful summaries for healthcare conversations.', color: '#D99AA5', bg: '#F5E8EB' },
              ].map((item, i) => (
                <div key={item.step} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-lg mb-5 relative z-10" style={{ backgroundColor: item.bg, color: item.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {i + 1}
                  </div>
                  <h3 className="font-bold text-[#29272D] text-lg mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.step}</h3>
                  <p className="text-[#7A7880] text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-5 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-[#29272D] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Everything you need, in one place.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: '🩸', title: 'Smart Cycle Tracking', desc: 'Track periods, cycle length and changes over time to understand your unique rhythm.' },
            { icon: '🌸', title: 'Symptom Journal', desc: 'Record symptoms such as acne, hair fall, fatigue and more in a structured, searchable log.' },
            { icon: '🥗', title: 'Personalized Nutrition', desc: 'Discover practical Indian food choices — vegetarian, eggetarian, and regional options — that fit your lifestyle.' },
            { icon: '🏃', title: 'Lifestyle Goals', desc: 'Build manageable habits around movement, sleep and daily wellbeing at your own pace.' },
            { icon: '📊', title: 'Health Insights', desc: 'Understand trends in your own data without turning them into a medical diagnosis.' },
            { icon: '🤖', title: 'AI Health Companion', desc: 'Ask questions, understand your logs and get guidance designed to support informed, not alarming, decisions.' },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-2xl border border-[#E8E4DE] p-6 hover:border-[#8B7BB5]/30 hover:shadow-[0_8px_32px_rgba(139,123,181,0.09)] transition-all group">
              <span className="text-2xl mb-4 block">{f.icon}</span>
              <h3 className="font-bold text-[#29272D] text-base mb-2 group-hover:text-[#8B7BB5] transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{f.title}</h3>
              <p className="text-[#7A7880] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Product Preview ──────────────────────────────────────────────────── */}
      <section className="py-24 px-5 bg-gradient-to-b from-[#F7F4FB] to-[#FAF9F6] border-y border-[#E8E4DE]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#29272D] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Your health journey, at a glance.
            </h2>
            <p className="text-[#7A7880] text-lg max-w-md mx-auto">A clear picture of your health patterns — all in one thoughtfully designed dashboard.</p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E8E4DE] shadow-[0_32px_96px_rgba(139,123,181,0.12)] overflow-hidden max-w-4xl mx-auto">
            {/* Browser chrome */}
            <div className="bg-[#F7F4FB] border-b border-[#E8E4DE] px-5 py-3.5 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#D99AA5]" />
                <div className="w-3 h-3 rounded-full bg-[#C9C5E0]" />
                <div className="w-3 h-3 rounded-full bg-[#A8BFA3]" />
              </div>
              <div className="flex-1 bg-white rounded-lg px-4 py-1.5 text-xs text-[#7A7880] font-medium border border-[#E8E4DE]">app.herbalance.in/dashboard</div>
            </div>

            <div className="p-6 md:p-8">
              {/* Greeting */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-[#29272D]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Good morning 🌸</h3>
                  <p className="text-[#7A7880] text-sm mt-0.5">Sunday, 20 September 2026</p>
                </div>
                <div className="bg-[#EAE6F4] rounded-xl px-4 py-2 text-right">
                  <p className="text-xs text-[#8B7BB5] font-medium">Cycle Day</p>
                  <p className="text-2xl font-extrabold text-[#8B7BB5]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>18</p>
                  <p className="text-xs text-[#7A7880]">Avg: 38 days</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                {/* Goals */}
                <div className="bg-[#FAF9F6] rounded-2xl border border-[#E8E4DE] p-5">
                  <p className="font-semibold text-[#29272D] text-sm mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Today's Goals</p>
                  <div className="space-y-3">
                    {[
                      { t: '25 min walk', done: true },
                      { t: 'Protein-rich breakfast', done: true },
                      { t: '7+ hours sleep', done: false },
                      { t: 'Evening meditation', done: false },
                    ].map(g => (
                      <div key={g.t} className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center border-2 ${g.done ? 'bg-[#A8BFA3] border-[#A8BFA3]' : 'border-[#D5CFEA]'}`}>
                          {g.done && <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>}
                        </div>
                        <span className={`text-xs ${g.done ? 'text-[#7A7880] line-through' : 'text-[#29272D]'}`}>{g.t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Health overview */}
                <div className="bg-[#FAF9F6] rounded-2xl border border-[#E8E4DE] p-5">
                  <p className="font-semibold text-[#29272D] text-sm mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Health Overview</p>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Cycle', status: 'Needs attention', color: '#D99AA5', bar: 40 },
                      { label: 'Activity', status: 'On track', color: '#A8BFA3', bar: 72 },
                      { label: 'Sleep', status: 'Improving', color: '#8B7BB5', bar: 58 },
                      { label: 'Symptoms', status: 'Stable', color: '#A8BFA3', bar: 80 },
                    ].map(h => (
                      <div key={h.label}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-[#29272D]">{h.label}</span>
                          <span className="text-xs" style={{ color: h.color }}>{h.status}</span>
                        </div>
                        <div className="h-1.5 bg-[#E8E4DE] rounded-full">
                          <div className="h-1.5 rounded-full transition-all" style={{ width: `${h.bar}%`, backgroundColor: h.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insight */}
                <div className="flex flex-col gap-4">
                  <div className="bg-gradient-to-br from-[#EAE6F4] to-[#F4EEF0] rounded-2xl border border-[#DDD7EF] p-5 flex-1">
                    <div className="flex gap-2 mb-2.5">
                      <div className="w-6 h-6 rounded-lg bg-[#8B7BB5] flex items-center justify-center flex-shrink-0">
                        <Icon path={icons.sparkle} size={12} className="text-white" />
                      </div>
                      <p className="text-xs font-semibold text-[#8B7BB5]">Personalized Insight</p>
                    </div>
                    <p className="text-xs text-[#29272D] leading-relaxed">Your recent cycles have been longer than your previous average. Keep tracking this pattern and consider discussing persistent changes with a healthcare professional.</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-[#E8E4DE] p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#E8F0E7] flex items-center justify-center flex-shrink-0">
                      <Icon path={icons.doc} size={16} className="text-[#A8BFA3]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#29272D]">Doctor Report</p>
                      <p className="text-xs text-[#7A7880]">Ready to generate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────────── */}
      <section className="py-24 px-5 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-[#29272D] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Start in minutes.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[
            { n: '01', title: 'Tell us about yourself', desc: 'Answer a few questions about your cycle, lifestyle and health goals. Takes about 3 minutes.' },
            { n: '02', title: 'Track what matters', desc: 'Log your symptoms, habits, cycle and daily wellbeing at your own pace — every day or as needed.' },
            { n: '03', title: 'Understand your patterns', desc: 'Get personalized insights and simple actions based on your logged information over time.' },
          ].map(s => (
            <div key={s.n} className="relative">
              <div className="text-6xl font-extrabold text-[#F0EDE8] mb-4 select-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.n}</div>
              <h3 className="font-bold text-[#29272D] text-lg mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.title}</h3>
              <p className="text-[#7A7880] text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <button onClick={onNavigate} className="inline-flex items-center gap-2 bg-[#8B7BB5] text-white font-semibold px-8 py-4 rounded-xl hover:bg-[#7A6AA4] transition-all hover:shadow-[0_8px_32px_rgba(139,123,181,0.35)] text-base">
            🌸 Start Your PCOD Journey <Icon path={icons.arrow} size={18} />
          </button>
        </div>
      </section>

      {/* ── India First ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-5 bg-white border-y border-[#E8E4DE]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#E8F0E7] text-[#6A9F65] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                🇮🇳 Made for India
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#29272D] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Built for real life in India.
              </h2>
              <p className="text-[#7A7880] text-lg leading-relaxed mb-8">
                Health guidance should fit your life — not force your life to fit a generic plan.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: '🥗', label: 'Indian Food Choices' },
                  { icon: '🥚', label: 'Veg & Eggetarian' },
                  { icon: '🎓', label: 'College & Working Life' },
                  { icon: '💰', label: 'Practical & Affordable' },
                  { icon: '🌐', label: 'Hindi + English' },
                  { icon: '📱', label: 'Mobile-First' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF9F6] border border-[#E8E4DE]">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-medium text-[#29272D]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-[#FAF9F6] rounded-2xl border border-[#E8E4DE] p-6">
                <p className="text-xs font-semibold text-[#7A7880] uppercase tracking-widest mb-3">Sample Meal Suggestion</p>
                <div className="space-y-3">
                  {[
                    { time: 'Breakfast', meal: 'Moong dal chilla + curd + methi tea', note: 'High protein, anti-inflammatory' },
                    { time: 'Lunch', meal: 'Brown rice + rajma + sabzi + raita', note: 'Balanced macros, fiber-rich' },
                    { time: 'Snack', meal: 'Handful of seeds mix + buttermilk', note: 'Good fats + probiotics' },
                  ].map(m => (
                    <div key={m.time} className="flex gap-4 items-start">
                      <span className="text-xs font-semibold text-[#8B7BB5] w-16 flex-shrink-0 mt-0.5">{m.time}</span>
                      <div>
                        <p className="text-sm font-medium text-[#29272D]">{m.meal}</p>
                        <p className="text-xs text-[#7A7880]">{m.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI Section ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-5 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#29272D] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Ask. Understand.<br />Take the next step.
            </h2>
            <p className="text-[#7A7880] text-lg leading-relaxed mb-6">
              Your AI health companion helps you make sense of your logs, find patterns, and know the right questions to ask your doctor.
            </p>
            <div className="flex items-start gap-3 p-4 bg-[#EAE6F4] rounded-2xl border border-[#DDD7EF]">
              <Icon path={icons.info} size={16} className="text-[#8B7BB5] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#29272D] leading-relaxed">The AI companion provides information and support only. It is not a diagnostic tool and cannot replace professional medical advice.</p>
            </div>
          </div>

          {/* 🟢 NAYA ASLI CHAT COMPONENT YAHAN AAYEGA */}
          <AICompanionChat icons={icons} />
          
        </div>
      </section>

      {/* ── Doctor Report ────────────────────────────────────────────────────── */}
      <section className="py-24 px-5 bg-gradient-to-b from-[#F7F4FB] to-[#FAF9F6] border-y border-[#E8E4DE]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            {/* Report mockup */}
            <div className="bg-white rounded-2xl border border-[#E8E4DE] shadow-[0_8px_40px_rgba(139,123,181,0.10)] overflow-hidden">
              <div className="bg-gradient-to-r from-[#8B7BB5]/10 to-[#A8BFA3]/10 border-b border-[#E8E4DE] px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#8B7BB5] flex items-center justify-center">
                    <Icon path={icons.doc} size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-[#29272D] text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>My Health Summary</p>
                    <p className="text-xs text-[#7A7880]">Generated · Sep 2026</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: 'Cycle History', val: '6 cycles logged · Avg 38 days', status: 'yellow' },
                  { label: 'Symptom Trends', val: 'Fatigue (frequent) · Acne (mild)', status: 'orange' },
                  { label: 'Lifestyle Trends', val: 'Sleep improving · Activity consistent', status: 'green' },
                  { label: 'Questions to Discuss', val: '3 flagged for doctor visit', status: 'purple' },
                  { label: 'Medication Log', val: 'None recorded', status: 'gray' },
                ].map(r => (
                  <div key={r.label} className="flex items-start justify-between gap-4 py-2.5 border-b border-[#F0EDE8] last:border-0">
                    <p className="text-xs font-medium text-[#29272D]">{r.label}</p>
                    <p className="text-xs text-[#7A7880] text-right">{r.val}</p>
                  </div>
                ))}
                <button className="w-full mt-2 bg-[#8B7BB5] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#7A6AA4] transition-colors">
                  Create My Health Report
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#29272D] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Make your doctor visits more useful.
              </h2>
              <p className="text-[#7A7880] text-lg leading-relaxed mb-6">
                Turn months of scattered information into a simple, structured summary you can discuss with your healthcare professional.
              </p>
              <div className="space-y-3">
                {[
                  'Cycle history at a glance',
                  'Symptom and lifestyle trends',
                  'Your questions, prepared in advance',
                  'Medication and supplement log',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#E8F0E7] flex items-center justify-center flex-shrink-0">
                      <Icon path={icons.check} size={11} className="text-[#A8BFA3]" />
                    </div>
                    <span className="text-sm text-[#29272D] font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Privacy ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-5 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#29272D] mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Your health data deserves privacy.
          </h2>
          <p className="text-[#7A7880] text-lg max-w-md mx-auto">We take a thoughtful, privacy-first approach to everything we build.</p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { icon: icons.lock, label: 'Secure Account', desc: 'Your account is protected with industry-standard security practices.' },
            { icon: icons.shield, label: 'Privacy-Focused', desc: 'Privacy is a design principle, not an afterthought.' },
            { icon: icons.doc, label: 'Minimal Data', desc: 'We collect only what is necessary for the experience to work.' },
            { icon: icons.user, label: 'You\'re in Control', desc: 'Access, edit, or delete your data at any time.' },
          ].map(p => (
            <div key={p.label} className="bg-white rounded-2xl border border-[#E8E4DE] p-6 text-center">
              <div className="w-11 h-11 rounded-xl bg-[#EAE6F4] flex items-center justify-center mx-auto mb-4">
                <Icon path={p.icon} size={20} className="text-[#8B7BB5]" />
              </div>
              <h3 className="font-bold text-[#29272D] text-sm mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{p.label}</h3>
              <p className="text-[#7A7880] text-xs leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <FAQ />

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-5 bg-gradient-to-br from-[#EAE6F4] via-[#F4EEF0] to-[#E8F0E7] border-y border-[#DDD7EF]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B7BB5] to-[#A89FCC] flex items-center justify-center mx-auto mb-6 shadow-[0_8px_24px_rgba(139,123,181,0.30)]">
            <Icon path={icons.heart} size={24} className="text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#29272D] mb-5 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Start understanding your health,<br className="hidden md:block" /> one day at a time.
          </h2>
          <p className="text-[#7A7880] text-lg leading-relaxed mb-8 max-w-md mx-auto">
            Track your patterns. Build sustainable habits. Make more informed health decisions.
          </p>
          <button onClick={onNavigate} className="inline-flex items-center gap-2 bg-[#8B7BB5] text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-[#7A6AA4] transition-all hover:shadow-[0_12px_40px_rgba(139,123,181,0.40)] active:scale-[0.98]">
            🌸 Start Your PCOD Journey
          </button>
          <p className="text-xs text-[#7A7880] mt-6 max-w-sm mx-auto leading-relaxed">
            This platform is designed for education, tracking and self-management support. It does not provide medical diagnosis or replace professional medical advice.
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="bg-[#29272D] text-white py-14 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8B7BB5] to-[#A89FCC] flex items-center justify-center">
                  <Icon path={icons.heart} size={15} className="text-white" />
                </div>
                <span className="font-bold text-white text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>HerBalance</span>
              </div>
              <p className="text-white/50 text-xs leading-relaxed">
                For educational and self-management support only. Not a substitute for professional medical diagnosis or treatment.
              </p>
            </div>
            {[
              { heading: 'Product', links: ['Features', 'How It Works', 'Why HerBalance', 'Pricing'] },
              { heading: 'Support', links: ['FAQ', 'Contact', 'Help Center', 'Blog'] },
              { heading: 'Legal', links: ['Privacy', 'Terms', 'Disclaimer'] },
            ].map(col => (
              <div key={col.heading}>
                <p className="font-semibold text-white/80 text-xs uppercase tracking-widest mb-4">{col.heading}</p>
                <div className="space-y-2.5">
                  {col.links.map(l => (
                    <a key={l} href="#" className="block text-white/50 text-sm hover:text-white/80 transition-colors">{l}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-white/40 text-xs">© 2026 HerBalance. All rights reserved.</p>
            <p className="text-white/40 text-xs text-center md:text-right max-w-md">
              This platform does not diagnose, treat, cure, or prevent any medical condition including PCOD/PCOS.
            </p>
          </div>
        </div>
      </footer>

      {/* ── Mobile sticky CTA ────────────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E4DE] px-5 py-3.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-40">
        <button onClick={onNavigate} className="w-full bg-[#8B7BB5] text-white font-bold py-3.5 rounded-xl text-sm">
          🌸 Start Your PCOD Journey
        </button>
      </div>

      {/* ── Contact Us Modal ─────────────────────────────────────────────────── */}
      {showContact && (
        <div className="fixed inset-0 bg-[#29272D]/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowContact(false)}>
          <div 
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200"
            onClick={e => e.stopPropagation()} 
          >
            <button onClick={() => setShowContact(false)} className="absolute top-5 right-5 text-[#7A7880] hover:text-[#29272D] bg-[#F0EDE8] hover:bg-[#E8E4DE] rounded-full p-1.5 transition-colors">
              <Icon path={icons.x} size={18} />
            </button>
            
            <div className="w-14 h-14 rounded-2xl bg-[#EAE6F4] flex items-center justify-center mb-5">
               <Icon path={icons.user} size={28} className="text-[#8B7BB5]" />
            </div>
            
            <h3 className="text-2xl font-bold text-[#29272D] mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Get in Touch</h3>
            <p className="text-[#7A7880] text-sm mb-6">Have questions about the project? Feel free to reach out.</p>
            
            <div className="space-y-4 bg-[#FAF9F6] border border-[#E8E4DE] p-4 rounded-2xl">
              <div>
                <p className="text-[10px] font-bold text-[#8B7BB5] uppercase tracking-wider mb-0.5">Developer</p>
                <p className="text-[#29272D] font-semibold">Pragati Tiwari</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#8B7BB5] uppercase tracking-wider mb-0.5">Email</p>
                <a href="mailto:pragati015tiwari@gmail.com" className="text-[#29272D] font-medium text-sm hover:text-[#8B7BB5] transition-colors">
                  pragati015tiwari@gmail.com
                </a>
              </div>
            </div>
            
            <button onClick={() => setShowContact(false)} className="w-full mt-6 bg-[#29272D] text-white font-semibold py-3 rounded-xl hover:bg-black transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
      {/* 🟢 NAYA: Login / Signup Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  )
  
}
