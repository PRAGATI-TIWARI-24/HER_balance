import React, { useState, useEffect } from 'react';

export default function Dashboard({ user, onLogout }) {
  
  // ─── LocalStorage Key Prefix ───
  const userKey = user?.id || user?.email || 'guest_user';

  // ─── Main View Navigation Tab ───
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'analytics'

  // ─── Feature 5: Doctor PDF Modal State ───
  const [showPdfModal, setShowPdfModal] = useState(false);

  // ─── Push Notification State ───
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "granted") {
      setNotificationsEnabled(true);
    }
  }, []);

  const handleEnableNotifications = () => {
    if (!("Notification" in window)) {
      alert("Aapka browser notifications support nahi karta hai.");
      return;
    }

    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        setNotificationsEnabled(true);
        new Notification("Reminders Enabled! 🔔", {
          body: "Aapko Water aur Medicine ke timely reminders milte rahenge. 🌸",
        });
      } else if (permission === "denied") {
        alert("Notification permission block kar di gayi hai. Browser settings se enable karein.");
      }
    });
  };

  const triggerNotification = (title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  // ─── 1. AI Diet Tracker States ───
  const [diet, setDiet] = useState("");
  const [sleep, setSleep] = useState("6-8 hours");
  const [stress, setStress] = useState("Medium");
  const [aiTip, setAiTip] = useState(null);
  const [loading, setLoading] = useState(false);

  // ─── 2. Cycle Tracker States ───
  const [lastDate, setLastDate] = useState(() => {
    return localStorage.getItem(`${userKey}_lastDate`) || "";
  });
  const [cycleLength, setCycleLength] = useState(() => {
    return localStorage.getItem(`${userKey}_cycleLength`) || 28;
  });
  const [isCycleSetup, setIsCycleSetup] = useState(() => {
    return localStorage.getItem(`${userKey}_isCycleSetup`) === 'true';
  });

  // ─── 3. Symptom Journal States ───
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState('None');
  const [selectedMood, setSelectedMood] = useState('😊 Calm');
  const [symptomStatus, setSymptomStatus] = useState(() => {
    return localStorage.getItem(`${userKey}_symptomStatus`) || 'Stable';
  });
  const [loggedSymptomsList, setLoggedSymptomsList] = useState(() => {
    const saved = localStorage.getItem(`${userKey}_loggedSymptomsList`);
    return saved ? JSON.parse(saved) : [];
  });
  const [journalSavedMsg, setJournalSavedMsg] = useState(false);

  // ─── SOS Relief Box State ───
  const [showSosModal, setShowSosModal] = useState(false);

  // ─── Medication Tracker States ───
  const [medications, setMedications] = useState(() => {
    const savedDate = localStorage.getItem(`${userKey}_medDate`);
    const today = new Date().toDateString();
    const defaultMeds = [
      { id: 1, name: 'Myo-Inositol', time: 'Morning', taken: false },
      { id: 2, name: 'Vitamin D3', time: 'Afternoon', taken: false }
    ];
    const savedMeds = localStorage.getItem(`${userKey}_medications`);
    
    if (savedDate !== today) {
      if (!savedMeds) return defaultMeds;
      const parsed = JSON.parse(savedMeds);
      return parsed.map(m => ({ ...m, taken: false }));
    }
    return savedMeds ? JSON.parse(savedMeds) : defaultMeds;
  });

  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState('Morning');

  const symptomOptions = ['Cramps', 'Bloating', 'Acne', 'Fatigue', 'Headache', 'Backache', 'Mood Swings', 'Severe Cramps'];
  const flowOptions = ['None', 'Light', 'Medium', 'Heavy'];
  const moodOptions = ['😊 Calm', '😴 Tired', '😖 In Pain', '⚡ Energetic', '😡 Irritable'];

  // ─── Daily Quick Logs States ───
  const [waterCount, setWaterCount] = useState(() => {
    const savedDate = localStorage.getItem(`${userKey}_logDate`);
    const today = new Date().toDateString();
    if (savedDate !== today) return 0;
    return Number(localStorage.getItem(`${userKey}_waterCount`)) || 0;
  });

  const [exerciseMins, setExerciseMins] = useState(() => {
    const savedDate = localStorage.getItem(`${userKey}_logDate`);
    const today = new Date().toDateString();
    if (savedDate !== today) return 0;
    return Number(localStorage.getItem(`${userKey}_exerciseMins`)) || 0;
  });

  const [loggedSleep, setLoggedSleep] = useState(() => {
    const savedDate = localStorage.getItem(`${userKey}_logDate`);
    const today = new Date().toDateString();
    if (savedDate !== today) return 0;
    return Number(localStorage.getItem(`${userKey}_loggedSleep`)) || 0;
  });

  const waterSchedule = ["8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM", "10 PM"];

  // Mock Weekly Analytics Data
  const weeklyWaterData = [
    { day: 'Mon', glasses: 6 },
    { day: 'Tue', glasses: 8 },
    { day: 'Wed', glasses: 5 },
    { day: 'Thu', glasses: 7 },
    { day: 'Fri', glasses: 8 },
    { day: 'Sat', glasses: 4 },
    { day: 'Today', glasses: waterCount }
  ];

  const symptomAnalytics = [
    { name: 'Cramps', count: 5, color: 'bg-rose-400' },
    { name: 'Fatigue', count: 4, color: 'bg-amber-400' },
    { name: 'Bloating', count: 3, color: 'bg-purple-400' },
    { name: 'Acne', count: 2, color: 'bg-teal-400' },
    { name: 'Mood Swings', count: 2, color: 'bg-indigo-400' }
  ];

  // Auto-Save Daily Quick Logs
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem(`${userKey}_logDate`, today);
    localStorage.setItem(`${userKey}_waterCount`, waterCount);
    localStorage.setItem(`${userKey}_exerciseMins`, exerciseMins);
    localStorage.setItem(`${userKey}_loggedSleep`, loggedSleep);
  }, [waterCount, exerciseMins, loggedSleep, userKey]);

  // Auto-Save Medications
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem(`${userKey}_medDate`, today);
    localStorage.setItem(`${userKey}_medications`, JSON.stringify(medications));
  }, [medications, userKey]);

  const handleAddMedication = (e) => {
    e.preventDefault();
    if (!newMedName.trim()) return;
    const newMed = {
      id: Date.now(),
      name: newMedName.trim(),
      time: newMedTime,
      taken: false
    };
    setMedications(prev => [...prev, newMed]);
    setNewMedName('');
    triggerNotification("New Medicine Added 💊", `${newMed.name} ko aapke daily schedule me add kar diya gaya hai.`);
  };

  const handleToggleMed = (id) => {
    setMedications(prev =>
      prev.map(m => {
        if (m.id === id) {
          const updatedState = !m.taken;
          if (updatedState) {
            triggerNotification("Medicine Logged! ✅", `Shabash! Aapne ${m.name} dose complete kar li.`);
          }
          return { ...m, taken: updatedState };
        }
        return m;
      })
    );
  };

  const handleDeleteMed = (id) => {
    setMedications(prev => prev.filter(m => m.id !== id));
  };

  const isWaterDone = waterCount >= 8;
  const isExerciseDone = exerciseMins >= 30;
  const isSleepDone = loggedSleep >= 8;
  const isAllGoalsDone = isWaterDone && isExerciseDone && isSleepDone;

  const handleAddWater = () => {
    if (waterCount < 8) {
      const nextCount = waterCount + 1;
      setWaterCount(nextCount);
      if (nextCount === 8) {
        triggerNotification("🎉 Hydro Goal Crushed!", "Aapne aaj ke 8 glasses water target poora kar liya!");
      }
    }
  };

  // Cycle Calculation Logic
  let daysRemainingText = "-- Days";
  let currentPhase = "Follicular";

  if (isCycleSetup && lastDate) {
    const lastPDate = new Date(lastDate);
    const nextDate = new Date(lastPDate);
    nextDate.setDate(lastPDate.getDate() + Number(cycleLength));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = nextDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysPassed = Math.floor((today - lastPDate) / (1000 * 60 * 60 * 24));
    
    if (daysPassed <= 5) currentPhase = "Flow Phase";
    else if (daysPassed <= 13) currentPhase = "Follicular";
    else if (daysPassed <= 16) currentPhase = "Ovulation";
    else currentPhase = "Luteal";

    if (diffDays > 0) {
      daysRemainingText = `${diffDays} Days`;
    } else if (diffDays === 0) {
      daysRemainingText = "Today";
    } else {
      daysRemainingText = `${Math.abs(diffDays)} Days Late`;
    }
  }

  const saveCycleDetails = (date, length) => {
    setLastDate(date);
    setCycleLength(length);
    setIsCycleSetup(true);

    localStorage.setItem(`${userKey}_lastDate`, date);
    localStorage.setItem(`${userKey}_cycleLength`, length);
    localStorage.setItem(`${userKey}_isCycleSetup`, 'true');
  };

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSaveSymptomJournal = () => {
    let updatedStatus = 'Tracked';

    if (selectedFlow !== 'None') {
      const todayStr = new Date().toISOString().split('T')[0];
      saveCycleDetails(todayStr, cycleLength);
    }

    const highSeveritySymptoms = ['Severe Cramps', 'Heavy Bleeding', 'Migraine'];
    const hasHighSeverity = selectedSymptoms.some((s) => highSeveritySymptoms.includes(s));

    if (hasHighSeverity) {
      updatedStatus = 'Needs Attention';
      setShowSosModal(true);
      triggerNotification("🚨 High Severity Alert", "Aapne Severe Symptoms log kiye hain. SOS Relief box check karein.");
    }

    setSymptomStatus(updatedStatus);
    setLoggedSymptomsList(selectedSymptoms);

    localStorage.setItem(`${userKey}_symptomStatus`, updatedStatus);
    localStorage.setItem(`${userKey}_loggedSymptomsList`, JSON.stringify(selectedSymptoms));

    setJournalSavedMsg(true);
    setTimeout(() => setJournalSavedMsg(false), 3000);
  };

  const fetchPersonalizedPlan = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://her-balance.onrender.com/holistic-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diet, sleep, stress }),
      });
      const data = await response.json();
      setAiTip(data.reply);
    } catch (error) {
      setAiTip("Backend connect nahi hua. Apna uvicorn server check karein.");
    }
    setLoading(false);
  };

  // Trigger Print to PDF
  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-4 md:p-8 animate-in fade-in duration-500 relative">
      
      {/* ── Header Section ── */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 mt-2">
        <div>
          <h1 className="text-3xl font-bold text-[#29272D]">
            Hello, <span className="text-[#8B7BB5]">{user?.name || 'Beautiful'}</span> 🌸
          </h1>
          <p className="text-[#7A7880] mt-1 text-sm">Welcome to your personal health overview.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Feature 5 Button */}
          <button
            onClick={() => setShowPdfModal(true)}
            className="bg-[#29272D] text-white hover:bg-black px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            📄 Doctor PDF Report
          </button>

          <button
            onClick={handleEnableNotifications}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 border ${
              notificationsEnabled 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-purple-50 text-[#8B7BB5] border-purple-200 hover:bg-purple-100'
            }`}
          >
            {notificationsEnabled ? '🔔 Reminders Active' : '🔔 Enable Reminders'}
          </button>

          <button
            onClick={() => setShowSosModal(true)}
            className="bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            🆘 Cramp SOS Relief
          </button>

          <button 
            onClick={onLogout}
            className="border border-[#E8E4DE] text-[#29272D] hover:border-[#8B7BB5] hover:text-[#8B7BB5] px-5 py-2 rounded-xl font-semibold transition-colors bg-white shadow-sm text-sm"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* ── Tab Switcher ── */}
      <div className="max-w-6xl mx-auto mb-6 bg-white p-1.5 rounded-2xl border border-[#E8E4DE] flex gap-2 shadow-sm w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'dashboard'
              ? 'bg-[#29272D] text-white shadow-sm'
              : 'text-[#7A7880] hover:text-[#29272D]'
          }`}
        >
          <span>🏠 Today's Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-[#8B7BB5] text-white shadow-sm'
              : 'text-[#7A7880] hover:text-[#8B7BB5]'
          }`}
        >
          <span>📊 Health Analytics & Trends</span>
        </button>
      </div>

      {/* ── SOS Relief Banner ── */}
      {symptomStatus === 'Needs Attention' && (
        <div className="max-w-6xl mx-auto mb-6 bg-rose-50 border border-rose-200 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <p className="text-rose-900 font-bold text-sm">High Severity Symptom Logged today!</p>
              <p className="text-rose-700 text-xs">Cramps or high discomfort detected. Need instant natural relief steps?</p>
            </div>
          </div>
          <button
            onClick={() => setShowSosModal(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
          >
            Open Relief Box 🌸
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: TODAY'S DASHBOARD                                        */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'dashboard' && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 1. CYCLE TRACKER CARD */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E8E4DE] hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#29272D] flex items-center gap-2">
                🩸 Cycle Tracker
              </h2>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                symptomStatus === 'Needs Attention' 
                  ? 'bg-rose-100 text-rose-600 animate-pulse' 
                  : 'bg-[#EAE6F4] text-[#8B7BB5]'
              }`}>
                {symptomStatus}
              </span>
            </div>

            {!isCycleSetup ? (
              <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#E8E4DE] space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-[#7A7880] uppercase tracking-wider">Last Period Start Date</label>
                  <input
                    type="date"
                    className="w-full mt-1 p-2 text-sm border border-[#E8E4DE] rounded-xl bg-white focus:ring-1 focus:ring-[#8B7BB5] outline-none text-[#29272D]"
                    value={lastDate}
                    onChange={(e) => setLastDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#7A7880] uppercase tracking-wider">Average Cycle Length (Days)</label>
                  <input
                    type="number"
                    className="w-full mt-1 p-2 text-sm border border-[#E8E4DE] rounded-xl bg-white focus:ring-1 focus:ring-[#8B7BB5] outline-none text-[#29272D]"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => { if(lastDate) saveCycleDetails(lastDate, cycleLength) }}
                  disabled={!lastDate}
                  className="w-full mt-1 bg-[#8B7BB5] text-white py-2 rounded-xl text-xs font-semibold hover:bg-[#726496] transition-colors disabled:opacity-50"
                >
                  Save Details
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#FAF9F6] rounded-2xl p-5 text-center border border-[#E8E4DE]">
                  <p className="text-xs text-[#7A7880] font-medium mb-1">Next period in</p>
                  <p className={`text-3xl font-extrabold ${daysRemainingText.includes('Late') ? 'text-red-500' : 'text-[#8B7BB5]'}`}>
                    {daysRemainingText}
                  </p>
                  <p className="text-xs text-[#8B7BB5] font-semibold mt-2">
                    Phase: <span className="underline">{currentPhase}</span>
                  </p>
                </div>

                {loggedSymptomsList.length > 0 && (
                  <div className="bg-[#FAF9F6] p-3 rounded-xl border border-[#E8E4DE]">
                    <p className="text-[10px] font-bold text-[#7A7880] uppercase mb-1.5">Today's Logged Symptoms:</p>
                    <div className="flex flex-wrap gap-1">
                      {loggedSymptomsList.map((s, idx) => (
                        <span key={idx} className="bg-[#EAE6F4] text-[#8B7BB5] text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs px-1 text-[#7A7880]">
                  <span>Cycle Length: <b>{cycleLength} Days</b></span>
                  <button 
                    onClick={() => setIsCycleSetup(false)} 
                    className="font-bold text-[#8B7BB5] hover:underline"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. SYMPTOM JOURNAL BLOCK */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E8E4DE] hover:shadow-md transition-shadow space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#29272D] flex items-center gap-2">
                🌸 Symptom Journal
              </h2>
              <span className="text-[10px] text-[#7A7880] font-semibold uppercase">Today</span>
            </div>

            <div>
              <p className="text-[11px] font-bold text-[#7A7880] uppercase tracking-wider mb-1.5">Period Flow Today:</p>
              <div className="flex gap-1.5">
                {flowOptions.map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFlow(f)}
                    className={`flex-1 py-1 rounded-xl text-xs font-medium border transition-all ${
                      selectedFlow === f
                        ? 'bg-[#8B7BB5] text-white border-[#8B7BB5]'
                        : 'bg-[#FAF9F6] text-[#29272D] border-[#E8E4DE] hover:border-[#8B7BB5]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-[#7A7880] uppercase tracking-wider mb-1.5">Physical Symptoms:</p>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {symptomOptions.map((s) => {
                  const active = selectedSymptoms.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSymptom(s)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                        active
                          ? 'bg-[#D99AA5] text-white shadow-sm'
                          : 'bg-[#FAF9F6] text-[#7A7880] border border-[#E8E4DE] hover:border-[#D99AA5]'
                      }`}
                    >
                      {s} {active ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-[#7A7880] uppercase tracking-wider mb-1.5">Mood:</p>
              <div className="flex flex-wrap gap-1.5">
                {moodOptions.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMood(m)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-all ${
                      selectedMood === m
                        ? 'bg-[#A8BFA3] text-white border-[#A8BFA3]'
                        : 'bg-[#FAF9F6] text-[#29272D] border-[#E8E4DE]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveSymptomJournal}
              className="w-full bg-[#8B7BB5] hover:bg-[#726496] text-white font-semibold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
            >
              {journalSavedMsg ? '✓ Journal Logged & Saved!' : 'Save & Sync Cycle Tracker'}
            </button>
          </div>

          {/* 3. MEDICATION & SUPPLEMENT TRACKER */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E8E4DE] hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-[#29272D] flex items-center gap-2">
                  💊 Meds & Supplements
                </h2>
                <span className="text-[10px] font-bold bg-[#EAE6F4] text-[#8B7BB5] px-2.5 py-0.5 rounded-full">
                  {medications.filter(m => m.taken).length} / {medications.length} Done
                </span>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1 mb-3">
                {medications.length === 0 ? (
                  <p className="text-xs text-[#7A7880] text-center py-4">No medications added yet.</p>
                ) : (
                  medications.map((m) => (
                    <div 
                      key={m.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                        m.taken 
                          ? 'bg-emerald-50/60 border-emerald-200 line-through text-[#7A7880]' 
                          : 'bg-[#FAF9F6] border-[#E8E4DE] text-[#29272D]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleMed(m.id)}
                          className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                            m.taken ? 'bg-emerald-500 text-white' : 'border border-[#E8E4DE] bg-white'
                          }`}
                        >
                          {m.taken ? '✓' : ''}
                        </button>
                        <div>
                          <span className="font-semibold block">{m.name}</span>
                          <span className="text-[10px] text-[#7A7880]">{m.time}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMed(m.id)}
                        className="text-[#7A7880] hover:text-red-500 text-xs px-1"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <form onSubmit={handleAddMedication} className="pt-2 border-t border-[#E8E4DE]">
              <p className="text-[10px] font-bold text-[#7A7880] uppercase tracking-wider mb-1.5">+ Add New Supplement / Med</p>
              <div className="flex gap-1.5 mb-1.5">
                <input
                  type="text"
                  placeholder="Medicine name..."
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="flex-1 p-2 text-xs border border-[#E8E4DE] rounded-xl bg-[#FAF9F6] outline-none focus:ring-1 focus:ring-[#8B7BB5]"
                />
                <select
                  value={newMedTime}
                  onChange={(e) => setNewMedTime(e.target.value)}
                  className="p-2 text-xs border border-[#E8E4DE] rounded-xl bg-[#FAF9F6] outline-none text-[#29272D]"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Night">Night</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={!newMedName.trim()}
                className="w-full bg-[#8B7BB5] hover:bg-[#726496] text-white text-xs font-semibold py-2 rounded-xl transition-colors disabled:opacity-50"
              >
                Add Medicine
              </button>
            </form>
          </div>

          {/* 4. AI DIET TRACKER CARD */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E8E4DE] hover:shadow-md transition-shadow lg:col-span-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🥗</span>
              <h3 className="font-bold text-[#29272D] text-lg">AI Diet Tracker</h3>
            </div>
            <p className="text-[#7A7880] text-sm mb-4">Log daily habits for hormone recommendations.</p>

            {!aiTip ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2 space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#7A7880] uppercase tracking-wider">What did you eat today?</label>
                    <textarea
                      className="w-full mt-1 p-2.5 text-sm border border-[#E8E4DE] rounded-xl bg-[#FAFAFA] focus:ring-1 focus:ring-[#8B7BB5] outline-none resize-none"
                      rows="2"
                      placeholder="Jaise: College canteen se maggi aur cold drink..."
                      value={diet}
                      onChange={(e) => setDiet(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-[#7A7880] uppercase tracking-wider">Sleep</label>
                      <select
                        className="w-full mt-1 p-2 text-sm border border-[#E8E4DE] rounded-xl bg-[#FAFAFA] focus:ring-1 focus:ring-[#8B7BB5] outline-none text-[#29272D]"
                        value={sleep}
                        onChange={(e) => setSleep(e.target.value)}
                      >
                        <option value="< 6 hrs">{'<'} 6 hrs</option>
                        <option value="6-8 hours">6-8 hrs</option>
                        <option value="> 8 hrs">{'>'} 8 hrs</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#7A7880] uppercase tracking-wider">Stress</label>
                      <select
                        className="w-full mt-1 p-2 text-sm border border-[#E8E4DE] rounded-xl bg-[#FAFAFA] focus:ring-1 focus:ring-[#8B7BB5] outline-none text-[#29272D]"
                        value={stress}
                        onChange={(e) => setStress(e.target.value)}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    onClick={fetchPersonalizedPlan}
                    disabled={loading || !diet}
                    className="w-full bg-[#29272D] text-white py-3 rounded-xl font-medium hover:bg-[#3f3c44] transition-colors disabled:opacity-60 text-sm"
                  >
                    {loading ? "Generating..." : "Get AI Recommendation"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="bg-[#F4F2F7] border border-[#E3DEEA] p-3 rounded-xl text-xs text-[#29272D] leading-relaxed mb-3 shadow-inner">
                  <div className="font-bold text-[#8B7BB5] mb-1 text-[10px] uppercase tracking-wider">✨ AI Insight</div>
                  {aiTip}
                </div>
                <button
                  onClick={() => setAiTip(null)}
                  className="w-full bg-white border border-[#E8E4DE] text-[#29272D] py-2 rounded-xl font-medium hover:bg-[#FAFAFA] transition-colors text-xs"
                >
                  Log Another Meal
                </button>
              </div>
            )}
          </div>

          {/* 5. DAILY QUICK LOGS */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E8E4DE] hover:shadow-md transition-shadow lg:col-span-3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#29272D] flex items-center gap-2">
                📝 Daily Quick Logs
              </h2>
              {isAllGoalsDone && (
                <span className="text-xs font-bold bg-[#EAE6F4] text-[#8B7BB5] px-3 py-1 rounded-full animate-bounce">
                  🥳 All Goals Crushed!
                </span>
              )}
            </div>

            {isAllGoalsDone && (
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 text-white p-3 rounded-2xl mb-4 text-center font-bold text-sm shadow-md animate-pulse">
                🎉 Woohoo! You Completed All Your Daily Goals Today! 🥳 🎊
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Water Tracker */}
              <div className={`transition-all duration-300 rounded-2xl p-4 flex flex-col justify-between border ${
                isWaterDone 
                  ? 'bg-gradient-to-b from-emerald-50 to-teal-50 border-emerald-300 shadow-sm' 
                  : 'bg-[#FAF9F6] border-[#E8E4DE]'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{isWaterDone ? '🎉' : '💧'}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isWaterDone ? 'bg-emerald-200 text-emerald-800' : 'bg-[#EAE6F4] text-[#8B7BB5]'
                    }`}>
                      {isWaterDone ? '🎉 Target Reached!' : '1 Glass every ~2 hrs'}
                    </span>
                  </div>
                  <p className="font-bold text-[#29272D] text-sm">Water Intake</p>
                  <p className="text-2xl font-extrabold text-[#8B7BB5] mt-1">
                    {waterCount} <span className="text-xs font-normal text-[#7A7880]">/ 8 Glasses</span>
                  </p>

                  <div className="mt-3">
                    <p className="text-[10px] font-bold text-[#7A7880] uppercase tracking-wider mb-1.5">Schedule (8 AM - 10 PM)</p>
                    <div className="grid grid-cols-4 gap-1">
                      {waterSchedule.map((time, index) => {
                        const isDrank = waterCount > index;
                        return (
                          <div 
                            key={index} 
                            className={`text-center p-1 rounded-lg border text-[9px] font-semibold transition-all ${
                              isDrank 
                                ? 'bg-[#8B7BB5] text-white border-[#8B7BB5]' 
                                : 'bg-white text-[#7A7880] border-[#E8E4DE]'
                            }`}
                          >
                            {isDrank ? '✅' : time}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex gap-1.5 mt-4">
                  <button
                    onClick={handleAddWater}
                    disabled={isWaterDone}
                    className={`flex-1 text-xs font-medium py-2 rounded-xl transition-colors ${
                      isWaterDone ? 'bg-emerald-600 text-white cursor-default' : 'bg-[#29272D] text-white hover:bg-black'
                    }`}
                  >
                    {isWaterDone ? 'Goal Complete!' : '+1 Glass'}
                  </button>
                  <button
                    onClick={() => setWaterCount(0)}
                    className="px-2 border border-[#E8E4DE] text-[#7A7880] text-xs rounded-xl hover:bg-white"
                    title="Reset"
                  >
                    ↺
                  </button>
                </div>
              </div>

              {/* Exercise Tracker */}
              <div className={`transition-all duration-300 rounded-2xl p-4 flex flex-col justify-between border ${
                isExerciseDone 
                  ? 'bg-gradient-to-b from-emerald-50 to-teal-50 border-emerald-300 shadow-sm' 
                  : 'bg-[#FAF9F6] border-[#E8E4DE]'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{isExerciseDone ? '🏋️‍♀️' : '🏃‍♀️'}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isExerciseDone ? 'bg-emerald-200 text-emerald-800' : 'bg-[#EAE6F4] text-[#8B7BB5]'
                    }`}>
                      {isExerciseDone ? '🎉 Target Reached!' : 'Target: 30m'}
                    </span>
                  </div>
                  <p className="font-bold text-[#29272D] text-sm">Exercise</p>
                  <p className="text-2xl font-extrabold text-[#8B7BB5] mt-1">
                    {exerciseMins} <span className="text-xs font-normal text-[#7A7880]">Mins</span>
                  </p>
                </div>
                <div className="flex gap-1.5 mt-4">
                  <button
                    onClick={() => setExerciseMins(prev => prev + 15)}
                    className={`flex-1 text-xs font-medium py-2 rounded-xl transition-colors ${
                      isExerciseDone ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-[#29272D] text-white hover:bg-black'
                    }`}
                  >
                    +15 m
                  </button>
                  <button
                    onClick={() => setExerciseMins(0)}
                    className="px-2 border border-[#E8E4DE] text-[#7A7880] text-xs rounded-xl hover:bg-white"
                    title="Reset"
                  >
                    ↺
                  </button>
                </div>
              </div>

              {/* Sleep Tracker */}
              <div className={`transition-all duration-300 rounded-2xl p-4 flex flex-col justify-between border ${
                isSleepDone 
                  ? 'bg-gradient-to-b from-emerald-50 to-teal-50 border-emerald-300 shadow-sm' 
                  : 'bg-[#FAF9F6] border-[#E8E4DE]'
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{isSleepDone ? '✨' : '😴'}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSleepDone ? 'bg-emerald-200 text-emerald-800' : 'bg-[#EAE6F4] text-[#8B7BB5]'
                    }`}>
                      {isSleepDone ? '🎉 Target Reached!' : 'Target: 8h'}
                    </span>
                  </div>
                  <p className="font-bold text-[#29272D] text-sm">Sleep</p>
                  <p className="text-2xl font-extrabold text-[#8B7BB5] mt-1">
                    {loggedSleep} <span className="text-xs font-normal text-[#7A7880]">Hours</span>
                  </p>
                </div>
                <div className="flex gap-1.5 mt-4">
                  <button
                    onClick={() => setLoggedSleep(prev => (prev >= 12 ? 0 : prev + 1))}
                    className={`flex-1 text-xs font-medium py-2 rounded-xl transition-colors ${
                      isSleepDone ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-[#29272D] text-white hover:bg-black'
                    }`}
                  >
                    +1 Hour
                  </button>
                  <button
                    onClick={() => setLoggedSleep(0)}
                    className="px-2 border border-[#E8E4DE] text-[#7A7880] text-xs rounded-xl hover:bg-white"
                    title="Reset"
                  >
                    ↺
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: HEALTH ANALYTICS & TRENDS CHARTS                         */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'analytics' && (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-[#E8E4DE] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#8B7BB5] flex items-center justify-center text-2xl font-bold">
                🎯
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#7A7880] uppercase tracking-wider">Health Consistency</p>
                <p className="text-xl font-extrabold text-[#29272D]">88% <span className="text-xs font-semibold text-emerald-600">↑ High</span></p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#E8E4DE] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-2xl font-bold">
                🩸
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#7A7880] uppercase tracking-wider">Avg Cycle Length</p>
                <p className="text-xl font-extrabold text-[#29272D]">{cycleLength} Days</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#E8E4DE] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-bold">
                💊
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#7A7880] uppercase tracking-wider">Med Adherence</p>
                <p className="text-xl font-extrabold text-[#29272D]">
                  {medications.length > 0 ? Math.round((medications.filter(m => m.taken).length / medications.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E8E4DE]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-[#29272D] text-base flex items-center gap-2">
                    💧 Weekly Water Intake Chart
                  </h3>
                  <p className="text-xs text-[#7A7880] mt-0.5">Target: 8 Glasses / Day</p>
                </div>
                <span className="text-xs font-bold text-[#8B7BB5] bg-purple-50 px-2.5 py-1 rounded-full">
                  7 Days History
                </span>
              </div>

              <div className="flex items-end justify-between h-44 pt-4 px-2 border-b border-[#E8E4DE]">
                {weeklyWaterData.map((item, idx) => {
                  const heightPercentage = Math.min((item.glasses / 8) * 100, 100);
                  const isGoalMet = item.glasses >= 8;

                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                      <span className="text-[10px] font-bold text-[#7A7880]">{item.glasses}g</span>
                      <div className="w-full max-w-[28px] bg-slate-100 rounded-t-xl h-32 flex items-end overflow-hidden">
                        <div 
                          style={{ height: `${heightPercentage}%` }}
                          className={`w-full transition-all duration-500 rounded-t-xl ${
                            isGoalMet 
                              ? 'bg-gradient-to-t from-emerald-400 to-teal-500' 
                              : 'bg-gradient-to-t from-[#8B7BB5] to-purple-400'
                          }`}
                        />
                      </div>
                      <span className={`text-[11px] font-semibold ${item.day === 'Today' ? 'text-[#8B7BB5] font-extrabold' : 'text-[#7A7880]'}`}>
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E8E4DE]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-[#29272D] text-base flex items-center gap-2">
                    📊 Top Symptom Trends
                  </h3>
                  <p className="text-xs text-[#7A7880] mt-0.5">Most frequent logs in past 30 days</p>
                </div>
                <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full">
                  Month Overview
                </span>
              </div>

              <div className="space-y-4">
                {symptomAnalytics.map((sym, idx) => {
                  const maxCount = 7;
                  const widthPercent = Math.min((sym.count / maxCount) * 100, 100);

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-[#29272D]">{sym.name}</span>
                        <span className="text-[#7A7880]">{sym.count} Times</span>
                      </div>
                      <div className="w-full bg-[#FAF9F6] h-3 rounded-full overflow-hidden border border-[#E8E4DE]">
                        <div 
                          style={{ width: `${widthPercent}%` }}
                          className={`h-full ${sym.color} rounded-full transition-all duration-500`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="bg-gradient-to-r from-purple-900 to-[#29272D] text-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="bg-purple-500/30 text-purple-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                💡 Monthly Health Summary
              </span>
              <h3 className="text-xl font-bold">Aapka Overall Habit Flow Healthy Hai!</h3>
              <p className="text-xs text-purple-200 max-w-xl leading-relaxed">
                Aapne iss hafte water targets 5/7 days acheive kiye hain. Luteal phase ke dauran mild cramps log hue hain, jiske liye hydrated rahna aur warm tea lena continuous rakhein.
              </p>
            </div>
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className="bg-white text-[#29272D] hover:bg-purple-50 font-bold px-6 py-3 rounded-2xl text-xs transition-all whitespace-nowrap shadow-sm"
            >
              Back to Today's Logs ➔
            </button>
          </div>

        </div>
      )}

      {/* ── 📄 FEATURE 5: DOCTOR MEDICAL PDF REPORT MODAL ── */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E4DE] max-h-[90vh] overflow-y-auto relative">
            
            <button
              onClick={() => setShowPdfModal(false)}
              className="no-print absolute top-4 right-4 text-[#7A7880] hover:text-[#29272D] font-bold text-lg bg-[#FAF9F6] w-8 h-8 rounded-full flex items-center justify-center border border-[#E8E4DE]"
            >
              ✕
            </button>

            {/* Printable Container */}
            <div id="printable-doctor-report" className="space-y-6">
              
              {/* Report Header */}
              <div className="border-b border-[#E8E4DE] pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-[#29272D] flex items-center gap-2">
                    🩺 Gynecological & Hormonal Health Summary
                  </h2>
                  <p className="text-xs text-[#7A7880] mt-1">Generated via Self-Care Health Tracker App</p>
                </div>
                <div className="text-right">
                  <span className="bg-purple-100 text-[#8B7BB5] text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                    Patient Clinical Summary
                  </span>
                  <p className="text-xs text-[#7A7880] mt-2">Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Patient Basic Profile */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#FAF9F6] p-4 rounded-2xl border border-[#E8E4DE] text-xs">
                <div>
                  <p className="text-[#7A7880] font-semibold">Patient Name</p>
                  <p className="font-bold text-[#29272D]">{user?.name || 'User Profile'}</p>
                </div>
                <div>
                  <p className="text-[#7A7880] font-semibold">Cycle Phase</p>
                  <p className="font-bold text-[#8B7BB5]">{currentPhase}</p>
                </div>
                <div>
                  <p className="text-[#7A7880] font-semibold">Overall Status</p>
                  <p className={`font-bold ${symptomStatus === 'Needs Attention' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {symptomStatus}
                  </p>
                </div>
              </div>

              {/* Cycle & Symptom Summary Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#7A7880] uppercase tracking-wider">1. Menstrual Cycle Overview</h4>
                <div className="border border-[#E8E4DE] rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#7A7880]">Last Period Start Date:</span>
                    <span className="font-bold text-[#29272D]">{lastDate || 'Not Configured'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7A7880]">Average Cycle Duration:</span>
                    <span className="font-bold text-[#29272D]">{cycleLength} Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7A7880]">Logged Period Flow Today:</span>
                    <span className="font-bold text-[#8B7BB5]">{selectedFlow}</span>
                  </div>
                </div>
              </div>

              {/* Logged Symptoms Section */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#7A7880] uppercase tracking-wider">2. Logged Physical & Mental Symptoms</h4>
                <div className="border border-[#E8E4DE] rounded-2xl p-4 text-xs space-y-2">
                  <p className="text-[#7A7880]">Symptoms reported in recent journal entries:</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {loggedSymptomsList.length > 0 ? (
                      loggedSymptomsList.map((sym, i) => (
                        <span key={i} className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg font-semibold">
                          {sym}
                        </span>
                      ))
                    ) : (
                      <span className="text-[#7A7880] italic">No acute symptoms reported today.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Supplements Section */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#7A7880] uppercase tracking-wider">3. Active Medications & Supplements</h4>
                <div className="border border-[#E8E4DE] rounded-2xl p-4 text-xs">
                  {medications.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {medications.map((m) => (
                        <li key={m.id} className="text-[#29272D]">
                          <span className="font-bold">{m.name}</span> — {m.time} schedule ({m.taken ? 'Taken Today' : 'Pending'})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[#7A7880] italic">No active supplements added in app.</p>
                  )}
                </div>
              </div>

              {/* Doctor Note Disclaimer */}
              <p className="text-[10px] text-[#7A7880] italic border-t border-[#E8E4DE] pt-3">
                Note: This document is an aggregated summary of patient-reported self-tracking logs intended solely to assist clinical consultations.
              </p>

            </div>

            {/* Action Buttons (Hidden on Print) */}
            <div className="no-print mt-6 flex gap-3">
              <button
                onClick={handlePrintPdf}
                className="flex-1 bg-[#8B7BB5] hover:bg-[#726496] text-white font-bold py-3 rounded-2xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>🖨️ Save as PDF / Print Report</span>
              </button>
              <button
                onClick={() => setShowPdfModal(false)}
                className="border border-[#E8E4DE] text-[#7A7880] hover:text-[#29272D] px-5 py-3 rounded-2xl text-xs font-semibold"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── SOS RELIEF MODAL POPUP ── */}
      {showSosModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-rose-100 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowSosModal(false)}
              className="absolute top-4 right-4 text-[#7A7880] hover:text-[#29272D] font-bold text-lg bg-[#FAF9F6] w-8 h-8 rounded-full flex items-center justify-center border border-[#E8E4DE]"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🌸</span>
              <div>
                <h3 className="text-xl font-bold text-[#29272D]">SOS Cramp Relief Box</h3>
                <p className="text-xs text-[#7A7880]">Quick natural steps for instant comfort</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-2xl flex items-start gap-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-xs font-bold text-rose-900">Heat Therapy (Most Effective)</p>
                  <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                    Lower abdomen par 15-20 min ke liye Hot Water Bag rakhein. Heat pelvic muscles ko relax karti hai.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-2xl flex items-start gap-3">
                <span className="text-2xl">🧘‍♀️</span>
                <div>
                  <p className="text-xs font-bold text-amber-900">Gentle Stretch (Child's Pose)</p>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Ghutno ke bal baith kar aage jhukin (Child’s Pose). Isse lower back aur pelvic pressure instantly release hota hai.
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl flex items-start gap-3">
                <span className="text-2xl">🍵</span>
                <div>
                  <p className="text-xs font-bold text-emerald-900">Warm Ginger or Chamomile Tea</p>
                  <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                    Adrak ki chai anti-inflammatory hoti hai. Cold drinks aur caffeinated coffee se door rahein.
                  </p>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-100 p-3.5 rounded-2xl flex items-start gap-3">
                <span className="text-2xl">🫁</span>
                <div>
                  <p className="text-xs font-bold text-purple-900">4-7-8 Pain Release Breathing</p>
                  <p className="text-[11px] text-purple-800 mt-0.5 leading-relaxed">
                    4 sec tak naak se saans lein ➔ 7 sec hold karein ➔ 8 sec tak munh se slowly exhale karein. 4 baar repeat karein.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSosModal(false)}
              className="w-full mt-6 bg-[#29272D] text-white font-semibold py-3 rounded-xl text-xs hover:bg-black transition-colors"
            >
              I Feel Better Now / Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}