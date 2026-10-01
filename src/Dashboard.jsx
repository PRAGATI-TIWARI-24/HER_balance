import React, { useState, useEffect, useCallback } from 'react';
import html2pdf from 'html2pdf.js';

// ── Safe Supabase Client Import ──
import { supabase, isSupabaseConfigured } from './supabaseClient';

// ── Native Background Notifications Import ──
import { 
  requestNotificationPermission, 
  sendInstantNotification, 
  scheduleDailyReminder 
} from './NotificationService';

export default function Dashboard({ user, onLogout }) {
  
  // ─── LocalStorage Key Prefix / User ID ───
  const userKey = String(user?.id || user?.email || 'guest_user');
  const todayDateStr = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

  // ─── Main View Navigation Tab ───
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'analytics'

  // ─── Cloud Sync Status Indicator ───
  const [syncStatus, setSyncStatus] = useState('Local Mode 💾');

  // ─── Clinical Doctor PDF Modal State ───
  const [showPdfModal, setShowPdfModal] = useState(false);

  // ─── Push Notification State ───
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // ─── SOS Emergency Contact States ───
  const [sosContactName, setSosContactName] = useState(() => {
    return localStorage.getItem(`${userKey}_sosContactName`) || '';
  });
  const [sosContactNumber, setSosContactNumber] = useState(() => {
    return localStorage.getItem(`${userKey}_sosContactNumber`) || '';
  });
  const [isEditingSosContact, setIsEditingSosContact] = useState(false);

  // ─── Lab Report Analyzer States ───
  const [showLabModal, setShowLabModal] = useState(false);
  const [labValues, setLabValues] = useState(() => {
    const saved = localStorage.getItem(`${userKey}_labValues`);
    return saved ? JSON.parse(saved) : { lh: '', fsh: '', testosterone: '', tsh: '' };
  });

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
    return Number(localStorage.getItem(`${userKey}_cycleLength`)) || 28;
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

  // ─── Dynamic Real Analytics States ───
  const [weeklyWaterData, setWeeklyWaterData] = useState([]);
  const [symptomAnalytics, setSymptomAnalytics] = useState([]);
  const [avgMedAdherence, setAvgMedAdherence] = useState(0);

  // Helper: Past 7 days structure
  const getLast7DaysTemplate = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = i === 0 ? 'Today' : days[d.getDay()];
      result.push({ date: dateStr, day: dayLabel, glasses: 0 });
    }
    return result;
  };

  // ── Real Data Fetch for Analytics & PDF History ──
  const fetchAnalyticsHistory = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      const template = getLast7DaysTemplate();
      template[template.length - 1].glasses = waterCount;
      setWeeklyWaterData(template);
      return;
    }

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDateStr = thirtyDaysAgo.toISOString().split('T')[0];

      const { data: historyLogs, error } = await supabase
        .from('daily_health_logs')
        .select('log_date, water_count, symptoms, medications')
        .eq('user_id', userKey)
        .gte('log_date', startDateStr)
        .order('log_date', { ascending: true });

      if (error || !historyLogs) return;

      // 1. Map 7-Day Water Graph
      const template = getLast7DaysTemplate();
      const waterMap = new Map();
      historyLogs.forEach(row => {
        waterMap.set(row.log_date, Number(row.water_count) || 0);
      });

      const populatedWater = template.map(slot => ({
        ...slot,
        glasses: slot.day === 'Today' ? waterCount : (waterMap.get(slot.date) || 0)
      }));
      setWeeklyWaterData(populatedWater);

      // 2. Real Multi-Day Symptom Analysis
      const counts = {};
      historyLogs.forEach(row => {
        const symList = Array.isArray(row.symptoms) ? row.symptoms : [];
        symList.forEach(s => {
          counts[s] = (counts[s] || 0) + 1;
        });
      });

      const palette = ['bg-rose-400', 'bg-amber-400', 'bg-purple-400', 'bg-teal-400', 'bg-indigo-400'];
      const sortedSymptoms = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count], index) => ({
          name,
          count,
          color: palette[index % palette.length]
        }));

      setSymptomAnalytics(sortedSymptoms);

      // 3. Real Medication Adherence
      let totalMeds = 0;
      let takenMeds = 0;
      historyLogs.forEach(row => {
        if (Array.isArray(row.medications)) {
          row.medications.forEach(m => {
            totalMeds++;
            if (m.taken) takenMeds++;
          });
        }
      });

      if (totalMeds > 0) {
        setAvgMedAdherence(Math.round((takenMeds / totalMeds) * 100));
      } else {
        setAvgMedAdherence(medications.length > 0 ? Math.round((medications.filter(m => m.taken).length / medications.length) * 100) : 0);
      }
    } catch (err) {
      console.error('Failed to aggregate analytics:', err);
    }
  }, [userKey, waterCount, medications]);

  // ════════════════════════════════════════════════════════════════
  // ── INITIAL DATA FETCH (PROFILE + TODAY'S ROW) ──
  // ════════════════════════════════════════════════════════════════
  useEffect(() => {
    requestNotificationPermission().then((granted) => {
      if (granted) setNotificationsEnabled(true);
    });

    const fetchAllData = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setSyncStatus('Local Mode 💾');
        fetchAnalyticsHistory();
        return;
      }

      try {
        setSyncStatus('Syncing... ⏳');

        // 1. Fetch Profile / Settings
        const { data: profileData } = await supabase
          .from('user_health_data')
          .select('*')
          .eq('user_id', userKey)
          .maybeSingle();

        if (profileData) {
          if (profileData.last_date) {
            setLastDate(profileData.last_date);
            setIsCycleSetup(true);
          }
          if (profileData.cycle_length) setCycleLength(profileData.cycle_length);
          if (profileData.symptom_status) setSymptomStatus(profileData.symptom_status);
          if (profileData.sos_name) setSosContactName(profileData.sos_name);
          if (profileData.sos_number) setSosContactNumber(profileData.sos_number);
          if (profileData.lab_values) setLabValues(profileData.lab_values);
        }

        // 2. Fetch Today's Daily Entry
        const { data: todayLog } = await supabase
          .from('daily_health_logs')
          .select('*')
          .eq('user_id', userKey)
          .eq('log_date', todayDateStr)
          .maybeSingle();

        if (todayLog) {
          if (todayLog.water_count !== undefined) setWaterCount(todayLog.water_count);
          if (todayLog.exercise_mins !== undefined) setExerciseMins(todayLog.exercise_mins);
          if (todayLog.logged_sleep !== undefined) setLoggedSleep(todayLog.logged_sleep);
          if (todayLog.symptoms) setLoggedSymptomsList(todayLog.symptoms);
          if (todayLog.medications) setMedications(todayLog.medications);
        }

        setSyncStatus('Cloud Synced ☁️');
        fetchAnalyticsHistory();
      } catch (err) {
        console.error('Fetch error:', err);
        setSyncStatus('Local Mode 💾');
      }
    };

    fetchAllData();
  }, [userKey, todayDateStr, fetchAnalyticsHistory]);

  // ════════════════════════════════════════════════════════════════
  // ── SAVE 1: PROFILE SETTINGS SYNC ──
  // ════════════════════════════════════════════════════════════════
  const pushProfileToSupabase = async (overrideData = {}) => {
    if (!isSupabaseConfigured || !supabase) {
      setSyncStatus('Local Mode 💾');
      return;
    }

    try {
      setSyncStatus('Saving... ⏳');
      const payload = {
        user_id: userKey,
        last_date: lastDate,
        cycle_length: Number(cycleLength),
        symptom_status: symptomStatus,
        sos_name: sosContactName,
        sos_number: sosContactNumber,
        lab_values: labValues,
        updated_at: new Date().toISOString(),
        ...overrideData
      };

      const { error } = await supabase
        .from('user_health_data')
        .upsert(payload, { onConflict: 'user_id' });

      if (!error) {
        setSyncStatus('Cloud Synced ☁️');
      } else {
        setSyncStatus('Local Mode 💾');
      }
    } catch (err) {
      console.error('Profile sync failed:', err);
      setSyncStatus('Local Mode 💾');
    }
  };

  // ════════════════════════════════════════════════════════════════
  // ── SAVE 2: TODAY'S DAILY LOG SYNC (HISTORICAL ROWS PRESERVED) ──
  // ════════════════════════════════════════════════════════════════
  const pushDailyLogToSupabase = async (overrideData = {}) => {
    if (!isSupabaseConfigured || !supabase) {
      setSyncStatus('Local Mode 💾');
      return;
    }

    try {
      setSyncStatus('Saving... ⏳');
      const dailyPayload = {
        user_id: userKey,
        log_date: todayDateStr,
        water_count: waterCount,
        exercise_mins: exerciseMins,
        logged_sleep: loggedSleep,
        symptoms: loggedSymptomsList,
        medications: medications,
        ...overrideData
      };

      const { error } = await supabase
        .from('daily_health_logs')
        .upsert(dailyPayload, { onConflict: 'user_id,log_date' });

      if (!error) {
        setSyncStatus('Cloud Synced ☁️');
        fetchAnalyticsHistory(); // Sync realtime graph
      } else {
        setSyncStatus('Local Mode 💾');
      }
    } catch (err) {
      console.error('Daily sync failed:', err);
      setSyncStatus('Local Mode 💾');
    }
  };

  // ── LocalStorage Synchronizations ──
  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem(`${userKey}_logDate`, today);
    localStorage.setItem(`${userKey}_waterCount`, waterCount);
    localStorage.setItem(`${userKey}_exerciseMins`, exerciseMins);
    localStorage.setItem(`${userKey}_loggedSleep`, loggedSleep);
  }, [waterCount, exerciseMins, loggedSleep, userKey]);

  useEffect(() => {
    const today = new Date().toDateString();
    localStorage.setItem(`${userKey}_medDate`, today);
    localStorage.setItem(`${userKey}_medications`, JSON.stringify(medications));
  }, [medications, userKey]);

  // ── Save Emergency Contact ──
  const handleSaveSosContact = (e) => {
    e.preventDefault();
    localStorage.setItem(`${userKey}_sosContactName`, sosContactName);
    localStorage.setItem(`${userKey}_sosContactNumber`, sosContactNumber);
    setIsEditingSosContact(false);
    pushProfileToSupabase({ sos_name: sosContactName, sos_number: sosContactNumber });
    alert("Emergency Contact details save ho gayi hain! 🌸");
  };

  // ── WhatsApp SOS ──
  const handleSendWhatsAppSos = () => {
    if (!sosContactNumber.trim()) {
      alert("Pehle apna emergency contact number add karein!");
      setIsEditingSosContact(true);
      return;
    }

    let cleanNumber = sosContactNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.length === 10) cleanNumber = '91' + cleanNumber;

    const message = encodeURIComponent(
      `Hi ${sosContactName || 'there'}, mujhe iss waqt severe PCOD cramps/pain ho raha hai aur help chahiye. Please check on me or help me get medication. (Sent via HerBalance App SOS Relief)`
    );

    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  // ── Direct Call SOS ──
  const handleMakeSosCall = () => {
    if (!sosContactNumber.trim()) {
      alert("Pehle apna emergency contact number add karein!");
      setIsEditingSosContact(true);
      return;
    }
    const cleanNumber = sosContactNumber.replace(/[^0-9+]/g, '');
    window.location.href = `tel:${cleanNumber}`;
  };

  // ── Save Lab Report ──
  const handleSaveLabValues = (e) => {
    e.preventDefault();
    localStorage.setItem(`${userKey}_labValues`, JSON.stringify(labValues));
    pushProfileToSupabase({ lab_values: labValues });
    alert("Lab test report values save ho gayi hain! 🌸");
  };

  // ── Lab Report Calculations ──
  const lhNum = parseFloat(labValues.lh);
  const fshNum = parseFloat(labValues.fsh);
  const testNum = parseFloat(labValues.testosterone);
  const tshNum = parseFloat(labValues.tsh);

  const lhFshRatio = (lhNum && fshNum) ? (lhNum / fshNum).toFixed(1) : null;
  const isRatioHigh = lhFshRatio && parseFloat(lhFshRatio) >= 2.0;
  const isTestosteroneHigh = testNum && testNum > 45;
  const isTshAbnormal = tshNum && (tshNum < 0.4 || tshNum > 4.5);

  // ── Setup Reminders ──
  const handleSetupReminders = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationsEnabled(true);
      await sendInstantNotification(
        "Reminders Enabled! 🔔",
        "Aapko daily routine, water aur medicine ke timely background reminders milte rahenge. 🌸"
      );
      await scheduleDailyReminder(
        101, 
        "HerBalance Morning Routine 🌸", 
        "Good morning! Don't forget your daily water intake, supplements, and mood check.", 
        9, 
        0
      );
      alert("Reminders Setup Done! Roz subah 9:00 AM ka background reminder set ho gaya hai. 🌸");
    } else {
      alert("Notification permission allow nahi hui. Device settings se permission enable karein.");
    }
  };

  const triggerNotification = async (title, body) => {
    try {
      await sendInstantNotification(title, body);
    } catch (e) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body });
      }
    }
  };

  const handleAddMedication = (e) => {
    e.preventDefault();
    if (!newMedName.trim()) return;
    const newMed = {
      id: Date.now(),
      name: newMedName.trim(),
      time: newMedTime,
      taken: false
    };
    const updated = [...medications, newMed];
    setMedications(updated);
    setNewMedName('');
    pushDailyLogToSupabase({ medications: updated });
    triggerNotification("New Medicine Added 💊", `${newMed.name} ko aapke daily schedule me add kar diya gaya hai.`);
  };

  const handleToggleMed = (id) => {
    const updated = medications.map(m => {
      if (m.id === id) {
        const updatedState = !m.taken;
        if (updatedState) {
          triggerNotification("Medicine Logged! ✅", `Shabash! Aapne ${m.name} dose complete kar li.`);
        }
        return { ...m, taken: updatedState };
      }
      return m;
    });
    setMedications(updated);
    pushDailyLogToSupabase({ medications: updated });
  };

  const handleDeleteMed = (id) => {
    const updated = medications.filter(m => m.id !== id);
    setMedications(updated);
    pushDailyLogToSupabase({ medications: updated });
  };

  const isWaterDone = waterCount >= 8;
  const isExerciseDone = exerciseMins >= 30;
  const isSleepDone = loggedSleep >= 8;
  const isAllGoalsDone = isWaterDone && isExerciseDone && isSleepDone;

  const handleAddWater = () => {
    if (waterCount < 8) {
      const nextCount = waterCount + 1;
      setWaterCount(nextCount);
      pushDailyLogToSupabase({ water_count: nextCount });
      if (nextCount === 8) {
        triggerNotification("🎉 Hydro Goal Crushed!", "Aapne aaj ke 8 glasses water target poora kar liya!");
      }
    }
  };

  // ── Cycle Tracker Logic ──
  let daysRemainingText = "-- Days";
  let currentPhase = "Follicular";
  let delayDays = 0;
  let smartInsight = {
    badge: "Normal Rhythm",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    tip: "Aapka cycle on track hai. Hydration aur regular sleep maintain rakhein."
  };

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
      if (currentPhase === "Luteal") {
        smartInsight = {
          badge: "Luteal Prep 🌸",
          color: "text-purple-700 bg-purple-50 border-purple-200",
          tip: "Period aane wala hai. Warm fluids lein, sodium intake control karein taaki bloating na ho."
        };
      } else if (currentPhase === "Ovulation") {
        smartInsight = {
          badge: "Ovulation Window ✨",
          color: "text-teal-700 bg-teal-50 border-teal-200",
          tip: "Energy peak par rehti hai. Light strength workout aur fiber-rich foods helpful rahenge."
        };
      }
    } else if (diffDays === 0) {
      daysRemainingText = "Today";
      smartInsight = {
        badge: "Due Today 🩸",
        color: "text-rose-700 bg-rose-50 border-rose-200",
        tip: "Aaj period expected hai. Warm water bag aur loose comfortable wear ready rakhein."
      };
    } else {
      delayDays = Math.abs(diffDays);
      daysRemainingText = `${delayDays} Days Late`;

      if (delayDays <= 14) {
        smartInsight = {
          badge: "Mild PCOD Delay ⚠️",
          color: "text-amber-800 bg-amber-50 border-amber-200",
          tip: `${delayDays} din delay common hai PCOD mein. Cortisol/stress kam karein, chamomile tea aur gentle yoga follow karein.`
        };
      } else {
        smartInsight = {
          badge: "Missed Cycle Alert 🚨",
          color: "text-rose-800 bg-rose-50 border-rose-200",
          tip: `Period ${delayDays} din se zyada late hai. Gynecologist se consultation aur ultrasound/hormone checkup schedule karein.`
        };
      }
    }
  }

  const saveCycleDetails = (date, length) => {
    setLastDate(date);
    setCycleLength(length);
    setIsCycleSetup(true);

    localStorage.setItem(`${userKey}_lastDate`, date);
    localStorage.setItem(`${userKey}_cycleLength`, length);
    localStorage.setItem(`${userKey}_isCycleSetup`, 'true');

    pushProfileToSupabase({ last_date: date, cycle_length: Number(length) });
  };

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSaveSymptomJournal = () => {
    let updatedStatus = 'Tracked';

    if (selectedFlow !== 'None') {
      saveCycleDetails(todayDateStr, cycleLength);
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

    pushProfileToSupabase({ symptom_status: updatedStatus });
    pushDailyLogToSupabase({ symptoms: selectedSymptoms });

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
      setAiTip("Backend connect nahi hua. Server status check karein.");
    }
    setLoading(false);
  };

  const handlePrintPdf = () => {
    const element = document.getElementById('printable-doctor-report');
    if (!element) {
      alert("Report content load nahi hua!");
      return;
    }

    const opt = {
      margin:       [8, 8, 8, 8],
      filename:     `HerBalance_Clinical_Report_${user?.name || 'Patient'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-4 md:p-8 animate-in fade-in duration-500 relative">
      
      {/* ── Header Section ── */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 mt-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#29272D]">
              Hello, <span className="text-[#8B7BB5]">{user?.name || 'Beautiful'}</span> 🌸
            </h1>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              syncStatus.includes('Cloud Synced') 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : syncStatus.includes('Syncing') 
                  ? 'bg-amber-50 text-amber-700 border-amber-200' 
                  : 'bg-slate-100 text-[#7A7880] border-[#E8E4DE]'
            }`}>
              {syncStatus}
            </span>
          </div>
          <p className="text-[#7A7880] mt-1 text-sm">
            Date: <b>{todayDateStr}</b> • Daily History & Health Tracker
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowLabModal(true)}
            className="bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            🧪 Lab Analyzer
          </button>

          <button
            onClick={() => setShowPdfModal(true)}
            className="bg-[#29272D] text-white hover:bg-black px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            📄 Doctor PDF Report
          </button>

          <button
            onClick={handleSetupReminders}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 border ${
              notificationsEnabled 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-purple-50 text-[#8B7BB5] border-purple-200 hover:bg-purple-100'
            }`}
          >
            {notificationsEnabled ? '🔔 Reminders Active' : '🔔 Setup Reminders'}
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
          onClick={() => {
            setActiveTab('analytics');
            fetchAnalyticsHistory();
          }}
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
                  <p className={`text-3xl font-extrabold ${daysRemainingText.includes('Late') ? 'text-rose-600' : 'text-[#8B7BB5]'}`}>
                    {daysRemainingText}
                  </p>
                  <p className="text-xs text-[#8B7BB5] font-semibold mt-2">
                    Phase: <span className="underline font-bold">{currentPhase}</span>
                  </p>
                </div>

                <div className={`p-3 rounded-2xl border text-xs leading-relaxed space-y-1 ${smartInsight.color}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] uppercase tracking-wider">{smartInsight.badge}</span>
                  </div>
                  <p className="text-[11px] opacity-90">{smartInsight.tip}</p>
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
                      placeholder="Jaise: Sprouted salad, nuts, aur green tea..."
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
                📝 Daily Quick Logs ({todayDateStr})
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
                    onClick={() => { setWaterCount(0); pushDailyLogToSupabase({ water_count: 0 }); }}
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
                    <span className="text-2xl">{isExerciseDone ? '🏋️‍♀' : '🏃‍♀️'}</span>
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
                    onClick={() => {
                      const next = exerciseMins + 15;
                      setExerciseMins(next);
                      pushDailyLogToSupabase({ exercise_mins: next });
                    }}
                    className={`flex-1 text-xs font-medium py-2 rounded-xl transition-colors ${
                      isExerciseDone ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-[#29272D] text-white hover:bg-black'
                    }`}
                  >
                    +15 m
                  </button>
                  <button
                    onClick={() => { setExerciseMins(0); pushDailyLogToSupabase({ exercise_mins: 0 }); }}
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
                    onClick={() => {
                      const next = loggedSleep >= 12 ? 0 : loggedSleep + 1;
                      setLoggedSleep(next);
                      pushDailyLogToSupabase({ logged_sleep: next });
                    }}
                    className={`flex-1 text-xs font-medium py-2 rounded-xl transition-colors ${
                      isSleepDone ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-[#29272D] text-white hover:bg-black'
                    }`}
                  >
                    +1 Hour
                  </button>
                  <button
                    onClick={() => { setLoggedSleep(0); pushDailyLogToSupabase({ logged_sleep: 0 }); }}
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
      {/* TAB 2: HEALTH ANALYTICS & TRENDS (REAL DATA FROM SUPABASE)      */}
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
                <p className="text-xl font-extrabold text-[#29272D]">
                  {weeklyWaterData.filter(d => d.glasses >= 8).length >= 4 ? '88% High' : '72% Normal'}
                </p>
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
                <p className="text-xl font-extrabold text-[#29272D]">{avgMedAdherence}%</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Real 7-Day Water Chart */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E8E4DE]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-[#29272D] text-base flex items-center gap-2">
                    💧 7-Day Water Intake Chart
                  </h3>
                  <p className="text-xs text-[#7A7880] mt-0.5">Target: 8 Glasses / Day (Live History)</p>
                </div>
                <span className="text-xs font-bold text-[#8B7BB5] bg-purple-50 px-2.5 py-1 rounded-full">
                  Real Supabase Logs
                </span>
              </div>

              <div className="flex items-end justify-between h-44 pt-4 px-2 border-b border-[#E8E4DE]">
                {weeklyWaterData.length > 0 ? (
                  weeklyWaterData.map((item, idx) => {
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
                  })
                ) : (
                  <p className="text-xs text-[#7A7880] text-center w-full py-8">Loading history...</p>
                )}
              </div>
            </div>

            {/* Real Symptom Trends */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E8E4DE]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-[#29272D] text-base flex items-center gap-2">
                    📊 Top Symptom Trends
                  </h3>
                  <p className="text-xs text-[#7A7880] mt-0.5">Most frequent symptoms from daily history</p>
                </div>
                <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full">
                  History Overview
                </span>
              </div>

              <div className="space-y-4">
                {symptomAnalytics.length > 0 ? (
                  symptomAnalytics.map((sym, idx) => {
                    const maxCount = Math.max(...symptomAnalytics.map(s => s.count), 1);
                    const widthPercent = Math.min((sym.count / maxCount) * 100, 100);

                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-[#29272D]">{sym.name}</span>
                          <span className="text-[#7A7880]">{sym.count} {sym.count === 1 ? 'Time' : 'Times'}</span>
                        </div>
                        <div className="w-full bg-[#FAF9F6] h-3 rounded-full overflow-hidden border border-[#E8E4DE]">
                          <div 
                            style={{ width: `${widthPercent}%` }}
                            className={`h-full ${sym.color} rounded-full transition-all duration-500`}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-xs text-[#7A7880]">Abhi tak symptoms history log nahi hui hai.</p>
                    <p className="text-[10px] text-[#8B7BB5] mt-1">Roz journal save karein taaki real trends generate ho sakein.</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="bg-gradient-to-r from-purple-900 to-[#29272D] text-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="bg-purple-500/30 text-purple-200 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                💡 Monthly Health Summary
              </span>
              <h3 className="text-xl font-bold">Real-time History Sync Active</h3>
              <p className="text-xs text-purple-200 max-w-xl leading-relaxed">
                Aapka database roz ka record maintain kar raha hai. Daily logs se graph automatically adjust hota rahega.
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

      {/* ── 📄 FEATURE 5: CLINICAL DOCTOR MEDICAL PDF REPORT MODAL ── */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E8E4DE] max-h-[92vh] overflow-y-auto relative">
            
            <button
              onClick={() => setShowPdfModal(false)}
              className="no-print absolute top-4 right-4 text-[#7A7880] hover:text-[#29272D] font-bold text-lg bg-[#FAF9F6] w-8 h-8 rounded-full flex items-center justify-center border border-[#E8E4DE]"
            >
              ✕
            </button>

            {/* ── Printable Report Container ── */}
            <div id="printable-doctor-report" className="p-4 bg-white text-[#29272D] font-sans space-y-5">
              
              {/* Clinical Header */}
              <div className="border-b-2 border-[#8B7BB5] pb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🩺</span>
                    <h2 className="text-xl font-extrabold text-[#29272D] uppercase tracking-wide">
                      HerBalance Clinical Health Summary
                    </h2>
                  </div>
                  <p className="text-[11px] text-[#7A7880] mt-0.5">
                    Continuous Hormonal Pattern & Lifestyle Tracking Record (Rotterdam PCOD Reference)
                  </p>
                </div>
                <div className="text-right">
                  <span className="bg-purple-100 text-[#8B7BB5] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Confidential Report
                  </span>
                  <p className="text-[11px] text-[#7A7880] mt-1.5 font-medium">Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>

              {/* Patient Demographics & Profile Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF9F6] p-3.5 rounded-2xl border border-[#E8E4DE] text-xs">
                <div>
                  <p className="text-[10px] font-bold text-[#7A7880] uppercase">Patient Identifier</p>
                  <p className="font-bold text-[#29272D] text-sm mt-0.5">{user?.name || userKey}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#7A7880] uppercase">Menstrual Phase</p>
                  <p className="font-bold text-[#8B7BB5] text-sm mt-0.5">{currentPhase}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#7A7880] uppercase">Current Rhythm</p>
                  <p className={`font-bold text-sm mt-0.5 ${daysRemainingText.includes('Late') ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {daysRemainingText}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#7A7880] uppercase">Clinical Status</p>
                  <p className={`font-bold text-sm mt-0.5 ${symptomStatus === 'Needs Attention' ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {symptomStatus}
                  </p>
                </div>
              </div>

              {/* Section 1: Endocrine & Metabolic Biomarkers */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#29272D] uppercase tracking-wider flex items-center gap-1.5">
                  <span>1. Laboratory Endocrine Profile (Blood Biomarkers)</span>
                </h4>
                
                <table className="w-full text-left border-collapse border border-[#E8E4DE] rounded-xl overflow-hidden text-xs">
                  <thead className="bg-[#F4F2F7] text-[#29272D] font-bold border-b border-[#E8E4DE]">
                    <tr>
                      <th className="p-2.5">Biomarker</th>
                      <th className="p-2.5">Logged Value</th>
                      <th className="p-2.5">Clinical Reference Range</th>
                      <th className="p-2.5">Diagnostic Inference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E4DE]">
                    <tr>
                      <td className="p-2.5 font-semibold text-[#29272D]">LH : FSH Ratio</td>
                      <td className="p-2.5 font-bold">{lhFshRatio ? `${lhFshRatio} : 1` : 'Not Logged'}</td>
                      <td className="p-2.5 text-[#7A7880]">1:1 (Follicular phase)</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isRatioHigh ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isRatioHigh ? 'Elevated (PCOD Marker)' : (lhFshRatio ? 'Normal' : 'Pending')}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-[#29272D]">Total Testosterone</td>
                      <td className="p-2.5 font-bold">{testNum ? `${testNum} ng/dL` : 'Not Logged'}</td>
                      <td className="p-2.5 text-[#7A7880]">15 - 45 ng/dL</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isTestosteroneHigh ? 'bg-rose-100 text-rose-900' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isTestosteroneHigh ? 'Hyperandrogenemia' : (testNum ? 'Normal Range' : 'Pending')}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-[#29272D]">Thyroid (TSH)</td>
                      <td className="p-2.5 font-bold">{tshNum ? `${tshNum} uIU/mL` : 'Not Logged'}</td>
                      <td className="p-2.5 text-[#7A7880]">0.4 - 4.5 uIU/mL</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isTshAbnormal ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isTshAbnormal ? 'Borderline / Abnormal' : (tshNum ? 'Euthyroid' : 'Pending')}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Section 2: Menstrual Cycle Overview */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#29272D] uppercase tracking-wider">
                  2. Menstrual Pattern & Cycle Dynamics
                </h4>
                <div className="grid grid-cols-3 gap-3 border border-[#E8E4DE] rounded-xl p-3 text-xs bg-[#FAF9F6]">
                  <div>
                    <span className="text-[#7A7880] block text-[10px] uppercase font-bold">LMP (Last Period)</span>
                    <span className="font-bold text-[#29272D] text-xs">{lastDate || 'Not Configured'}</span>
                  </div>
                  <div>
                    <span className="text-[#7A7880] block text-[10px] uppercase font-bold">Reported Cycle Length</span>
                    <span className="font-bold text-[#29272D] text-xs">{cycleLength} Days {cycleLength > 35 ? '(Oligomenorrhea Risk)' : '(Normal Window)'}</span>
                  </div>
                  <div>
                    <span className="text-[#7A7880] block text-[10px] uppercase font-bold">Latest Logged Flow</span>
                    <span className="font-bold text-[#8B7BB5] text-xs">{selectedFlow}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Aggregate Symptoms & Patient Trends */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#29272D] uppercase tracking-wider">
                  3. Symptom Incidence (Database Multi-Day History)
                </h4>
                <div className="border border-[#E8E4DE] rounded-xl p-3.5 text-xs space-y-2.5">
                  <div className="flex flex-wrap gap-2">
                    {symptomAnalytics.length > 0 ? (
                      symptomAnalytics.map((sym, idx) => (
                        <span key={idx} className="bg-rose-50 border border-rose-200 text-rose-800 px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                          <span>{sym.name}</span>
                          <span className="bg-rose-200/80 px-1.5 py-0.2 rounded text-[10px] font-extrabold">{sym.count}x</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-[#7A7880] italic">No repeated symptom history recorded in current logging cycle.</span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#7A7880]">
                    *Frequency reflects automated aggregation from daily patient-reported logs over active 30-day tracking windows.
                  </p>
                </div>
              </div>

              {/* Section 4: Prescriptions & Daily Compliance */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#29272D] uppercase tracking-wider flex justify-between items-center">
                  <span>4. Prescribed Medication & Supplement Compliance</span>
                  <span className="text-[#8B7BB5] font-bold text-[11px]">Overall Adherence: {avgMedAdherence}%</span>
                </h4>
                <div className="border border-[#E8E4DE] rounded-xl p-3 text-xs">
                  {medications.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {medications.map((m) => (
                        <div key={m.id} className="flex justify-between items-center bg-[#FAF9F6] p-2 rounded-lg border border-[#E8E4DE]">
                          <div>
                            <span className="font-bold text-[#29272D]">{m.name}</span>
                            <span className="text-[10px] text-[#7A7880] block">Schedule: {m.time}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.taken ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-[#7A7880]'
                          }`}>
                            {m.taken ? 'Taken' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#7A7880] italic">No active supplements or medications listed by patient.</p>
                  )}
                </div>
              </div>

              {/* Clinical Verification & Emergency Caregiver Footer */}
              <div className="border-t-2 border-[#E8E4DE] pt-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-[#7A7880] uppercase">Designated Emergency Caregiver</p>
                  <p className="font-bold text-[#29272D] mt-0.5">{sosContactName || 'Not Set'} ({sosContactNumber || 'N/A'})</p>
                  <p className="text-[9px] text-[#7A7880] mt-1 leading-tight">
                    Disclaimer: This computer-generated summary compiles self-reported digital logs. It does not replace formal pathology diagnostics.
                  </p>
                </div>
                <div className="text-right flex flex-col justify-end">
                  <div className="inline-block border-b border-dashed border-[#7A7880] w-48 ml-auto mb-1"></div>
                  <p className="text-[10px] font-bold text-[#7A7880] uppercase">Consulting Gynecologist Signature / Stamp</p>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="no-print mt-6 flex gap-3">
              <button
                onClick={handlePrintPdf}
                className="flex-1 bg-[#8B7BB5] hover:bg-[#726496] text-white font-bold py-3 rounded-2xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>🖨️ Download / Print Clinical PDF</span>
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

      {/* ── 🧪 LAB REPORT VALUE ANALYZER MODAL ── */}
      {showLabModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-teal-100 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowLabModal(false)}
              className="absolute top-4 right-4 text-[#7A7880] hover:text-[#29272D] font-bold text-lg bg-[#FAF9F6] w-8 h-8 rounded-full flex items-center justify-center border border-[#E8E4DE]"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🧪</span>
              <div>
                <h3 className="text-xl font-bold text-[#29272D]">PCOD Lab Report Checker</h3>
                <p className="text-xs text-[#7A7880]">Apne latest blood test values compare karein</p>
              </div>
            </div>

            <form onSubmit={handleSaveLabValues} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#7A7880] uppercase">LH (mIU/mL)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 11.2"
                    value={labValues.lh}
                    onChange={(e) => setLabValues({ ...labValues, lh: e.target.value })}
                    className="w-full mt-1 p-2 text-xs border border-[#E8E4DE] rounded-xl outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <span className="text-[9px] text-[#7A7880]">Normal: 2 - 10</span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#7A7880] uppercase">FSH (mIU/mL)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 5.1"
                    value={labValues.fsh}
                    onChange={(e) => setLabValues({ ...labValues, fsh: e.target.value })}
                    className="w-full mt-1 p-2 text-xs border border-[#E8E4DE] rounded-xl outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <span className="text-[9px] text-[#7A7880]">Normal: 3 - 8</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#7A7880] uppercase">Testosterone (ng/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 52.0"
                    value={labValues.testosterone}
                    onChange={(e) => setLabValues({ ...labValues, testosterone: e.target.value })}
                    className="w-full mt-1 p-2 text-xs border border-[#E8E4DE] rounded-xl outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <span className="text-[9px] text-[#7A7880]">Normal: 15 - 45</span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#7A7880] uppercase">TSH (Thyroid) (uIU/mL)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 2.8"
                    value={labValues.tsh}
                    onChange={(e) => setLabValues({ ...labValues, tsh: e.target.value })}
                    className="w-full mt-1 p-2 text-xs border border-[#E8E4DE] rounded-xl outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <span className="text-[9px] text-[#7A7880]">Normal: 0.4 - 4.5</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#8B7BB5] hover:bg-[#726496] text-white py-2 rounded-xl text-xs font-semibold transition-colors mt-2"
              >
                Save Lab Values
              </button>
            </form>

            {(lhFshRatio || testNum || tshNum) && (
              <div className="mt-4 p-4 rounded-2xl bg-[#FAF9F6] border border-[#E8E4DE] space-y-2.5">
                <h4 className="text-[11px] font-bold text-[#29272D] uppercase tracking-wider">🔬 Clinical Insights</h4>
                
                {lhFshRatio && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#7A7880]">LH : FSH Ratio: <b>{lhFshRatio} : 1</b></span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isRatioHigh ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isRatioHigh ? 'Elevated (PCOD Marker)' : 'Normal (1:1)'}
                    </span>
                  </div>
                )}

                {testNum && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#7A7880]">Total Testosterone:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isTestosteroneHigh ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isTestosteroneHigh ? 'High (Androgen Excess)' : 'Normal'}
                    </span>
                  </div>
                )}

                {tshNum && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#7A7880]">Thyroid (TSH):</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isTshAbnormal ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isTshAbnormal ? 'Needs Attention' : 'Optimal'}
                    </span>
                  </div>
                )}

                <p className="text-[9px] text-[#7A7880] italic pt-1 border-t border-[#E8E4DE]">
                  *Yeh values reference ke liye hain. Final diagnosis ke liye Gynecologist se consult karein.
                </p>
              </div>
            )}

            <button
              onClick={() => setShowLabModal(false)}
              className="w-full mt-4 bg-[#29272D] text-white font-semibold py-2.5 rounded-xl text-xs hover:bg-black transition-colors"
            >
              Close
            </button>
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
                <p className="text-xs text-[#7A7880]">Quick natural steps & Emergency help</p>
              </div>
            </div>

            <div className="space-y-3">
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
                    4 sec tak naak se saans lein ➔ 7 sec hold karein ➔ 8 sec tak munh se slowly exhale karein.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚨</span>
                  <span className="text-xs font-bold text-rose-950 uppercase tracking-wider">Emergency Contact Center</span>
                </div>
                <button
                  onClick={() => setIsEditingSosContact(!isEditingSosContact)}
                  className="text-[11px] font-semibold text-[#8B7BB5] hover:underline"
                >
                  {isEditingSosContact ? 'Cancel' : (sosContactNumber ? 'Edit' : '+ Add Contact')}
                </button>
              </div>

              {isEditingSosContact ? (
                <form onSubmit={handleSaveSosContact} className="space-y-2 mt-2">
                  <input
                    type="text"
                    placeholder="Contact Name (e.g., Mom / Partner / Doctor)"
                    value={sosContactName}
                    onChange={(e) => setSosContactName(e.target.value)}
                    className="w-full p-2 text-xs border border-rose-200 rounded-xl bg-white outline-none focus:ring-1 focus:ring-rose-400"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="10-digit Phone Number"
                    value={sosContactNumber}
                    onChange={(e) => setSosContactNumber(e.target.value)}
                    className="w-full p-2 text-xs border border-rose-200 rounded-xl bg-white outline-none focus:ring-1 focus:ring-rose-400"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-[#8B7BB5] hover:bg-[#726496] text-white py-2 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Save Contact Details
                  </button>
                </form>
              ) : (
                <div className="mt-2 space-y-3">
                  {sosContactNumber ? (
                    <div className="flex items-center justify-between text-xs bg-white/70 p-2.5 rounded-xl border border-rose-100">
                      <div>
                        <p className="font-bold text-[#29272D]">{sosContactName || 'Emergency Contact'}</p>
                        <p className="text-[11px] text-[#7A7880]">{sosContactNumber}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Ready ✓
                      </span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-rose-700 italic">
                      Emergency contact set nahi hai. Severe cramps ke waqt turant alert bhejne ke liye contact add karein.
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={handleSendWhatsAppSos}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <span>💬 WhatsApp SOS</span>
                    </button>
                    
                    <button
                      onClick={handleMakeSosCall}
                      className="w-full bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <span>📞 Direct Call</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowSosModal(false)}
              className="w-full mt-5 bg-[#29272D] text-white font-semibold py-3 rounded-xl text-xs hover:bg-black transition-colors"
            >
              I Feel Better Now / Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}