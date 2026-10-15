import React, { useState, useEffect } from 'react';

const UPI_ID = "YOUR_UPI_ID@okaxis"; // Apna real UPI ID yahan dalein
const AMOUNT = 20;

export default function PaymentModal({ isOpen, onClose, onSuccess, userEmail }) {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes (600 seconds)
  const [utrNumber, setUtrNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ── 🕒 1. TIMER & PERSISTENCE ENGINE ──
  useEffect(() => {
    if (!isOpen) return;

    // Check if previous payment session exists in localStorage
    const savedStartTime = localStorage.getItem('hb_payment_session_start');
    const now = Math.floor(Date.now() / 1000);

    if (savedStartTime) {
      const elapsed = now - parseInt(savedStartTime, 10);
      const remaining = 600 - elapsed;
      if (remaining > 0) {
        setTimeLeft(remaining);
      } else {
        handleExpire();
      }
    } else {
      localStorage.setItem('hb_payment_session_start', now.toString());
      setTimeLeft(600);
    }

    // 1-second countdown interval
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // ── 🛡️ 2. PREVENT ACCIDENTAL REFRESH GUARD ──
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Aapki payment process mein hai. Refresh karne se session cancel ho sakta hai!';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isOpen]);

  const handleExpire = () => {
    localStorage.removeItem('hb_payment_session_start');
    setError('Payment session expire ho gaya hai. Kripya dobara koshish karein.');
  };

  const handleManualClose = () => {
    localStorage.removeItem('hb_payment_session_start');
    onClose();
  };

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ── 🚀 3. DIRECT UPI APP TRIGGER LINK ──
  const upiIntentUrl = `upi://pay?pa=${UPI_ID}&pn=HerBalance&am=${AMOUNT}&cu=INR&tn=14DayProtocolPass`;

  // ── 🛡️ 4. SUBMIT UTR / REFERENCE CODE ──
  const handleSubmitUTR = async (e) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.trim().length < 8) {
      setError('Kripya valid 12-digit UPI Reference / UTR Number dalein.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Yahan aap backend ko UTR verification call bhej sakti hain
      // e.g., await fetch('/verify-payment', { method: 'POST', body: JSON.stringify({ utr: utrNumber }) })
      
      localStorage.removeItem('hb_payment_session_start');
      if (onSuccess) onSuccess(utrNumber);
    } catch (err) {
      setError('Verification mein samasya aayi. Kripya support se contact karein.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FCFBF5] border-2 border-[#5B0015] rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EDE5CD] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌸</span>
            <div>
              <h3 className="font-black text-[#5B0015] text-base leading-tight">Secure Payment Pass</h3>
              <p className="text-[10px] text-[#5B0015]/70 font-bold uppercase">14-Day Reset Protocol</p>
            </div>
          </div>
          <button 
            onClick={handleManualClose} 
            className="text-[#5B0015]/60 hover:text-[#5B0015] font-bold text-sm p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* ⏳ GOVT STYLE TIMER BAR */}
        <div className="bg-[#5B0015] text-[#F7F2E0] rounded-2xl p-3 text-center mb-4 shadow-inner">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#80AEE8]">Session Time Remaining</p>
          <div className="text-2xl font-black font-mono tracking-widest mt-0.5">
            {formatTimer(timeLeft)}
          </div>
          <p className="text-[9px] text-[#F7F2E0]/70 mt-1 font-semibold">
            Do not press back or refresh. Session remains locked.
          </p>
        </div>

        {timeLeft > 0 ? (
          <div className="space-y-4">
            
            {/* Direct UPI Trigger Button (For Mobile Users) */}
            <div className="text-center">
              <a 
                href={upiIntentUrl}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#80AEE8] hover:bg-[#6FA0DD] text-[#5B0015] font-black py-3 rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span>📱 Pay ₹20 via GPay / PhonePe / Paytm</span>
              </a>
              <p className="text-[10px] text-[#5B0015]/75 font-semibold mt-1.5">
                (Payment app khulne par ₹20 pay karein aur wapas aakar UTR dalein)
              </p>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#EDE5CD] w-full" />
              <span className="bg-[#FCFBF5] px-2 text-[10px] font-bold text-[#5B0015]/60 uppercase">OR SCAN QR</span>
            </div>

            {/* Dynamic Generated UPI QR Code */}
            <div className="flex justify-center">
              <div className="bg-white p-2.5 rounded-2xl border border-[#EDE5CD] shadow-sm">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiIntentUrl)}`} 
                  alt="UPI QR Code" 
                  className="w-32 h-32 rounded-lg"
                />
              </div>
            </div>

            {/* UTR Form Input */}
            <form onSubmit={handleSubmitUTR} className="space-y-2.5">
              <div>
                <label className="block text-[10px] font-black text-[#5B0015]/80 uppercase mb-1">
                  Enter 12-Digit UPI Ref / UTR No:
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 4289XXXXXXXX"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))} // only numbers
                  maxLength={12}
                  className="w-full bg-white border border-[#EDE5CD] rounded-xl p-2.5 text-xs font-bold text-[#5B0015] text-center tracking-widest outline-none focus:ring-2 focus:ring-[#80AEE8]"
                />
              </div>

              {error && (
                <p className="text-[11px] text-rose-600 font-bold text-center bg-rose-50 p-2 rounded-xl border border-rose-200">
                  ⚠️ {error}
                </p>
              )}

              <button 
                type="submit" 
                disabled={submitting || utrNumber.length < 8}
                className="w-full bg-[#5B0015] hover:bg-[#450010] text-[#F7F2E0] font-black py-3 rounded-xl text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {submitting ? 'Verifying Ref No...' : 'Confirm & Unlock Full Protocol ➔'}
              </button>
            </form>

          </div>
        ) : (
          <div className="text-center py-4 space-y-3">
            <span className="text-3xl">⏰</span>
            <p className="text-xs font-bold text-rose-600">Session expired. Security timeout reached.</p>
            <button 
              onClick={handleManualClose}
              className="bg-[#5B0015] text-[#F7F2E0] text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
            >
              Start New Payment Session
            </button>
          </div>
        )}

      </div>
    </div>
  );
}