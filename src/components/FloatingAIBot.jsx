import React, { useState, useRef, useEffect } from 'react';

export default function FloatingAIBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hi! Main aapka HerBalance AI companion hoon. Symptoms, cycle delay, ya hormone nutrition se related koi bhi doubt ho, turant puchhiye! 🌸" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

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
      setMessages(prev => [...prev, { sender: 'ai', text: "Oops! AI service connect nahi ho payi. Please try again." }]);
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ── 💬 Active Floating Chat Window (Thoda Upar aur Left Shifted) ── */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-16 z-[1000] w-[92vw] sm:w-[380px] h-[490px] max-h-[75vh] bg-[#FCFBF5] rounded-3xl border-2 border-[#EDE5CD] shadow-[0_24px_70px_rgba(91,0,21,0.35)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-[#5B0015] px-4 py-3 flex items-center justify-between text-[#F7F2E0] shrink-0 border-b border-[#EDE5CD]/20">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-[#80AEE8]/20 flex items-center justify-center text-sm border border-[#80AEE8]/40 shadow-sm">
                🌸
              </span>
              <div>
                <p className="font-black text-xs text-[#F7F2E0] leading-tight">HerBalance Companion</p>
                <p className="text-[10px] text-[#80AEE8] font-bold">24/7 Hormone Support</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[#F7F2E0]/80 hover:text-white bg-white/10 hover:bg-white/20 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#F7F2E0] text-xs">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#5B0015] text-[#F7F2E0] rounded-tr-xs font-semibold shadow-sm'
                    : 'bg-white text-[#5B0015] rounded-tl-xs border border-[#EDE5CD] font-medium shadow-xs'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#EDE5CD] rounded-2xl px-3.5 py-2 text-[11px] text-[#5B0015] font-bold flex items-center gap-1.5 shadow-xs">
                  <span>🌸</span>
                  <span className="animate-pulse">Analyzing endocrine symptoms...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-2.5 bg-[#FCFBF5] border-t border-[#EDE5CD] flex gap-1.5 shrink-0">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about cramps, diet, delay..." 
              className="flex-1 bg-white border border-[#EDE5CD] rounded-xl px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[#80AEE8] text-[#5B0015] font-medium placeholder-[#5B0015]/40"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-[#5B0015] hover:bg-[#450010] text-[#F7F2E0] px-4 py-2.5 rounded-xl text-xs font-black transition-all disabled:opacity-50 active:scale-95 cursor-pointer shadow-sm"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* ── 🔘 Dedicated Toggle Button (Bottom Corner Fixed) ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-30 right-4 z-[999] group flex items-center gap-2 bg-[#5B0015] hover:bg-[#450010] text-[#F7F2E0] p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl border-2 border-[#80AEE8] transition-all duration-300 opacity-90 hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
        title={isOpen ? "Close Assistant" : "Ask HerBalance AI"}
      >
        
        <span className="hidden sm:inline text-xs font-black tracking-wide pr-1">
          {isOpen ? 'Close' : 'Ask AI'}
        </span>
      </button>
    </>
  );
}