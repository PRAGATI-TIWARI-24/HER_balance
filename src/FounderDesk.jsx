import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export default function FounderDesk({ onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'under_review' | 'verified' | 'dispatched' | 'unpaid'
  const [searchQuery, setSearchQuery] = useState('');

  // ── Fetch Real Orders from Supabase / Safe LocalStorage ──
  const fetchOrders = async () => {
    setLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('kit_subscribers')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setOrders(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Orders fetch failed:", err);
      }
    }

    // Safe LocalStorage Reader Fallback
    const localSaved = localStorage.getItem('guest_user_deliveryAddress') || localStorage.getItem('pragati@gmail.com_deliveryAddress');
    if (localSaved) {
      try {
        const parsed = JSON.parse(localSaved);
        const hasValidUtr = parsed.utr_number && String(parsed.utr_number).trim().length >= 6;

        setOrders([{
          id: 'local-session-1',
          user_id: parsed.user_id || 'Current User',
          whatsapp: parsed.whatsapp || '',
          house_no: parsed.house_no || '',
          area: parsed.area || '',
          landmark: parsed.landmark || '',
          city: parsed.city || '',
          state: parsed.state || '',
          pincode: parsed.pincode || '',
          pass_fee: 20,
          utr_number: parsed.utr_number || '',
          payment_status: parsed.payment_status || (hasValidUtr ? 'under_review' : 'unpaid'),
          dispatch_phase: parsed.dispatch_phase || 'Phase 1: Follicular Seeds',
          created_at: new Date().toISOString()
        }]);
      } catch (e) {}
    } else {
      setOrders([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ── Real Status Controller ──
  const handleUpdateStatus = async (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: newStatus } : o));

    if (isSupabaseConfigured && supabase && !String(orderId).startsWith('local-')) {
      try {
        await supabase
          .from('kit_subscribers')
          .update({ payment_status: newStatus })
          .eq('id', orderId);
      } catch (err) {
        console.error("Status update error:", err);
      }
    }
  };

  // ── 🛡️ STRICT WhatsApp Notification Guard ──
  // Jab tak UTR na ho aur tick/approval na lage, tab tak message strictly blocked rahega!
  const handleSendWaAlert = (order, type = 'verified') => {
    const hasValidUtr = Boolean(order.utr_number && String(order.utr_number).trim().length >= 6);
    const isApproved = order.payment_status === 'verified' || order.payment_status === 'dispatched';

    // Strict Lock: Bina UTR aur bina Approval ke koi update nahi ja sakti!
    if (!hasValidUtr || !isApproved) {
      alert("❌ Action Blocked!\nYeh order abhi verify ya approve nahi hua hai. Jab tak valid UTR na ho aur aap 'Approve & Mark Paid' na karein, tab tak koi WhatsApp message nahi bheja ja sakta.");
      return;
    }

    let cleanNumber = String(order.whatsapp || '').replace(/[^0-9]/g, '');
    if (cleanNumber.length === 10) cleanNumber = '91' + cleanNumber;

    let messageText = '';
    if (type === 'dispatched') {
      messageText = `Good news! 📦\n\nAapka HerBalance Seed Kit dispatch ho chuka hai.\nKit Phase: ${order.dispatch_phase}\nAddress: ${order.house_no}, ${order.area}, ${order.city} - ${order.pincode}.\nKeep tracking your cycle rhythm on HerBalance! 🌸`;
    } else {
      messageText = `Hi! HerBalance team yahan se. 🌸\n\nAapka ₹20 Care Pass payment successfully verify ho gaya hai! (Bank UTR: ${order.utr_number}).\n\nAapka "${order.dispatch_phase}" packaging queue me add ho gaya hai.\nThank you for trusting HerBalance! ✨`;
    }

    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(messageText)}`, '_blank');
  };

  // ── CSV Export For Courier Upload ──
  const handleExportCsv = () => {
    // Sirf verified orders hi export honge
    const verifiedOnly = orders.filter(o => o.payment_status === 'verified' || o.payment_status === 'dispatched');

    if (verifiedOnly.length === 0) {
      alert("Export karne ke liye koi Verified ya Dispatched order nahi mila!");
      return;
    }

    const headers = ["Order ID", "WhatsApp", "House No", "Area", "Landmark", "City", "State", "Pincode", "Kit Phase", "Payment Status", "UTR Number", "Date"];
    const rows = verifiedOnly.map(o => [
      `"${o.id}"`,
      `"${o.whatsapp}"`,
      `"${o.house_no}"`,
      `"${o.area}"`,
      `"${o.landmark || ''}"`,
      `"${o.city}"`,
      `"${o.state}"`,
      `"${o.pincode}"`,
      `"${o.dispatch_phase}"`,
      `"${o.payment_status}"`,
      `"${o.utr_number || ''}"`,
      `"${new Date(o.created_at).toLocaleDateString('en-IN')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HerBalance_Verified_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Printable Shipping Labels ──
  const handlePrintLabels = () => {
    const printableContent = filteredOrders.filter(o => o.payment_status === 'verified' || o.payment_status === 'dispatched');
    if (printableContent.length === 0) {
      alert("Print karne ke liye koi Verified ya Dispatched order nahi mila! Unpaid orders ka shipping label print nahi kiya ja sakta.");
      return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>HerBalance Shipping Labels</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            .label-card { border: 2px dashed #444; border-radius: 12px; padding: 16px; margin-bottom: 20px; page-break-inside: avoid; }
            .brand { font-size: 16px; font-weight: bold; color: #8B7BB5; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
            .details { font-size: 13px; line-height: 1.5; margin-top: 6px; }
            .badge { display: inline-block; background: #eee; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>HerBalance Dispatch Slips (${printableContent.length} Verified Orders)</h2>
          ${printableContent.map(o => `
            <div class="label-card">
              <div class="brand">🌸 HerBalance Organic Kit Dispatch</div>
              <div class="details">
                <b>To (Phone):</b> +91 ${o.whatsapp}<br/>
                <b>Address:</b> ${o.house_no}, ${o.area}${o.landmark ? ', Near ' + o.landmark : ''}<br/>
                <b>City/State:</b> ${o.city}, ${o.state} - <b>${o.pincode}</b><br/>
                <b>Package:</b> <span class="badge">${o.dispatch_phase}</span> \vert{} <b>Bank UTR:</b>${o.utr_number || 'N/A'}
              </div>
            </div>
          `).join('')}
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Filtered Orders
  const filteredOrders = orders.filter(order => {
    const status = order.payment_status || 'unpaid';
    const matchesFilter = filter === 'all' || status === filter;
    const matchesSearch = 
      (order.whatsapp || '').includes(searchQuery) ||
      (order.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.utr_number || '').includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  // Financial Calculations
  const verifiedOrders = orders.filter(o => o.payment_status === 'verified' || o.payment_status === 'dispatched');
  const realRevenue = verifiedOrders.length * 20;
  const underReviewCount = orders.filter(o => o.payment_status === 'under_review').length;
  const unpaidCount = orders.filter(o => o.payment_status === 'unpaid' || !o.utr_number).length;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-[#FAF9F6] w-full max-w-6xl rounded-3xl shadow-2xl border border-[#E8E4DE] max-h-[95vh] flex flex-col overflow-hidden">
        
        {/* ── Top Header ── */}
        <div className="bg-white p-5 border-b border-[#E8E4DE] flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-[#FAF9F6] rounded-2xl border border-[#E8E4DE]">👑</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#29272D]">Founder Orders & Logistics Control</h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                  Strict Audit Guard 🛡️
                </span>
              </div>
              <p className="text-xs text-[#7A7880]">Bina valid UTR aur Founder approval ke koi message nahi jayega.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportCsv}
              className="text-xs font-bold text-[#29272D] bg-[#FAF9F6] hover:bg-white px-3.5 py-2 rounded-xl border border-[#E8E4DE] transition-all flex items-center gap-1.5 shadow-sm"
            >
              📥 Export CSV
            </button>
            <button
              onClick={handlePrintLabels}
              className="text-xs font-bold text-white bg-[#8B7BB5] hover:bg-[#726496] px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
            >
              🖨️ Print Labels
            </button>
            <button
              onClick={fetchOrders}
              className="text-xs font-bold text-[#7A7880] hover:text-[#29272D] bg-[#FAF9F6] px-3 py-2 rounded-xl border border-[#E8E4DE] transition-all"
            >
              🔄 Refresh
            </button>
            <button
              onClick={onClose}
              className="bg-[#29272D] hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              Close ✕
            </button>
          </div>
        </div>

        {/* ── Accurate Financial Overview ── */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-[#E8E4DE] bg-white/50">
          <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm">
            <div className="flex justify-between items-center">
              <p className="text-[10px] uppercase font-bold text-[#7A7880]">Real Verified Revenue</p>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-md">In Bank</span>
            </div>
            <p className="text-2xl font-black text-emerald-600 mt-1">₹{realRevenue}</p>
            <span className="text-[10px] text-[#7A7880]">{verifiedOrders.length} verified transactions</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
            <div className="flex justify-between items-center">
              <p className="text-[10px] uppercase font-bold text-[#7A7880]">Needs Verification</p>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-md">UTR Submitted</span>
            </div>
            <p className="text-2xl font-black text-blue-600 mt-1">{underReviewCount}</p>
            <span className="text-[10px] text-[#7A7880]">Check bank statement to approve</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
            <div className="flex justify-between items-center">
              <p className="text-[10px] uppercase font-bold text-[#7A7880]">Unpaid / Incomplete</p>
              <span className="text-[10px] bg-rose-100 text-rose-800 font-extrabold px-2 py-0.5 rounded-md">No UTR</span>
            </div>
            <p className="text-2xl font-black text-rose-500 mt-1">{unpaidCount}</p>
            <span className="text-[10px] text-[#7A7880]">Address saved, payment pending</span>
          </div>
        </div>

        {/* ── Filter Toolbar ── */}
        <div className="p-4 bg-[#FAF9F6] border-b border-[#E8E4DE] flex flex-wrap justify-between items-center gap-3">
          <div className="flex flex-wrap gap-1.5 bg-white p-1 rounded-xl border border-[#E8E4DE]">
            {[
              { key: 'all', label: 'All Orders' },
              { key: 'under_review', label: '⏳ Check UTR' },
              { key: 'verified', label: '✅ Verified' },
              { key: 'dispatched', label: '📦 Dispatched' },
              { key: 'unpaid', label: '⚠️ Unpaid' }
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === f.key ? 'bg-[#29272D] text-white shadow-sm' : 'text-[#7A7880] hover:text-[#29272D]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search WhatsApp, UTR, City..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 text-xs border border-[#E8E4DE] rounded-xl bg-white outline-none focus:ring-1 focus:ring-[#8B7BB5] w-full sm:w-64"
          />
        </div>

        {/* ── Orders List ── */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="text-center py-12 text-[#7A7880] text-sm">Loading live database... ⏳</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#E8E4DE]">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm font-bold text-[#29272D]">Koi orders nahi mile</p>
              <p className="text-xs text-[#7A7880] mt-1">Naye orders yahan automatically update honge.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const hasValidUtr = Boolean(order.utr_number && String(order.utr_number).trim().length >= 6);
                const isPaid = order.payment_status === 'verified' || order.payment_status === 'dispatched';
                const isUnderReview = order.payment_status === 'under_review';

                const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${order.house_no},${order.area}, ${order.city},${order.pincode}`
                )}`;

                return (
                  <div key={order.id} className="bg-white rounded-2xl p-5 border border-[#E8E4DE] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      
                      {/* Left: Address & Customer Details */}
                      <div className="space-y-1.5 max-w-xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-[#29272D]">
                            WhatsApp: +91 {order.whatsapp}
                          </span>
                          
                          {/* 🛡️️ LOCKED WHATSAPP BUTTON (Only active when UTR exists and order is approved) */}
                          {isPaid ? (
                            <button
                              onClick={() => handleSendWaAlert(order, order.payment_status === 'dispatched' ? 'dispatched' : 'verified')}
                              className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold px-2.5 py-1 rounded-md border border-emerald-200 transition-colors flex items-center gap-1"
                            >
                              💬 Send WhatsApp Update
                            </button>
                          ) : (
                            <span 
                              title="Bina UTR aur Approval ke message blocked hai"
                              className="bg-gray-100 text-gray-400 text-[10px] font-bold px-2.5 py-1 rounded-md border border-gray-200 cursor-not-allowed flex items-center gap-1 select-none"
                            >
                              🔒 WhatsApp Blocked (Unverified)
                            </span>
                          )}
                          
                          {/* Payment State Pill */}
                          {isPaid ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                              ✓ PAYMENT VERIFIED
                            </span>
                          ) : isUnderReview ? (
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2.5 py-0.5 rounded-full animate-pulse">
                              ⏳ UTR SUBMITTED (CHECK BANK)
                            </span>
                          ) : (
                            <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                              ⚠️ PAYMENT NOT DONE / NO UTR
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#29272D] leading-relaxed">
                          <b>Delivery Address:</b> {order.house_no}, {order.area}{order.landmark ? `, Near ${order.landmark}` : ''}, <b>{order.city}</b>, {order.state} - <b>{order.pincode}</b>
                        </p>

                        <div className="flex items-center gap-3 pt-1">
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-[#8B7BB5] hover:underline"
                          >
                            📍 Open Address in Maps ↗
                          </a>
                          <span className="text-[11px] bg-purple-50 text-[#8B7BB5] px-2 py-0.5 rounded-md font-bold">
                            Kit Required: {order.dispatch_phase || 'Phase 1 (Flax + Pumpkin)'}
                          </span>
                        </div>
                      </div>

                      {/* Right: Payment Box & Founder Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E8E4DE]">
                        
                        {/* Real Financial Audit Box */}
                        <div className={`p-3 rounded-xl border text-left min-w-[175px] ${
                          isPaid 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                            : isUnderReview 
                              ? 'bg-blue-50 border-blue-200 text-blue-950' 
                              : 'bg-rose-50 border-rose-200 text-rose-950'
                        }`}>
                          <p className="text-[9px] uppercase font-bold opacity-75">Customer Bank UTR</p>
                          <p className="font-mono text-xs font-black tracking-wide select-all">
                            {hasValidUtr ? order.utr_number : '❌ No UTR Entered'}
                          </p>
                          <p className={`text-[10px] font-bold mt-0.5 ${isPaid ? 'text-emerald-700' : isUnderReview ? 'text-blue-700' : 'text-rose-700'}`}>
                            {isPaid ? '✓ ₹20.00 Received in Bank' : isUnderReview ? 'Verify ₹20 in UPI App' : '₹0.00 Received (Unpaid)'}
                          </p>
                        </div>

                        {/* Founder Verification Controls */}
                        <div className="flex flex-col gap-1.5 w-full sm:w-40">
                          {!isPaid ? (
                            <button
                              onClick={() => {
                                // Strict UTR Check: Bina valid UTR ke approve nahi hone dega
                                if (!hasValidUtr) {
                                  alert("❌ Cannot Approve!\nIs order par customer ne koi valid UTR number nahi daala hai. Fake approval allow nahi hai.");
                                  return;
                                }

                                handleUpdateStatus(order.id, 'verified');
                                
                                if (window.confirm("Payment verify ho gayi! Kya customer ko WhatsApp par confirmation bhejna hai?")) {
                                  handleSendWaAlert({ ...order, payment_status: 'verified' }, 'verified');
                                }
                              }}
                              className={`w-full text-xs font-bold py-2 rounded-xl transition-all shadow-sm ${
                                hasValidUtr 
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              Approve & Mark Paid ✅
                            </button>
                          ) : order.payment_status === 'dispatched' ? (
                            <div className="flex gap-1">
                              <span className="flex-1 text-center py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200">
                                ✓ Dispatched 📦
                              </span>
                              <button
                                onClick={() => handleSendWaAlert(order, 'dispatched')}
                                className="bg-emerald-100 text-emerald-800 px-2 py-2 rounded-xl text-xs font-bold hover:bg-emerald-200"
                                title="Send Dispatch WhatsApp Update"
                              >
                                💬
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                handleUpdateStatus(order.id, 'dispatched');
                                if (window.confirm("Kit dispatch queue me update ho gayi! Kya customer ko dispatch WhatsApp message bhejna hai?")) {
                                  handleSendWaAlert({ ...order, payment_status: 'dispatched' }, 'dispatched');
                                }
                              }}
                              className="w-full bg-[#29272D] hover:bg-black text-white text-xs font-bold py-2 rounded-xl transition-all shadow-sm"
                            >
                              Mark Dispatched 📦
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (!isPaid) {
                                alert("⚠️ Yeh order abhi unverified hai. Sirf verified orders ka label courier ke liye copy karein.");
                                return;
                              }
                              navigator.clipboard.writeText(`To: +91 ${order.whatsapp}\nAddress: ${order.house_no}, ${order.area}, ${order.city}, ${order.state} - ${order.pincode}\nItem: ${order.dispatch_phase}`);
                              alert("Shipping Label copied to clipboard! 📋");
                            }}
                            className={`w-full text-[11px] font-semibold py-1 rounded-xl border ${
                              isPaid ? 'bg-white hover:bg-[#FAF9F6] text-[#29272D] border-[#E8E4DE]' : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                            }`}
                          >
                            Copy Courier Text
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}