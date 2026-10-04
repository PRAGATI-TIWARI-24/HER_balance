import Assessment from "./Test";
import { useState, useRef, useEffect } from 'react';
import AuthModal from './AuthModal';
import Dashboard from './Dashboard';
import ScrollToTop from './components/ScrollToTop';
import FounderDesk from './FounderDesk';
import FloatingAIBot from './components/FloatingAIBot';

// ─── Icons ───────────────────────────────────────────────────────────────────
const Icon = ({ path, size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={path} />
  </svg>
);

const icons = {
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
};

// ─── Progress Ring ────────────────────────────────────────────────────────────
function ProgressRing({ pct, color, size = 56, label }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EDE5CD" strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="text-xs font-semibold text-[#5B0015]/75">{label}</span>
    </div>
  );
}

// ─── Dashboard Mockup ─────────────────────────────────────────────────────────
function DashboardMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-br from-[#80AEE8]/20 via-[#F7F2E0]/40 to-[#5B0015]/15 blur-2xl" />
      <div className="relative bg-[#FCFBF5] rounded-[28px] shadow-[0_24px_80px_rgba(91,0,21,0.12)] border border-[#EDE5CD] overflow-hidden w-full max-w-[420px] mx-auto">
        <div className="bg-[#5B0015] px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[#F7F2E0]/80 text-xs font-medium">Good morning</p>
            <p className="text-[#F7F2E0] font-bold text-sm">User 🌸</p>
          </div>
          <div className="bg-[#80AEE8]/25 border border-[#80AEE8]/40 rounded-full px-3 py-1">
            <span className="text-[#F7F2E0] text-xs font-bold">Day --</span>
          </div>
        </div>

        <div className="p-4 space-y-3 bg-[#FCFBF5]">
          <div className="bg-[#F7F2E0] rounded-2xl p-4 border border-[#EDE5CD]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#5B0015]/70 text-xs font-bold uppercase tracking-wider mb-1">Cycle Overview</p>
                <p className="text-[#5B0015] font-black text-2xl">Day 18</p>
                <p className="text-[#5B0015]/75 text-xs mt-0.5">Avg. cycle: 38 days</p>
              </div>
              <div className="flex gap-3">
                <ProgressRing pct={47} color="#5B0015" size={52} label="Cycle" />
                <ProgressRing pct={72} color="#80AEE8" size={52} label="Activity" />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              {['Flow', 'Fertile', 'Luteal', 'Pre-period'].map((phase, i) => (
                <div key={phase} className={`flex-1 h-1.5 rounded-full ${i === 2 ? 'bg-[#5B0015]' : i < 2 ? 'bg-[#80AEE8]' : 'bg-[#EDE5CD]'}`} />
              ))}
            </div>
            <p className="text-[#5B0015] text-xs font-bold mt-1.5">Next period est. ~20 days</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#EDE5CD]">
            <p className="text-[#5B0015] font-bold text-sm mb-2.5">Today's Goals</p>
            <div className="space-y-2">
              {[
                { label: '25 min walk', done: true, color: '#80AEE8' },
                { label: 'Protein-rich breakfast', done: true, color: '#80AEE8' },
                { label: '7+ hours sleep', done: false, color: '#5B0015' },
              ].map(g => (
                <div key={g.label} className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${g.done ? 'border-[#80AEE8] bg-[#80AEE8]' : 'border-[#EDE5CD]'}`}>
                    {g.done && <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#5B0015" strokeWidth="2" strokeLinecap="round" /></svg>}
                  </div>
                  <span className={`text-xs ${g.done ? 'text-[#5B0015]/50 line-through' : 'text-[#5B0015] font-bold'}`}>{g.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Sleep', val: '6.5h', sub: 'Low', color: '#5B0015' },
              { label: 'Steps', val: '4.2k', sub: 'Good', color: '#80AEE8' },
              { label: 'Water', val: '1.8L', sub: 'OK', color: '#5B0015' },
              { label: 'Mood', val: '😊', sub: 'Good', color: '#80AEE8' },
            ].map(s => (
              <div key={s.label} className="bg-[#F7F2E0] rounded-xl p-2.5 border border-[#EDE5CD] text-center">
                <p className="text-[#5B0015] font-black text-sm">{s.val}</p>
                <p className="text-[#5B0015]/75 text-[10px] mt-0.5">{s.label}</p>
                <p className="text-[10px] font-bold mt-0.5" style={{ color: s.color }}>{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#80AEE8]/20 rounded-2xl p-3.5 border border-[#80AEE8]/40">
            <div className="flex gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#5B0015] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon path={icons.sparkle} size={12} className="text-[#F7F2E0]" />
              </div>
              <p className="text-[#5B0015] text-xs font-medium leading-relaxed">
                Your recent cycles have been longer than your previous average. Keep tracking your rhythm.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Responsive Navbar ────────────────────────────────────────────────────────
function Navbar({ onLoginClick }) {
  const [open, setOpen] = useState(false);
  const links = ['How It Works', 'Features', 'Why HerBalance', 'FAQ'];

  return (
    <nav className="border-b border-[#EDE5CD] bg-[#FCFBF5] sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 shrink-0">
          <img
            src="/pcod_logo.jpeg"
            alt="HerBalance Logo"
            className="h-9 w-9 sm:h-11 sm:w-11 rounded-full object-cover shadow-sm shrink-0 border border-[#EDE5CD]"
          />
          <h1 className="text-lg sm:text-2xl font-black text-[#5B0015] tracking-tight shrink-0">
            HerBalance
          </h1>
        </div>
        
        <div className="hidden md:flex items-center gap-7">
          {links.map(link => (
            <a 
              key={link} 
              href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} 
              className="text-sm font-bold text-[#5B0015]/80 hover:text-[#5B0015] transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
        
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <button 
            onClick={onLoginClick} 
            className="text-sm font-bold text-[#5B0015] bg-[#80AEE8]/40 hover:bg-[#80AEE8] transition-all px-4 py-2 rounded-xl cursor-pointer"
          >
            Log In
          </button>
          <a 
            href="https://www.linkedin.com/in/pragati-tiwari-sde24/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-[#5B0015] font-bold hover:opacity-80 transition-opacity"
          >
            Contact Us
          </a>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button 
            onClick={onLoginClick} 
            className="text-xs font-bold text-[#5B0015] bg-[#80AEE8]/40 px-3 py-1.5 rounded-lg shrink-0 cursor-pointer"
          >
            Log In
          </button>
          <button 
            onClick={() => setOpen(!open)}
            className="p-1.5 rounded-lg border border-[#EDE5CD] text-[#5B0015] hover:bg-[#F7F2E0]"
          >
            <Icon path={open ? icons.x : icons.menu} size={22} />
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-[#FCFBF5] border-t border-[#EDE5CD] px-5 py-4 space-y-3 shadow-lg">
          {links.map(link => (
            <a 
              key={link} 
              href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} 
              onClick={() => setOpen(false)}
              className="block text-sm font-bold text-[#5B0015] py-1.5 border-b border-[#EDE5CD]/50"
            >
              {link}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q: "What is this platform for?", a: "HerBalance is a personal health companion to help you track your cycle, symptoms, and lifestyle patterns related to PCOD. It helps you understand your body better and prepare for more informed conversations with your healthcare provider." },
    { q: "Can this app diagnose PCOD/PCOS?", a: "No. HerBalance is not a diagnostic tool and cannot detect, diagnose, cure, or prevent PCOD/PCOS or any other medical condition. It is designed for personal tracking and self-management support only." },
    { q: "Who can use it?", a: "Anyone who wants to track and understand their menstrual health, symptoms, and lifestyle patterns — whether or not they have a PCOD diagnosis." },
    { q: "Can I use it if I already have a diagnosis?", a: "Absolutely. HerBalance is especially useful if you have been diagnosed, as it helps you monitor patterns over time and prepare useful summaries for your doctor visits." },
    { q: "Does it replace a doctor?", a: "No. HerBalance is a complementary tool, not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional for medical concerns." },
    { q: "How is my health data handled?", a: "Your health data is stored securely with privacy as a core design principle. We collect only what is necessary, give you full control over your information, and do not sell your data to third parties." },
    { q: "Can I track Indian foods?", a: "Yes. Our nutrition guidance is built around realistic Indian food choices — including vegetarian, eggetarian, and regional options — so recommendations actually fit your lifestyle." },
  ];

  return (
    <section id="faq" className="py-24 px-5 max-w-3xl mx-auto">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-black text-[#5B0015] mb-4">Frequently asked questions</h2>
        <p className="text-[#5B0015]/80 text-lg">Everything you need to know about HerBalance.</p>
      </div>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="bg-[#FCFBF5] rounded-2xl border border-[#EDE5CD] overflow-hidden">
            <button className="w-full flex items-center justify-between p-5 text-left cursor-pointer" onClick={() => setOpen(open === i ? null : i)}>
              <span className="font-bold text-[#5B0015] text-sm pr-4">{f.q}</span>
              <div className={`flex-shrink-0 w-6 h-6 rounded-full border border-[#EDE5CD] flex items-center justify-center transition-transform ${open === i ? 'rotate-180' : ''}`}>
                <Icon path={icons.chevronDown} size={14} className="text-[#5B0015]" />
              </div>
            </button>
            {open === i && (
              <div className="px-5 pb-5">
                <p className="text-[#5B0015]/80 text-sm leading-relaxed">{f.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── AI Chat Component (Dedicated Landing Page Section - RESTORED) ────────────
function AICompanionChat() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hi! I'm HerBalance AI. How are you feeling today? Share your symptoms, or ask me anything about PCOD/PCOS. 🌸" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("https://her-balance.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText })
      });

      if (!response.ok) throw new Error("Server error");
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        if (isFirstChunk) {
          setIsLoading(false);
          setMessages(prev => [...prev, { sender: 'ai', text: chunk }]);
          isFirstChunk = false;
        } else {
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
    <div className="bg-[#FCFBF5] rounded-2xl border border-[#EDE5CD] shadow-[0_8px_40px_rgba(91,0,21,0.08)] overflow-hidden flex flex-col h-[450px]">
      <div className="bg-[#5B0015] px-5 py-4 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-full bg-[#80AEE8]/20 flex items-center justify-center">
          <Icon path={icons.sparkle} size={16} className="text-[#80AEE8]" />
        </div>
        <div>
          <p className="text-[#F7F2E0] font-bold text-sm">HerBalance AI</p>
          <p className="text-[#F7F2E0]/70 text-xs">Health companion · Not a doctor</p>
        </div>
        <div className="ml-auto w-2 h-2 bg-[#80AEE8] rounded-full animate-pulse" />
      </div>
      
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#F7F2E0]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start gap-3'}`}>
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-[#80AEE8]/30 flex items-center justify-center flex-shrink-0 mt-1">
                <Icon path={icons.sparkle} size={13} className="text-[#5B0015]" />
              </div>
            )}
            <div className={`text-sm rounded-2xl px-4 py-3 max-w-[85%] leading-relaxed ${
              msg.sender === 'user' 
                ? 'bg-[#5B0015] text-[#F7F2E0] rounded-tr-sm font-medium' 
                : 'bg-white border border-[#EDE5CD] text-[#5B0015] rounded-tl-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start gap-3">
            <div className="w-7 h-7 rounded-full bg-[#80AEE8]/30 flex items-center justify-center flex-shrink-0 mt-1">
              <Icon path={icons.sparkle} size={13} className="text-[#5B0015]" />
            </div>
            <div className="bg-white border border-[#EDE5CD] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#5B0015]/40 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-[#5B0015]/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-[#5B0015]/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-[#FCFBF5] border-t border-[#EDE5CD] flex gap-2 shrink-0">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about symptoms, diet, or habits..." 
          className="flex-1 bg-white border border-[#EDE5CD] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#5B0015] text-[#5B0015]"
        />
        <button 
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-[#5B0015] text-[#F7F2E0] px-5 py-3 rounded-xl hover:bg-[#450010] transition-colors disabled:opacity-50 font-bold cursor-pointer"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App({ onNavigate }) {
  const [currentPage, setCurrentPage] = useState('landing');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);

  // ─── 🛡️ FOUNDER DESK MODAL ACCESS ───
  const FOUNDER_PIN = "pragati";
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [showFounderDirect, setShowFounderDirect] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('founder') || searchParams.has('admin')) {
      setShowPinModal(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        setShowPinModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (pinInput.trim() === FOUNDER_PIN) {
      setShowPinModal(false);
      setPinInput('');
      setShowFounderDirect(true);
    } else {
      alert("❌ Incorrect Founder Password!");
      setPinInput('');
    }
  };

  const handleLoginSuccess = (userId, userName) => {
    setUser({ id: userId, name: userName });
    setShowAuthModal(false);
    setCurrentPage('dashboard');
  };

  // Callback jab user Test complete karke report save karta hai
  const handleAssessmentCompleted = (reportData) => {
    if (user) {
      setCurrentPage('dashboard');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleStartJourney = () => setCurrentPage('assessment');

  return (
    <div className="min-h-screen bg-[#F7F2E0] text-[#5B0015] relative">
      <ScrollToTop />

      {/* ── 🌸 1. GLOBAL FLOATING AI BOT (HAR WAQT VISIBLE: LANDING & DASHBOARD) ── */}
      <FloatingAIBot />

      {/* ── 2. CONDITIONAL ROUTING: DASHBOARD VIEW ── */}
      {currentPage === 'dashboard' ? (
        <Dashboard 
          user={user} 
          onLogout={() => { 
            setUser(null); 
            setCurrentPage('landing'); 
          }} 
          onNewAssessment={() => setCurrentPage('assessment')}
        />
      ) : currentPage === 'assessment' ? (
        /* ── 3. CONDITIONAL ROUTING: ASSESSMENT VIEW ── */
        <Assessment 
          onBack={() => setCurrentPage('landing')} 
          onCompleteAssessment={handleAssessmentCompleted}
        />
      ) : (
        /* ── 4. LANDING PAGE VIEW ── */
        <>
          <Navbar 
            onLoginClick={() => setShowAuthModal(true)} 
          />

          {/* ── High-Converting Hero: Free AI Scan Hook ── */}
          <section className="max-w-6xl mx-auto px-5 pt-14 pb-18 md:pt-20 md:pb-24">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 bg-[#80AEE8]/30 text-[#5B0015] text-xs font-bold px-4 py-1.5 rounded-full border border-[#80AEE8]/50">
                  <Icon path={icons.sparkle} size={13} />
                  Free 2-Minute Hormone Symptom Match • Instant Results
                </div>
                
                <h1 className="text-4xl md:text-[52px] font-black text-[#5B0015] leading-[1.15] tracking-tight">
                  Wondering if you have PCOD?<br />
                  <span className="text-[#80AEE8] drop-shadow-sm">Decode your risk</span> in 2 minutes.
                </h1>
                
                <p className="text-[#5B0015]/80 text-lg leading-relaxed max-w-md font-medium">
                  Doctor ke paas jaane se pehle apne symptoms, body changes aur cycle pattern ka science-backed AI match check karein.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <button 
                    onClick={handleStartJourney} 
                    className="inline-flex items-center justify-center gap-2 bg-[#5B0015] text-[#F7F2E0] font-black px-7 py-4 rounded-2xl hover:bg-[#450010] transition-all shadow-xl active:scale-[0.98] cursor-pointer"
                  >
                    <span>🌸</span>
                    <span>Check My PCOD Risk (Free AI Scan)</span>
                  </button>
                  
                  <button 
                    onClick={() => setShowAuthModal(true)} 
                    className="flex items-center justify-center gap-2 text-[#5B0015] font-bold px-6 py-3.5 rounded-2xl border border-[#EDE5CD] hover:border-[#5B0015] transition-colors bg-[#FCFBF5] cursor-pointer"
                  >
                    Existing User? Log In
                  </button>         
                </div>

                <p className="text-xs text-[#5B0015]/70 flex items-center gap-1.5 font-semibold pt-0.5">
                  <Icon path={icons.shield} size={13} />
                  100% Confidential • No Login Required to Check
                </p>
              </div>

              <div className="flex justify-center md:justify-end">
                <DashboardMockup />
              </div>
            </div>
          </section>

          {/* ── Trust Strip ── */}
          <section className="border-y border-[#EDE5CD] bg-[#FCFBF5] py-8 px-5">
            <div className="max-w-4xl mx-auto">
              <p className="text-center text-xs font-extrabold text-[#5B0015]/70 uppercase tracking-widest mb-6">Designed around the things that matter every day</p>
              <div className="flex flex-wrap justify-center gap-8">
                {[
                  { icon: '🩸', label: 'Cycle Tracking' },
                  { icon: '🥗', label: 'Nutrition' },
                  { icon: '🏃', label: 'Activity' },
                  { icon: '😴', label: 'Sleep' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-bold text-[#5B0015] text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Problem ── */}
          <section className="py-20 md:py-24 px-5 max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-[#5B0015] mb-3">
                PCOD isn't just about your period.
              </h2>
              <p className="text-[#5B0015]/80 text-lg max-w-xl mx-auto leading-relaxed">
                Understanding recurring patterns can be difficult when symptoms, lifestyle, and health information are scattered across different places.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { num: '01', title: 'Missed Patterns', body: 'Changes in cycles and symptoms can be difficult to notice over time without a consistent way to log and review them.' },
                { num: '02', title: 'Too Much Information', body: "Generic health advice doesn't always fit your lifestyle, food habits, or daily routine in the Indian context." },
                { num: '03', title: 'Hard to Stay Consistent', body: 'Knowing what to do is easier than turning it into sustainable daily habits that actually stick over weeks and months.' },
              ].map(c => (
                <div key={c.num} className="bg-[#FCFBF5] rounded-2xl border border-[#EDE5CD] p-7 hover:border-[#80AEE8] hover:shadow-lg transition-all">
                  <span className="text-4xl font-black text-[#80AEE8]/40">{c.num}</span>
                  <h3 className="font-bold text-[#5B0015] text-lg mt-2 mb-3">{c.title}</h3>
                  <p className="text-[#5B0015]/80 text-sm leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Solution / Timeline ── */}
          <section id="how-it-works" className="py-20 md:py-24 px-5 bg-[#FCFBF5] border-y border-[#EDE5CD]">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-14">
                <h2 className="text-3xl md:text-4xl font-black text-[#5B0015] mb-3">
                  One place to understand your health journey.
                </h2>
              </div>
              <div className="relative">
                <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-[#80AEE8]/40" />
                <div className="grid md:grid-cols-4 gap-8">
                  {[
                    { step: 'Track', desc: 'Log your cycle, symptoms, sleep, activity and lifestyle.', color: '#5B0015', bg: '#80AEE8' },
                    { step: 'Understand', desc: 'See trends and recurring patterns in your personal data.', color: '#5B0015', bg: '#F7F2E0' },
                    { step: 'Act', desc: 'Receive personalized lifestyle suggestions and daily goals.', color: '#5B0015', bg: '#80AEE8' },
                    { step: 'Monitor', desc: 'Follow progress and prepare useful summaries for healthcare conversations.', color: '#5B0015', bg: '#F7F2E0' },
                  ].map((item, i) => (
                    <div key={item.step} className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-lg mb-5 relative z-10 border border-[#EDE5CD]" style={{ backgroundColor: item.bg, color: item.color }}>
                        {i + 1}
                      </div>
                      <h3 className="font-bold text-[#5B0015] text-lg mb-2">{item.step}</h3>
                      <p className="text-[#5B0015]/80 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Features Grid (With High-Intent Card 6 Hook) ── */}
          <section id="features" className="py-20 md:py-24 px-5 max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-[#5B0015] mb-3">
                Everything you need, in one place.
              </h2>
              <p className="text-xs sm:text-sm text-[#5B0015]/75 font-semibold">
                Track daily, understand your endocrine signals, and take steady control.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Card 1 */}
              <div 
                onClick={() => setShowAuthModal(true)}
                className="bg-[#FCFBF5] rounded-2xl border border-[#EDE5CD] p-6 transition-all group relative cursor-pointer hover:border-[#80AEE8] hover:shadow-md"
              >
                <span className="text-2xl mb-4 block">🩸</span>
                <h3 className="font-bold text-[#5B0015] text-base mb-2 group-hover:text-[#80AEE8] transition-colors">
                  Smart Cycle Tracking
                </h3>
                <p className="text-[#5B0015]/80 text-sm leading-relaxed">
                  Track periods, cycle length and variations over time to decode your unique rhythm.
                </p>
                <div className="mt-5 pt-4 border-t border-[#EDE5CD]">
                  <div className="flex items-center justify-between text-xs font-bold text-[#5B0015] bg-[#80AEE8]/20 px-3 py-2 rounded-lg group-hover:bg-[#80AEE8] transition-colors">
                    <span>🔒 Login to continue</span>
                    <span>→</span>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-[#FCFBF5] rounded-2xl border border-[#EDE5CD] p-6 hover:border-[#5B0015]/40 hover:shadow-lg transition-all">
                <span className="text-2xl mb-4 block">🌸</span>
                <h3 className="font-bold text-[#5B0015] text-base mb-2">Symptom Journal</h3>
                <p className="text-[#5B0015]/80 text-sm leading-relaxed">
                  Record symptoms such as acne, hair fall, cramps and fatigue in an intuitive daily log.
                </p>
              </div>

              {/* Card 3 */}
              <div 
                onClick={() => setShowAuthModal(true)}
                className="bg-[#FCFBF5] rounded-2xl border border-[#EDE5CD] p-6 transition-all group relative cursor-pointer hover:border-[#80AEE8] hover:shadow-md"
              >
                <span className="text-2xl mb-4 block">🥗</span>
                <h3 className="font-bold text-[#5B0015] text-base mb-2 group-hover:text-[#80AEE8] transition-colors">
                  Personalized Nutrition
                </h3>
                <p className="text-[#5B0015]/80 text-sm leading-relaxed">
                  Discover practical Indian food choices — vegetarian, eggetarian, and regional options that fit real life.
                </p>
                <div className="mt-5 pt-4 border-t border-[#EDE5CD]">
                  <div className="flex items-center justify-between text-xs font-bold text-[#5B0015] bg-[#80AEE8]/20 px-3 py-2 rounded-lg group-hover:bg-[#80AEE8] transition-colors">
                    <span>🔒 Login to continue</span>
                    <span>→</span>
                  </div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-[#FCFBF5] rounded-2xl border border-[#EDE5CD] p-6 hover:border-[#5B0015]/40 hover:shadow-lg transition-all">
                <span className="text-2xl mb-4 block">🏃</span>
                <h3 className="font-bold text-[#5B0015] text-base mb-2">Lifestyle Goals</h3>
                <p className="text-[#5B0015]/80 text-sm leading-relaxed">
                  Build manageable daily habits around hydration, movement, and deep restorative sleep.
                </p>
              </div>

              {/* Card 5 */}
              <div className="bg-[#FCFBF5] rounded-2xl border border-[#EDE5CD] p-6 hover:border-[#5B0015]/40 hover:shadow-lg transition-all">
                <span className="text-2xl mb-4 block">📊</span>
                <h3 className="font-bold text-[#5B0015] text-base mb-2">Health Analytics</h3>
                <p className="text-[#5B0015]/80 text-sm leading-relaxed">
                  Review multi-week trends in water, symptoms, and cycle delays for clinical conversations.
                </p>
              </div>

              {/* Card 6: Direct Assessment Hook */}
              <div 
                onClick={handleStartJourney}
                className="bg-[#F7F2E0] rounded-2xl border-2 border-[#5B0015] p-6 transition-all group relative cursor-pointer hover:bg-[#FCFBF5] hover:shadow-xl shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">🔬</span>
                    <span className="bg-[#5B0015] text-[#F7F2E0] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Free 2-Min Scan
                    </span>
                  </div>
                  <h3 className="font-black text-[#5B0015] text-base mb-1.5 group-hover:text-[#80AEE8] transition-colors">
                    Not Sure Where to Begin?
                  </h3>
                  <p className="text-[#5B0015]/80 text-xs sm:text-sm leading-relaxed font-medium">
                    Kabhi doctor ke paas nahi gayi? Apne age, body changes aur cycle se 12 clinical markers ka AI match dekhein.
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#EDE5CD]">
                  <div className="flex items-center justify-between text-xs font-black text-[#F7F2E0] bg-[#5B0015] px-3.5 py-2.5 rounded-xl group-hover:bg-[#450010] transition-colors shadow-sm">
                    <span>Start Free Assessment Now</span>
                    <span>➔</span>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* ── India First ── */}
          <section className="py-20 md:py-24 px-5 bg-[#FCFBF5] border-y border-[#EDE5CD]">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 bg-[#80AEE8]/30 text-[#5B0015] text-xs font-bold px-3 py-1.5 rounded-full mb-5 border border-[#80AEE8]/50">
                    🇮🇳 Made for India
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-[#5B0015] mb-3">
                    Built for real life in India.
                  </h2>
                  <p className="text-[#5B0015]/80 text-lg leading-relaxed mb-6">
                    Health guidance should fit your life — not force your life to fit a generic plan.
                  </p>
                  <div className="grid grid-cols-2 gap-3.5">
                    {[
                      { icon: '🥗', label: 'Indian Food Choices' },
                      { icon: '🥚', label: 'Veg & Eggetarian' },
                      { icon: '🎓', label: 'College & Working Life' },
                      { icon: '💰', label: 'Practical & Affordable' },
                      { icon: '🌐', label: 'Hindi + English' },
                      { icon: '📱', label: 'Mobile-First' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F2E0] border border-[#EDE5CD]">
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-sm font-bold text-[#5B0015]">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-[#F7F2E0] rounded-2xl border border-[#EDE5CD] p-6 shadow-sm">
                    <p className="text-xs font-bold text-[#5B0015]/70 uppercase tracking-widest mb-3">Sample Meal Suggestion</p>
                    <div className="space-y-3">
                      {[
                        { time: 'Breakfast', meal: 'Moong dal chilla + curd + methi tea', note: 'High protein, anti-inflammatory' },
                        { time: 'Lunch', meal: 'Brown rice + rajma + sabzi + raita', note: 'Balanced macros, fiber-rich' },
                        { time: 'Snack', meal: 'Handful of seeds mix + buttermilk', note: 'Good fats + probiotics' },
                      ].map(m => (
                        <div key={m.time} className="flex gap-4 items-start">
                          <span className="text-xs font-bold text-[#80AEE8] bg-[#5B0015] px-2 py-0.5 rounded-md w-18 text-center flex-shrink-0 mt-0.5">{m.time}</span>
                          <div>
                            <p className="text-sm font-bold text-[#5B0015]">{m.meal}</p>
                            <p className="text-xs text-[#5B0015]/70">{m.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── 🌸 DEDICATED AI COMPANION SECTION (100% PRESERVED ON LANDING) ── */}
          <section className="py-20 md:py-24 px-5 max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-[#5B0015] mb-3">
                  Ask. Understand.<br />Take the next step.
                </h2>
                <p className="text-[#5B0015]/80 text-lg leading-relaxed mb-6 font-medium">
                  Your AI health companion helps you make sense of your logs, find patterns, and know the right questions to ask your doctor.
                </p>
                <div className="flex items-start gap-3 p-4 bg-[#80AEE8]/20 rounded-2xl border border-[#80AEE8]/40">
                  <Icon path={icons.info} size={16} className="text-[#5B0015] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#5B0015] leading-relaxed font-semibold">The AI companion provides information and support only. It is not a diagnostic tool and cannot replace professional medical advice.</p>
                </div>
              </div>

              <AICompanionChat />
            </div>
          </section>

          {/* ── FAQ ── */}
          <FAQ />

          {/* ── Final CTA ── */}
          <section className="py-14 md:py-18 px-5 bg-[#5B0015] text-[#F7F2E0] border-y border-[#80AEE8]/20">
            <div className="max-w-2xl mx-auto text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-[#80AEE8] flex items-center justify-center mb-3 shadow-md">
                <Icon path={icons.heart} size={22} className="text-[#5B0015]" />
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 leading-tight tracking-tight">
                Start understanding your health,<br className="hidden md:block" /> one day at a time.
              </h2>

              <p className="text-[#F7F2E0]/85 text-sm sm:text-base leading-relaxed mb-6 max-w-md mx-auto font-medium">
                Track your patterns. Build sustainable habits. Make more informed health decisions.
              </p>

              <button 
                onClick={handleStartJourney} 
                className="inline-flex items-center justify-center gap-2 bg-[#80AEE8] text-[#5B0015] font-black px-7 py-3.5 rounded-xl text-base hover:bg-[#A5C7F0] transition-all shadow-xl active:scale-[0.98] cursor-pointer"
              >
                <span>🌸</span>
                <span>Check My PCOD Risk (Free AI Scan)</span>
              </button>
            </div>
          </section>

          {/* ── Footer ── */}
          <footer className="bg-[#450010] text-[#F7F2E0] py-12 px-5">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-4 gap-8 mb-8">
                <div className="md:col-span-1">
                  <div className="flex items-center gap-2.5 mb-3">
                    <img
                      src="/pcod_logo.jpeg"
                      alt="HerBalance Logo"
                      className="h-8 w-8 rounded-full object-cover shrink-0 border border-[#F7F2E0]/40"
                    />
                    <span className="font-black text-[#F7F2E0] text-lg">HerBalance</span>
                  </div>
                  <p className="text-[#F7F2E0]/70 text-xs leading-relaxed font-medium">
                    For educational and self-management support only. Not a substitute for professional medical diagnosis or treatment.
                  </p>
                </div>
                {[
                  { heading: 'Product', links: ['Features', 'How It Works', 'Why HerBalance', 'Pricing'] },
                  { heading: 'Support', links: ['FAQ', 'Contact', 'Help Center', 'Blog'] },
                  { heading: 'Legal', links: ['Privacy', 'Terms', 'Disclaimer'] },
                ].map(col => (
                  <div key={col.heading}>
                    <p className="font-black text-[#80AEE8] text-xs uppercase tracking-widest mb-3">{col.heading}</p>
                    <div className="space-y-2.5">
                      {col.links.map(l => (
                        <a key={l} href="#" className="block text-[#F7F2E0]/80 text-sm hover:text-white transition-colors font-medium">{l}</a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#F7F2E0]/15 pt-5 flex flex-col md:flex-row items-center justify-between gap-3">
                <p className="text-[#F7F2E0]/60 text-xs">© 2026 HerBalance. All rights reserved.</p>
                <p className="text-[#F7F2E0]/60 text-xs text-center md:text-right max-w-md">
                  This platform does not diagnose, treat, cure, or prevent any medical condition including PCOD/PCOS.
                </p>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* ── Modals & Overlays ── */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onLoginSuccess={handleLoginSuccess} />

      {/* ── 🔒 FOUNDER ACCESS PIN MODAL ── */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <div className="bg-[#FCFBF5] rounded-3xl p-6 max-w-xs w-full shadow-2xl border border-[#EDE5CD]">
            <div className="text-center mb-4">
              <span className="text-3xl">👑</span>
              <h3 className="font-black text-base text-[#5B0015] mt-1">Founder Access</h3>
              <p className="text-xs text-[#5B0015]/70 font-medium">Enter secret PIN to unlock desk</p>
            </div>

            <form onSubmit={handleVerifyPin} className="space-y-3">
              <input
                type="password"
                autoFocus
                placeholder="Enter password..."
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full p-2.5 text-center text-sm border border-[#EDE5CD] bg-white rounded-xl outline-none focus:ring-2 focus:ring-[#80AEE8] text-[#5B0015] font-bold"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowPinModal(false); setPinInput(''); }}
                  className="flex-1 border border-[#EDE5CD] text-[#5B0015] py-2 rounded-xl text-xs font-bold hover:bg-[#F7F2E0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#5B0015] hover:bg-[#450010] text-[#F7F2E0] py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Unlock ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFounderDirect && (
        <FounderDesk onClose={() => setShowFounderDirect(false)} />
      )}
    </div>
  );
}