import React from 'react';

export default function PackagingLeaflet({ onBack }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-4 sm:p-8 text-[#5B0015]">
      {/* ── Top Bar Controls (Not printed) ── */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between no-print bg-white p-4 rounded-2xl border border-[#EDE5CD] shadow-sm">
        <div>
          <h2 className="text-lg font-black text-[#5B0015]">A5 Dual-Sided Packaging Leaflet</h2>
          <p className="text-xs text-[#5B0015]/70">Physical Kit Parcel Insert Card (300 GSM Matte Print Ready)</p>
        </div>
        <div className="flex gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 text-xs font-bold border border-[#EDE5CD] rounded-xl hover:bg-[#F7F2E0]"
            >
              ← Back
            </button>
          )}
          <button
            onClick={handlePrint}
            className="px-5 py-2 text-xs font-black bg-[#5B0015] text-[#F7F2E0] hover:bg-[#450010] rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>🖨️ Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* ── PRINT-READY WRAPPER ── */}
      <div className="max-w-4xl mx-auto space-y-8 print:space-y-0 print:m-0 print:p-0">

        {/* ══════════════════════════════════════════════════════════════
            PAGE 1: FRONT SIDE (PROTOCOL & DAILY USAGE)
        ══════════════════════════════════════════════════════════════ */}
        <div className="leaflet-page bg-[#F7F2E0] border-2 border-[#EDE5CD] rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden print:border-none print:shadow-none print:rounded-none print:p-6 print:m-0 print:page-break-after-always">
          
          {/* Header Brand Block */}
          <div className="border-b-2 border-[#5B0015]/30 pb-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl p-1.5 bg-[#FCFBF5] rounded-2xl border border-[#EDE5CD]">🌸</span>
              <div>
                <h1 className="text-2xl font-black text-[#5B0015] tracking-tight leading-none">HerBalance</h1>
                <p className="text-[10px] font-bold text-[#80AEE8] uppercase tracking-widest mt-1">Rhythm Protocol Kit</p>
              </div>
            </div>
            <div className="text-right">
              <span className="bg-[#80AEE8]/30 text-[#5B0015] text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border border-[#80AEE8]">
                Bilingual Guide
              </span>
              <p className="text-[9px] text-[#5B0015]/70 font-semibold mt-1">Hindi + English</p>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="bg-[#FCFBF5] p-3.5 rounded-2xl border border-[#EDE5CD] mb-4 text-xs leading-relaxed text-[#5B0015]">
            <p className="font-extrabold text-[#5B0015] mb-0.5">Pyaar Bhara Welcome! 🌸</p>
            <p className="text-[11px] text-[#5B0015]/85">
              PCOD mein aapki body standard 28-day rule par nahi chalti. Hamara goal periods ke date se darna nahi, balki ovulation ko natural botanical nutrition se gently support karna hai.
            </p>
          </div>

          {/* Dual Phase Sachet Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            
            {/* Phase 1 Box */}
            <div className="bg-white p-4 rounded-2xl border-2 border-[#80AEE8] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-black uppercase bg-[#80AEE8]/20 text-[#5B0015] px-2 py-0.5 rounded-md">
                    Phase 1 (Day 1 - 14)
                  </span>
                  <span className="text-xs">🌱</span>
                </div>
                <h3 className="font-black text-xs text-[#5B0015]">Follicular Rhythm Ritual</h3>
                <p className="text-[11px] font-bold text-[#80AEE8] mt-0.5">Cold-Milled Flax + Pumpkin Seeds</p>
                <p className="text-[10px] text-[#5B0015]/80 mt-1 leading-snug">
                  <b>Alsi + Kaddu Ke Beej:</b> Flaxseeds natural estrogen balance karte hain aur pumpkin seeds ovary ko healthy egg release karne ke liye zinc provide karte hain.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-[#EDE5CD] flex items-center justify-between text-[10px]">
                <span className="font-bold text-[#5B0015]/70">Dose:</span>
                <span className="font-black text-[#5B0015]">Roz Subah 1 Sachet (14g)</span>
              </div>
            </div>

            {/* Phase 2 Box */}
            <div className="bg-white p-4 rounded-2xl border-2 border-[#5B0015] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-black uppercase bg-[#5B0015]/10 text-[#5B0015] px-2 py-0.5 rounded-md">
                    Phase 2 (Day 15 - Next Flow)
                  </span>
                  <span className="text-xs">✨</span>
                </div>
                <h3 className="font-black text-xs text-[#5B0015]">Luteal Hormone Boost</h3>
                <p className="text-[11px] font-bold text-[#5B0015] mt-0.5">Sesame + Sunflower Seeds</p>
                <p className="text-[10px] text-[#5B0015]/80 mt-1 leading-snug">
                  <b>Til + Surajmukhi Ke Beej:</b> Sesame seeds progesterone support karte hain (cramps aur mood swings kam hote hain) aur sunflower seeds liver detox me madad karte hain.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-[#EDE5CD] flex items-center justify-between text-[10px]">
                <span className="font-bold text-[#5B0015]/70">Dose:</span>
                <span className="font-black text-[#5B0015]">Roz Subah 1 Sachet (14g)</span>
              </div>
            </div>

          </div>

          {/* Consumption Guide */}
          <div className="bg-[#FCFBF5] p-3.5 rounded-2xl border border-[#EDE5CD] mb-3">
            <p className="text-[11px] font-black text-[#5B0015] uppercase tracking-wider mb-1.5">
              🥣 Khane Ka Sabse Aasan Tareeka (Zero Friction):
            </p>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-center font-bold text-[#5B0015]">
              <div className="bg-white p-2 rounded-xl border border-[#EDE5CD]">
                <span className="block text-sm mb-0.5">🥣</span>
                Dahi / Curd ke saath
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#EDE5CD]">
                <span className="block text-sm mb-0.5">🥗</span>
                Oats ya Poha par daal kar
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#EDE5CD]">
                <span className="block text-sm mb-0.5">🥛</span>
                Gun-gune paani ke saath
              </div>
            </div>
            <p className="text-[9px] text-[#5B0015]/70 mt-2 text-center font-medium italic">
              *Sachets pre-ground cold-milled hain, alag se grinder chalane ki zaroorat nahi hai.
            </p>
          </div>

          {/* Footer Note */}
          <div className="text-[9px] text-[#5B0015]/60 text-center font-semibold pt-1">
            Page 1 • HerBalance Natural Hormone Rebalance Protocol
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            PAGE 2: BACK SIDE (RULES, CHECKLIST & APP SYNC)
        ══════════════════════════════════════════════════════════════ */}
        <div className="leaflet-page bg-[#F7F2E0] border-2 border-[#EDE5CD] rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden print:border-none print:shadow-none print:rounded-none print:p-6 print:m-0">
          
          <div className="border-b-2 border-[#5B0015]/30 pb-3 mb-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-[#5B0015]">PCOD Special Rules & Habit Tracker</h2>
              <p className="text-[10px] text-[#5B0015]/70">Consistency is the real medicine for hormones</p>
            </div>
            <span className="text-xl">📋</span>
          </div>

          {/* Golden Rule for Irregular Cycles */}
          <div className="bg-[#5B0015] text-[#F7F2E0] p-4 rounded-2xl shadow-sm mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">⚠️</span>
              <p className="text-xs font-black text-[#80AEE8] uppercase tracking-wider">
                Sabse Zaroori Sawaal (Golden Rule):
              </p>
            </div>
            <p className="text-[11px] leading-relaxed font-semibold">
              <b>Q. Agar 28 din me period na aaye aur cycle late ho, tab kya karein?</b><br />
              <span className="text-[#F7F2E0]/90">
                Ghabrayein bilkul nahi! Jab tak bleeding start na ho, Phase 2 sachet continue rakhein. Jaise hi bleeding shuru ho, turant <b>Phase 1 (Day 1)</b> par switch kar jayein.
              </span>
            </p>
          </div>

          {/* 28-Day Habit Checklist */}
          <div className="bg-[#FCFBF5] p-3.5 rounded-2xl border border-[#EDE5CD] mb-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[11px] font-black text-[#5B0015] uppercase tracking-wider">
                ✓ 28-Day Habit Checklist (Roz Ka Tick Lagayein)
              </p>
              <span className="text-[9px] font-bold text-[#80AEE8]">Consistency Goal</span>
            </div>

            {/* Phase 1 Checkboxes */}
            <div className="mb-2">
              <span className="text-[9px] font-bold text-[#5B0015]/70 uppercase block mb-1">Phase 1: Flax + Pumpkin (14 Days)</span>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 14 }, (_, i) => (
                  <div key={i} className="bg-white border border-[#EDE5CD] rounded-lg py-1 text-center text-[10px] font-bold text-[#5B0015]">
                    D{i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Phase 2 Checkboxes */}
            <div>
              <span className="text-[9px] font-bold text-[#5B0015]/70 uppercase block mb-1">Phase 2: Sesame + Sunflower (14 Days)</span>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 14 }, (_, i) => (
                  <div key={i} className="bg-white border border-[#EDE5CD] rounded-lg py-1 text-center text-[10px] font-bold text-[#5B0015]">
                    D{i + 15}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* QR & App Sync */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#EDE5CD] flex items-center justify-between gap-4 mb-4">
            <div className="space-y-1">
              <span className="bg-[#80AEE8]/25 text-[#5B0015] text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                Free App Sync
              </span>
              <p className="text-xs font-black text-[#5B0015]">HerBalance Digital Companion</p>
              <p className="text-[10px] text-[#5B0015]/75 leading-tight">
                Scan karke app me roz water intake, sleep aur symptoms log karein. Cycle delay hone par app automatic phase switch kar degi.
              </p>
            </div>
            
            <div className="shrink-0 bg-[#F7F2E0] p-1.5 rounded-xl border border-[#EDE5CD] text-center">
              <img
                src="https://quickchart.io/qr?text=https://herbalance.in&size=90"
                alt="App QR"
                className="w-16 h-16 object-contain rounded-lg"
              />
              <span className="text-[8px] font-bold text-[#5B0015] block mt-0.5">Scan to Sync</span>
            </div>
          </div>

          {/* Founder Transparency Note */}
          <div className="border-t border-[#5B0015]/20 pt-2.5 flex items-center justify-between text-[9px] text-[#5B0015]/80 font-medium">
            <span>🌸 100% Organic Food-Grade • No Synthetic Hormones</span>
            <span>Founder Helpline: WhatsApp Care Available</span>
          </div>

        </div>

      </div>

      {/* ── Print Styles ── */}
      <style>{`
        @media print {
          body {
            background-color: #F7F2E0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .leaflet-page {
            box-shadow: none !important;
            border: none !important;
            page-break-after: always;
            width: 100% !important;
            height: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}