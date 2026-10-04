import React, { useState, useEffect, useCallback, useRef } from 'react';
import html2pdf from 'html2pdf.js';

// ── Safe Supabase Client Import ──
import { supabase, isSupabaseConfigured } from './supabaseClient';

// ── Smart Multi-Interval Background & Web Notifications ──
import { 
  requestNotificationPermission, 
  sendInstantNotification, 
  setupSmartIntervalReminders,
  startWebIntervalEngine 
} from './NotificationService';

export default function Dashboard({ user, onLogout, onNewAssessment }) {
  
  // ─── LocalStorage Key Prefix / User ID ───
  const userKey = String(user?.id || user?.email || user?.name || 'guest_user');
  const todayDateStr = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

  // ─── Main View Navigation Tab ───
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'analytics'

  // ─── Cloud Sync Status Indicator ───
  const [syncStatus, setSyncStatus] = useState('Local Mode 💾');

  // ─── Clinical Doctor PDF Modal State ───
  const [showPdfModal, setShowPdfModal] = useState(false);

  // ─── Initial AI Risk Assessment Stored Report (Spot 2 Link) ───
  const [storedAiAssessment, setStoredAiAssessment] = useState(() => {
    try {
      const saved = localStorage.getItem('herbalance_last_assessment_report');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // ─── Push Notification State ───
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('herbalance_smart_reminders_enabled') === 'true';
  });

  // ─── Celebration Modal Popup State ───
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  // ─── 3-Day Hormone Calibration State ───
  const [calibrationDays, setCalibrationDays] = useState(() => {
    return Number(localStorage.getItem(`${userKey}_calibrationDays`)) || 1;
  });

  // ─── Seed Cycling Kit & Care Pass Subscription States ───
  const [showKitModal, setShowKitModal] = useState(false);
  const [showEngineBlogModal, setShowEngineBlogModal] = useState(false);
  
  const [kitSubscribed, setKitSubscribed] = useState(() => {
    return localStorage.getItem(`${userKey}_kitSubscribed`) === 'true';
  });

  // ─── Payment & UPI Configuration ───
  const UPI_ID = "pragati015tiwari@okhdfcbank"; 
  const PAYEE_NAME = "HerBalance";
  const PASS_AMOUNT = "20.00";

  const [checkoutStep, setCheckoutStep] = useState('address'); 
  const [utrInput, setUtrInput] = useState('');
  const [paymentPending, setPaymentPending] = useState(false);

  // Structured Address States
  const [subWhatsApp, setSubWhatsApp] = useState('');
  const [subHouseNo, setSubHouseNo] = useState('');
  const [subArea, setSubArea] = useState('');
  const [subLandmark, setSubLandmark] = useState('');
  const [subPincode, setSubPincode] = useState('');
  const [subCity, setSubCity] = useState('');
  const [subState, setSubState] = useState('');

  const upiLink = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${PASS_AMOUNT}&cu=INR&tn=${encodeURIComponent(`HerBalance Pass - ${user?.name || 'User'}`)}`;
  const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(upiLink)}&size=200&centerImageUrl=`;

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
    return localStorage.getItem(`${userKey}_lastDate`) || todayDateStr;
  });
  const [cycleLength, setCycleLength] = useState(() => {
    return Number(localStorage.getItem(`${userKey}_cycleLength`)) || 28;
  });
  const [isCycleSetup, setIsCycleSetup] = useState(() => {
    return Boolean(localStorage.getItem(`${userKey}_lastDate`));
  });

  const [isEditingCycle, setIsEditingCycle] = useState(false);

  const parseSavedDate = (dStr) => {
    if (!dStr) return { day: '01', month: '10', year: '2026' };
    const parts = dStr.split('-');
    if (parts.length === 3) {
      return { year: parts[0], month: parts[1], day: parts[2] };
    }
    return { day: '01', month: '10', year: '2026' };
  };

  const initialParsed = parseSavedDate(lastDate);
  const [selDay, setSelDay] = useState(initialParsed.day);
  const [selMonth, setSelMonth] = useState(initialParsed.month);
  const [selYear, setSelYear] = useState(initialParsed.year);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const userLockedDate = useRef(false);

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

  // ─── Target Evaluation ───
  const isWaterDone = waterCount >= 8;
  const isExerciseDone = exerciseMins >= 30;
  const isSleepDone = loggedSleep >= 8;
  const isAllGoalsDone = isWaterDone && isExerciseDone && isSleepDone;

  useEffect(() => {
    if (isAllGoalsDone) {
      const alreadyCelebrated = localStorage.getItem(`${userKey}_celebrated_${todayDateStr}`);
      if (!alreadyCelebrated) {
        setShowCelebrationModal(true);
        localStorage.setItem(`${userKey}_celebrated_${todayDateStr}`, 'true');
        sendInstantNotification("🥳 Daily Goals Crushed!", "Incredible consistency! Aaj ke saare lifestyle targets achieve ho gaye!");
      }
    }
  }, [isAllGoalsDone, userKey, todayDateStr]);

  // ─── Web Interval Engine Link ───
  useEffect(() => {
    if (notificationsEnabled) {
      startWebIntervalEngine(
        () => Number(localStorage.getItem(`${userKey}_waterCount`)) || 0,
        () => {
          const saved = localStorage.getItem(`${userKey}_medications`);
          return saved ? JSON.parse(saved) : [];
        }
      );
    }
  }, [notificationsEnabled, userKey]);

  // ─── Analytics Aggregation States ───
  const [weeklyWaterData, setWeeklyWaterData] = useState([]);
  const [symptomAnalytics, setSymptomAnalytics] = useState([]);
  const [avgMedAdherence, setAvgMedAdherence] = useState(0);

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

      const counts = {};
      historyLogs.forEach(row => {
        const symList = Array.isArray(row.symptoms) ? row.symptoms : [];
        symList.forEach(s => {
          counts[s] = (counts[s] || 0) + 1;
        });
      });

      const palette = ['bg-[#5B0015]', 'bg-[#80AEE8]', 'bg-[#720b22]', 'bg-[#5D93D8]', 'bg-[#450010]'];
      const sortedSymptoms = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count], index) => ({
          name,
          count,
          color: palette[index % palette.length]
        }));

      setSymptomAnalytics(sortedSymptoms);

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

  // ── Protected Initial Data Load ──
  useEffect(() => {
    const fetchAllData = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setSyncStatus('Local Mode 💾');
        fetchAnalyticsHistory();
        return;
      }

      try {
        setSyncStatus('Syncing... ⏳');

        const { data: profileData } = await supabase
          .from('user_health_data')
          .select('*')
          .eq('user_id', userKey)
          .maybeSingle();

        if (profileData) {
          if (!userLockedDate.current) {
            const savedLocal = localStorage.getItem(`${userKey}_lastDate`);
            if (savedLocal) {
              setLastDate(savedLocal);
              const p = parseSavedDate(savedLocal);
              setSelDay(p.day);
              setSelMonth(p.month);
              setSelYear(p.year);
              setIsCycleSetup(true);
            } else if (profileData.last_date) {
              setLastDate(profileData.last_date);
              const p = parseSavedDate(profileData.last_date);
              setSelDay(p.day);
              setSelMonth(p.month);
              setSelYear(p.year);
              setIsCycleSetup(true);
            }

            if (profileData.cycle_length) {
              setCycleLength(profileData.cycle_length);
            }
          }

          if (profileData.symptom_status) setSymptomStatus(profileData.symptom_status);
          if (profileData.sos_name) setSosContactName(profileData.sos_name);
          if (profileData.sos_number) setSosContactNumber(profileData.sos_number);
          if (profileData.lab_values) setLabValues(profileData.lab_values);
        }

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

  const pushProfileToSupabase = async (overrideData = {}) => {
    if (!isSupabaseConfigured || !supabase) {
      setSyncStatus('Local Mode 💾');
      return;
    }

    try {
      setSyncStatus('Saving... ⏳');
      const payload = {
        user_id: userKey,
        last_date: overrideData.last_date || lastDate,
        cycle_length: Number(overrideData.cycle_length || cycleLength),
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
        fetchAnalyticsHistory();
      } else {
        setSyncStatus('Local Mode 💾');
      }
    } catch (err) {
      console.error('Daily sync failed:', err);
      setSyncStatus('Local Mode 💾');
    }
  };

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

  const handleSaveSosContact = (e) => {
    e.preventDefault();
    localStorage.setItem(`${userKey}_sosContactName`, sosContactName);
    localStorage.setItem(`${userKey}_sosContactNumber`, sosContactNumber);
    setIsEditingSosContact(false);
    pushProfileToSupabase({ sos_name: sosContactName, sos_number: sosContactNumber });
    alert("Emergency Contact details save ho gayi hain! 🌸");
  };

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

  const handleMakeSosCall = () => {
    if (!sosContactNumber.trim()) {
      alert("Pehle apna emergency contact number add karein!");
      setIsEditingSosContact(true);
      return;
    }
    const cleanNumber = sosContactNumber.replace(/[^0-9+]/g, '');
    window.location.href = `tel:${cleanNumber}`;
  };

  const handleSaveLabValues = (e) => {
    e.preventDefault();
    localStorage.setItem(`${userKey}_labValues`, JSON.stringify(labValues));
    pushProfileToSupabase({ lab_values: labValues });
    alert("Lab test report values save ho gayi hain! 🌸");
  };

  const lhNum = parseFloat(labValues.lh);
  const fshNum = parseFloat(labValues.fsh);
  const testNum = parseFloat(labValues.testosterone);
  const tshNum = parseFloat(labValues.tsh);

  const lhFshRatio = (lhNum && fshNum) ? (lhNum / fshNum).toFixed(1) : null;
  const isRatioHigh = lhFshRatio && parseFloat(lhFshRatio) >= 2.0;
  const isTestosteroneHigh = testNum && testNum > 45;
  const isTshAbnormal = tshNum && (tshNum < 0.4 || tshNum > 4.5);

  const handleSetupReminders = async () => {
    const success = await setupSmartIntervalReminders();
    if (success) {
      setNotificationsEnabled(true);
      localStorage.setItem('herbalance_smart_reminders_enabled', 'true');
      await sendInstantNotification(
        "⚡ Smart Rhythm Reminders Activated!",
        "Har 2 ghante par water intake, meal aur sleep reminders set ho gaye hain. Koi target miss nahi hoga! 🌸"
      );
      alert("✓ Smart Reminders Active! Flipkart-style real-time alerts ab 8 AM se 10 PM har interval par target miss hote hi trigger honge.");
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

  // ── Cycle Math ──
  let daysRemainingText = "-- Days";
  let currentPhaseInternal = "Follicular";
  let isDelayed = false;
  let delayDays = 0;

  if (isCycleSetup && lastDate) {
    const parts = lastDate.split('-');
    if (parts.length === 3) {
      const lastPDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const nextDate = new Date(lastPDate);
      nextDate.setDate(lastPDate.getDate() + Number(cycleLength));

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const diffTime = nextDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const daysPassed = Math.floor((today.getTime() - lastPDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysPassed <= 5) currentPhaseInternal = "Flow Phase";
      else if (daysPassed <= 13) currentPhaseInternal = "Follicular";
      else if (daysPassed <= 16) currentPhaseInternal = "Ovulation";
      else currentPhaseInternal = "Luteal";

      if (diffDays > 0) {
        daysRemainingText = `${diffDays} Days`;
        isDelayed = false;
      } else if (diffDays === 0) {
        daysRemainingText = "Today";
        isDelayed = false;
      } else {
        if (isCycleSetup && localStorage.getItem(`${userKey}_lastDate`)) {
          delayDays = Math.abs(diffDays);
          daysRemainingText = `${delayDays} Days Late`;
          isDelayed = true;
        } else {
          daysRemainingText = "28 Days";
          isDelayed = false;
        }
      }
    }
  }

  const isCalibrationComplete = calibrationDays >= 3 || (isDelayed && isCycleSetup);

  // ── 🛡️ ZERO-LEAKAGE SEED PROTOCOL ENCRYPTION ──
  const isFollicularPhase = currentPhaseInternal === 'Follicular' || currentPhaseInternal === 'Flow Phase';
  const todaySeedData = isFollicularPhase
    ? {
        title: 'Phase 1: Follicular Rhythm Ritual 🌱',
        seeds: 'Flaxseeds + Pumpkin Seeds (1 tbsp each)',
        benefit: 'Rich in Lignans & Zinc to naturally modulate estrogen & encourage healthy ovulation.',
        color: 'border-[#80AEE8] bg-[#F7F2E0] text-[#5B0015]',
        badge: 'Estrogen Harmony'
      }
    : {
        title: 'Phase 2: Luteal Hormone Boost ✨',
        seeds: 'Sesame Seeds + Sunflower Seeds (1 tbsp each)',
        benefit: 'High in Selenium & Vitamin E to support progesterone and curb pre-period cramps.',
        color: 'border-[#5B0015] bg-[#F7F2E0] text-[#5B0015]',
        badge: 'Progesterone Boost'
      };

  // ── Step 1: Address Submit ──
  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    setCheckoutStep('payment');

    const addressPayload = {
      whatsapp: subWhatsApp,
      house_no: subHouseNo,
      area: subArea,
      landmark: subLandmark,
      pincode: subPincode,
      city: subCity,
      state: subState,
      pass_fee: 20,
      utr_number: '',
      payment_status: 'unpaid',
      dispatch_phase: currentPhaseInternal === 'Luteal' ? 'Phase 2: Luteal Seeds' : 'Phase 1: Follicular Seeds'
    };

    localStorage.setItem(`${userKey}_deliveryAddress`, JSON.stringify(addressPayload));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('kit_subscribers').insert([
          {
            user_id: userKey,
            ...addressPayload,
            created_at: new Date().toISOString()
          }
        ]);
      } catch (err) {
        console.error("Address save to Supabase:", err);
      }
    }
  };

  // ── Step 2: Real UTR Submission ──
  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!utrInput.trim() || utrInput.trim().length < 6) {
      alert("Kripya valid 12-digit UTR / UPI Reference Number enter karein.");
      return;
    }

    setPaymentPending(true);

    const fullOrderData = {
      whatsapp: subWhatsApp,
      house_no: subHouseNo,
      area: subArea,
      landmark: subLandmark,
      pincode: subPincode,
      city: subCity,
      state: subState,
      pass_fee: 20,
      utr_number: utrInput.trim(),
      payment_status: 'under_review',
      dispatch_phase: currentPhaseInternal === 'Luteal' ? 'Phase 2: Luteal Seeds' : 'Phase 1: Follicular Seeds'
    };

    localStorage.setItem(`${userKey}_kitSubscribed`, 'true');
    localStorage.setItem(`${userKey}_deliveryAddress`, JSON.stringify(fullOrderData));
    setKitSubscribed(true);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('kit_subscribers').upsert([
          {
            user_id: userKey,
            ...fullOrderData,
            created_at: new Date().toISOString()
          }
        ]);
      } catch (err) {
        console.error("Supabase sync:", err);
      }
    }

    setPaymentPending(false);
    setCheckoutStep('address');
    setShowKitModal(false);
    setUtrInput('');
    alert("🎉 Payment Details Received! Aapka HerBalance Care Pass review ke liye submit ho gaya hai.");
  };

  // ── Date Apply Handler ──
  const handleApplyCustomDate = (e) => {
    if (e) e.preventDefault();

    const formattedDate = `${selYear}-${selMonth.padStart(2, '0')}-${selDay.padStart(2, '0')}`;
    
    userLockedDate.current = true;
    localStorage.setItem(`${userKey}_lastDate`, formattedDate);
    localStorage.setItem(`${userKey}_cycleLength`, String(cycleLength));
    localStorage.setItem(`${userKey}_isCycleSetup`, 'true');

    setLastDate(formattedDate);
    setIsCycleSetup(true);
    setIsEditingCycle(false);

    pushProfileToSupabase({ last_date: formattedDate, cycle_length: Number(cycleLength) });

    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3500);
  };

  const setQuickDate = (d, m, y) => {
    setSelDay(d);
    setSelMonth(m);
    setSelYear(y);
  };

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  // ── Symptom Journal Save ──
  const handleSaveSymptomJournal = () => {
    let updatedStatus = 'Tracked';

    const highSeveritySymptoms = ['Severe Cramps', 'Heavy Bleeding', 'Migraine'];
    const hasHighSeverity = selectedSymptoms.some((s) => highSeveritySymptoms.includes(s));

    if (hasHighSeverity) {
      updatedStatus = 'Needs Attention';
      setShowSosModal(true);
      triggerNotification("🚨 High Discomfort Alert", "Severe symptoms log huye hain. SOS Relief Box open karke relief measures dekhein.");
    }

    setSymptomStatus(updatedStatus);
    setLoggedSymptomsList(selectedSymptoms);

    if (calibrationDays < 3) {
      const nextDays = calibrationDays + 1;
      setCalibrationDays(nextDays);
      localStorage.setItem(`${userKey}_calibrationDays`, String(nextDays));
    }

    localStorage.setItem(`${userKey}_symptomStatus`, updatedStatus);
    localStorage.setItem(`${userKey}_loggedSymptomsList`, JSON.stringify(selectedSymptoms));

    pushProfileToSupabase({ symptom_status: updatedStatus });
    pushDailyLogToSupabase({ symptoms: selectedSymptoms });

    setJournalSavedMsg(true);
    setTimeout(() => setJournalSavedMsg(false), 3000);
  };

  // Production Render Holistic Diet Check
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
    <div className="min-h-screen bg-[#F7F2E0] p-4 md:p-8 animate-in fade-in duration-500 relative text-[#5B0015]">
      
      {/* ── Header Section ── */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 mt-2">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-[#5B0015]">
              Hello, <span className="text-[#80AEE8]">{user?.name || 'Beautiful'}</span> 🌸
            </h1>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              syncStatus.includes('Cloud Synced') 
                ? 'bg-[#80AEE8]/20 text-[#5B0015] border-[#80AEE8]' 
                : 'bg-[#FCFBF5] text-[#5B0015]/70 border-[#EDE5CD]'
            }`}>
              {syncStatus}
            </span>
          </div>
          <p className="text-[#5B0015]/80 mt-1 text-sm font-medium">
            Date: <b>{todayDateStr}</b> • Your Private Health Sanctuary
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5">
          
          

          <button
            onClick={() => setShowLabModal(true)}
            className="bg-[#FCFBF5] border border-[#80AEE8] text-[#5B0015] hover:bg-[#80AEE8]/20 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            🧪 Lab Analyzer
          </button>

          <button
            onClick={() => setShowPdfModal(true)}
            className="bg-[#5B0015] text-[#F7F2E0] hover:bg-[#450010] px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            📄 Doctor PDF Report
          </button>

          <button
            onClick={handleSetupReminders}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 border cursor-pointer ${
              notificationsEnabled 
                ? 'bg-[#80AEE8] text-[#5B0015] border-[#80AEE8]' 
                : 'bg-[#FCFBF5] text-[#5B0015] border-[#EDE5CD] hover:border-[#80AEE8]'
            }`}
          >
            {notificationsEnabled ? '⚡ Reminders Active' : '🔔 Reminders'}
          </button>

          {/* ── 🚨 Standout SOS Cramp Button ── */}
          <button
            onClick={() => setShowSosModal(true)}
            className="bg-[#5B0015] text-[#F7F2E0] hover:bg-[#450010] hover:scale-105 active:scale-95 px-4 py-2 rounded-xl text-xs font-black transition-all shadow-lg shadow-[#5B0015]/25 border-2 border-[#80AEE8] flex items-center gap-1.5 cursor-pointer animate-pulse"
          >
            <span className="text-sm">🆘</span> Cramp SOS
          </button>

          <button 
            onClick={onLogout}
            className="border border-[#EDE5CD] text-[#5B0015] hover:border-[#5B0015] px-4 py-2 rounded-xl font-bold transition-colors bg-[#FCFBF5] shadow-sm text-xs cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* ── Tab Switcher ── */}
      <div className="max-w-6xl mx-auto mb-6 bg-[#FCFBF5] p-1.5 rounded-2xl border border-[#EDE5CD] flex gap-2 shadow-sm w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-[#5B0015] text-[#F7F2E0] shadow-sm'
              : 'text-[#5B0015]/70 hover:text-[#5B0015]'
          }`}
        >
          <span>🏠 Today's Dashboard</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('analytics');
            fetchAnalyticsHistory();
          }}
          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-[#80AEE8] text-[#5B0015] shadow-sm'
              : 'text-[#5B0015]/70 hover:text-[#5B0015]'
          }`}
        >
          <span>📊 Health Analytics & Trends</span>
        </button>
      </div>

      {/* ── 🌸 Empathetic Delay Trigger Banner ── */}
      {isDelayed && isCalibrationComplete && (
        <div className="max-w-6xl mx-auto mb-6 bg-[#FCFBF5] border border-[#EDE5CD] p-5 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="text-3xl p-2 bg-[#F7F2E0] rounded-2xl border border-[#EDE5CD]">🌿</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[#80AEE8] text-[#5B0015] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Gentle Rhythm Note
                </span>
                <span className="text-xs font-bold text-[#5B0015]">Period is {delayDays} Days Past Expected Date</span>
              </div>
              <h4 className="font-bold text-sm text-[#5B0015] mt-1">
                Fret not! PCOD mein 8-15 din ka delay bohot normal hai.
              </h4>
              <p className="text-xs text-[#5B0015]/75 mt-0.5 leading-relaxed max-w-2xl font-medium">
                Cortisol (stress), irregular sleep, ya follicular pause ki wajah se ovulation shift ho jata hai. Panic hone ki zaroorat nahi hai.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => setShowEngineBlogModal(true)}
              className="flex-1 md:flex-none bg-[#F7F2E0] hover:bg-white border border-[#EDE5CD] text-[#5B0015] font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              📖 Engine Kaise Kaam Karega?
            </button>
            <button
              onClick={() => setShowKitModal(true)}
              className="flex-1 md:flex-none bg-[#5B0015] hover:bg-[#450010] text-[#F7F2E0] font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              {kitSubscribed ? "✓ Protocol Active" : "Unlock Protocol (₹20)"}
            </button>
          </div>
        </div>
      )}

      {/* ── 🚨 Standout SOS Banner ── */}
      {symptomStatus === 'Needs Attention' && (
        <div className="max-w-6xl mx-auto mb-6 bg-[#5B0015] text-[#F7F2E0] border-2 border-[#80AEE8] p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-start gap-3">
            <span className="text-2xl p-2 bg-white/10 rounded-xl">🚨</span>
            <div>
              <p className="font-black text-sm text-[#F7F2E0]">Discomfort / Cramps Logged Today</p>
              <p className="text-xs text-[#F7F2E0]/85 font-medium">Need natural relief methods or emergency caregiver contact?</p>
            </div>
          </div>
          <button
            onClick={() => setShowSosModal(true)}
            className="bg-[#80AEE8] hover:bg-[#A5C7F0] text-[#5B0015] font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap cursor-pointer"
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
          
          {/* ── 🌟 Standout Calibration Card ── */}
          <div className="lg:col-span-3 rounded-3xl p-6 sm:p-7 relative overflow-hidden bg-[#5B0015] shadow-2xl border-2 border-[#80AEE8]/50 text-[#F7F2E0]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#80AEE8]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
              <div className="space-y-3 max-w-xl">
                
                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  {kitSubscribed ? (
                    <span className="bg-[#80AEE8] text-[#5B0015] text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      ✓ Active Care Protocol
                    </span>
                  ) : !isCalibrationComplete ? (
                    <span className="bg-[#F7F2E0] text-[#5B0015] text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-[#EDE5CD]">
                      🔬 Rhythm Calibration: Day {calibrationDays}/3
                    </span>
                  ) : (
                    <span className="bg-[#80AEE8] text-[#5B0015] text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      ⚠ Hormone Shift Signature Decoded
                    </span>
                  )}
                  <span className="text-xs text-[#80AEE8] font-bold tracking-wide">
                    • Natural Science Protocol
                  </span>
                </div>

                <p className="text-2xl sm:text-3xl font-black text-[#80AEE8] leading-tight tracking-wide">
                  PCOD Hormone Shift & Organic Seed Protocol 🌸
                </p>

                <p className="text-xs sm:text-sm text-[#F7F2E0] leading-relaxed font-semibold">
                  PCOD bodies standard 28-day cycle follow nahi karti. Hamara engine continuous daily logs se actual biological state decode karta hai.
                </p>

                {kitSubscribed ? (
                  <div className="mt-3 p-4 rounded-2xl bg-[#FCFBF5] border-2 border-[#80AEE8] flex items-start gap-3.5 shadow-md text-[#5B0015]">
                    <span className="text-3xl p-1 bg-[#F7F2E0] rounded-xl border border-[#EDE5CD]">🥣</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-xs font-black text-[#5B0015]">{todaySeedData.title}</p>
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#80AEE8] text-[#5B0015]">
                          {todaySeedData.badge}
                        </span>
                      </div>
                      <p className="text-xs font-extrabold text-[#5B0015] mt-1">{todaySeedData.seeds}</p>
                      <p className="text-[11px] text-[#5B0015]/85 mt-0.5 font-medium leading-relaxed">{todaySeedData.benefit}</p>
                    </div>
                  </div>
                ) : !isCalibrationComplete ? (
                  <div className="mt-3 p-4 rounded-2xl bg-black/40 border border-[#80AEE8]/50 backdrop-blur-md space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-[#FFFDF5]">Decoding Daily Hormone Variance</span>
                      <span className="font-mono text-[#80AEE8] font-black text-xs">
                        {Math.round((calibrationDays / 3) * 100)}% Complete
                      </span>
                    </div>
                    <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden p-0.5">
                      <div 
                        style={{ width: `${(calibrationDays / 3) * 100}%` }}
                        className="bg-[#80AEE8] h-full rounded-full transition-all duration-500 shadow-sm"
                      />
                    </div>
                    <p className="text-[11px] text-[#F7F2E0] font-semibold">
                      Roz symptoms aur water log karein. Day 3 par aapka natural biological shift signature evaluate hoga.
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 p-4 rounded-2xl bg-black/40 border-2 border-[#80AEE8] backdrop-blur-md flex items-center justify-between gap-4 shadow-inner">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 bg-[#80AEE8]/20 rounded-xl border border-[#80AEE8]/40">🔒</span>
                      <div>
                        <p className="text-xs font-black text-[#80AEE8] tracking-wide">
                          Hormone Shift Signature: Locked
                        </p>
                        <p className="text-[11px] text-[#FFFDF5] mt-0.5 font-semibold leading-relaxed">
                          Ovarian pause state detect hui hai. AI-proof protocol unlock karne ke liye Care Pass activate karein.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowEngineBlogModal(true)}
                      className="text-xs text-[#80AEE8] hover:text-white underline font-black shrink-0 cursor-pointer"
                    >
                      Read Logic ➔
                    </button>
                  </div>
                )}
              </div>

              {/* Right Side Call to Action */}
              <div className="bg-[#FCFBF5] text-[#5B0015] p-5 sm:p-6 rounded-3xl border-2 border-[#80AEE8] flex flex-col items-center text-center w-full lg:w-68 shrink-0 shadow-2xl">
                
                {kitSubscribed ? (
                  <div className="space-y-2 py-2">
                    <span className="text-3xl">✨</span>
                    <p className="text-sm font-black text-[#5B0015]">Protocol Active</p>
                    <p className="text-[11px] text-[#5B0015]/75 font-semibold">Doorstep kit dispatch queue enabled.</p>
                  </div>
                ) : !isCalibrationComplete ? (
                  <div className="space-y-2 py-1 w-full">
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#5B0015]/70 bg-[#80AEE8]/25 px-2.5 py-0.5 rounded-md">
                      Engine Calibrating
                    </span>
                    <div className="my-2 flex flex-col items-center">
                      <span className="text-3xl font-black text-[#5B0015]">Day {calibrationDays}</span>
                      <span className="text-[11px] text-[#5B0015]/75 font-bold">of 3 Days Logging</span>
                    </div>
                    <p className="text-[11px] text-[#5B0015]/80 mb-3 leading-relaxed font-semibold">
                      Daily logs se aapki body ka baseline rhythm lock ho raha hai.
                    </p>
                    <div className="w-full bg-[#80AEE8]/20 border border-[#80AEE8] py-2 rounded-xl text-xs font-black text-[#5B0015]">
                      🔒 Analysis in Progress
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="text-[10px] uppercase font-black text-[#5B0015]/70 tracking-wider">
                      One-Time Activation
                    </span>
                    <div className="flex items-baseline gap-1 my-1">
                      <span className="text-4xl font-black text-[#5B0015]">₹20</span>
                      <span className="text-xs text-[#5B0015]/70 font-bold">only</span>
                    </div>
                    <p className="text-[11px] text-[#5B0015] font-extrabold mb-3">
                      ✓ Instant UPI • No recurring debit
                    </p>

                    <button
                      onClick={() => setShowKitModal(true)}
                      className="w-full bg-[#5B0015] hover:bg-[#450010] text-[#F7F2E0] font-black py-3 rounded-xl text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
                    >
                      Unlock Signature (₹20 Pass) ➔
                    </button>
                  </>
                )}

              </div>
            </div>
          </div>

          {/* 1. Cycle Tracker Card */}
          <div className="bg-[#FCFBF5] p-6 rounded-3xl shadow-sm border border-[#EDE5CD]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-[#5B0015] flex items-center gap-2">
                🩸 Cycle Rhythm
              </h2>
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                symptomStatus === 'Needs Attention' 
                  ? 'bg-[#5B0015] text-[#F7F2E0] animate-pulse' 
                  : 'bg-[#80AEE8]/30 text-[#5B0015]'
              }`}>
                {symptomStatus}
              </span>
            </div>

            {(!isCycleSetup || isEditingCycle) ? (
              <form onSubmit={handleApplyCustomDate} className="bg-[#F7F2E0] rounded-2xl p-4 border border-[#EDE5CD] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#5B0015]">Pick Your Period Start Date</span>
                  {isCycleSetup && (
                    <button
                      type="button"
                      onClick={() => setIsEditingCycle(false)}
                      className="text-[11px] font-bold text-[#5B0015]/70 hover:text-[#5B0015] cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div>
                  <span className="text-[10px] text-[#5B0015]/70 font-bold uppercase tracking-wider block mb-1">
                    Quick Pick (September Presets):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['10', '15', '20'].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setQuickDate(d, '09', '2026')}
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-[#80AEE8]/40 hover:bg-[#80AEE8] text-[#5B0015] font-black transition-all cursor-pointer"
                      >
                        ⚡ {d} September
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#5B0015]/70 uppercase tracking-wider block mb-1">
                    Select Day, Month & Year:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <select
                        value={selDay}
                        onChange={(e) => setSelDay(e.target.value)}
                        className="w-full p-2 text-xs border border-[#EDE5CD] rounded-xl bg-white font-bold text-[#5B0015] outline-none"
                      >
                        {Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0')).map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <select
                        value={selMonth}
                        onChange={(e) => setSelMonth(e.target.value)}
                        className="w-full p-2 text-xs border border-[#80AEE8]/40 bg-white rounded-xl font-bold text-[#5B0015] outline-none"
                      >
                        <option value="01">Jan (01)</option>
                        <option value="02">Feb (02)</option>
                        <option value="03">Mar (03)</option>
                        <option value="04">Apr (04)</option>
                        <option value="05">May (05)</option>
                        <option value="06">Jun (06)</option>
                        <option value="07">Jul (07)</option>
                        <option value="08">Aug (08)</option>
                        <option value="09">Sep (09)</option>
                        <option value="10">Oct (10) 🌸</option>
                        <option value="11">Nov (11)</option>
                        <option value="12">Dec (12)</option>
                      </select>
                    </div>

                    <div>
                      <select
                        value={selYear}
                        onChange={(e) => setSelYear(e.target.value)}
                        className="w-full p-2 text-xs border border-[#EDE5CD] rounded-xl bg-white font-bold text-[#5B0015] outline-none"
                      >
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#5B0015]/70 uppercase tracking-wider block">
                    Average Cycle Length (Days)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="120"
                    required
                    className="w-full mt-1 p-2 text-xs border border-[#EDE5CD] rounded-xl bg-white font-bold text-[#5B0015] outline-none"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(Number(e.target.value))}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#5B0015] hover:bg-[#450010] text-[#F7F2E0] py-2.5 rounded-xl text-xs font-black transition-all shadow-md active:scale-[0.99] cursor-pointer"
                >
                  Save Date Permanently 🌸
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-[#F7F2E0] rounded-2xl p-5 text-center border border-[#EDE5CD]">
                  <p className="text-xs text-[#5B0015]/70 font-bold uppercase tracking-wider mb-1">Cycle Projection</p>
                  <p className="text-3xl font-black text-[#5B0015]">
                    {daysRemainingText}
                  </p>
                  <p className="text-[11px] text-[#5B0015]/80 mt-1.5 font-medium">
                    Last Period Started: <b className="text-[#5B0015] bg-white px-2.5 py-0.5 rounded-lg border border-[#EDE5CD]">{lastDate}</b>
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-[#EDE5CD]">
                    {kitSubscribed ? (
                      <p className="text-xs text-[#5B0015] font-bold">
                        Biological Phase: <span className="underline">{currentPhaseInternal}</span>
                      </p>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => setShowEngineBlogModal(true)}
                        className="text-[11px] text-[#5B0015]/80 hover:text-[#5B0015] font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer"
                      >
                        <span>🔒 Biological Phase: <b>Encrypted</b></span>
                        <span className="text-[#80AEE8] underline">Unlock Pass</span>
                      </button>
                    )}
                  </div>
                </div>

                {loggedSymptomsList.length > 0 && (
                  <div className="bg-[#F7F2E0] p-3 rounded-xl border border-[#EDE5CD]">
                    <p className="text-[10px] font-bold text-[#5B0015]/70 uppercase mb-1.5">Today's Logged Symptoms:</p>
                    <div className="flex flex-wrap gap-1">
                      {loggedSymptomsList.map((s, idx) => (
                        <span key={idx} className="bg-[#80AEE8]/40 text-[#5B0015] text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs px-1 text-[#5B0015]/80 font-medium">
                  <span>Cycle Length: <b>{cycleLength} Days</b></span>
                  <button 
                    type="button"
                    onClick={() => setIsEditingCycle(true)} 
                    className="font-black text-[#80AEE8] hover:underline cursor-pointer"
                  >
                    Edit Date
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Symptom Journal Block */}
          <div className="bg-[#FCFBF5] p-6 rounded-3xl shadow-sm border border-[#EDE5CD] space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-[#5B0015] flex items-center gap-2">
                🌸 Symptom Journal
              </h2>
              <span className="text-[10px] text-[#5B0015]/70 font-bold uppercase tracking-wider">Daily Feed</span>
            </div>

            <div>
              <p className="text-[11px] font-bold text-[#5B0015]/70 uppercase tracking-wider mb-1.5">Period Flow Today:</p>
              <div className="flex gap-1.5">
                {flowOptions.map((f) => (
                  <button
                    key={f}
                    onClick={() => setSelectedFlow(f)}
                    className={`flex-1 py-1 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      selectedFlow === f
                        ? 'bg-[#5B0015] text-[#F7F2E0] border-[#5B0015] shadow-sm'
                        : 'bg-[#F7F2E0] text-[#5B0015] border-[#EDE5CD] hover:border-[#80AEE8]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-[#5B0015]/70 uppercase tracking-wider mb-1.5">Physical Discomfort:</p>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {symptomOptions.map((s) => {
                  const active = selectedSymptoms.includes(s);
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSymptom(s)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                        active
                          ? 'bg-[#80AEE8] text-[#5B0015] shadow-sm border border-[#80AEE8]'
                          : 'bg-[#F7F2E0] text-[#5B0015]/80 border border-[#EDE5CD] hover:border-[#80AEE8]'
                      }`}
                    >
                      {s} {active ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-[#5B0015]/70 uppercase tracking-wider mb-1.5">Mood & Emotional Balance:</p>
              <div className="flex flex-wrap gap-1.5">
                {moodOptions.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMood(m)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedMood === m
                        ? 'bg-[#5B0015] text-[#F7F2E0] border-[#5B0015] shadow-sm'
                        : 'bg-[#F7F2E0] text-[#5B0015] border-[#EDE5CD] hover:border-[#80AEE8]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveSymptomJournal}
              className="w-full bg-[#5B0015] hover:bg-[#450010] text-[#F7F2E0] font-black py-2.5 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
            >
              {journalSavedMsg ? '✓ Journal Logged & Saved!' : 'Save & Sync Tracker'}
            </button>
          </div>

          {/* 3. Medication & Supplement Tracker */}
          <div className="bg-[#FCFBF5] p-6 rounded-3xl shadow-sm border border-[#EDE5CD] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-black text-[#5B0015] flex items-center gap-2">
                  💊 Meds & Supplements
                </h2>
                <span className="text-[10px] font-black bg-[#80AEE8]/30 text-[#5B0015] px-2.5 py-0.5 rounded-full">
                  {medications.filter(m => m.taken).length} / {medications.length} Done
                </span>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1 mb-3">
                {medications.length === 0 ? (
                  <p className="text-xs text-[#5B0015]/60 text-center py-4">No medications added yet.</p>
                ) : (
                  medications.map((m) => (
                    <div 
                      key={m.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                        m.taken 
                          ? 'bg-[#80AEE8]/20 border-[#80AEE8]/40 line-through text-[#5B0015]/60' 
                          : 'bg-[#F7F2E0] border-[#EDE5CD] text-[#5B0015]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleMed(m.id)}
                          className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-xs transition-colors cursor-pointer ${
                            m.taken ? 'bg-[#5B0015] text-[#F7F2E0]' : 'border border-[#EDE5CD] bg-white'
                          }`}
                        >
                          {m.taken ? '✓' : ''}
                        </button>
                        <div>
                          <span className="font-bold block">{m.name}</span>
                          <span className="text-[10px] text-[#5B0015]/70">{m.time}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMed(m.id)}
                        className="text-[#5B0015]/60 hover:text-[#5B0015] text-xs px-1 font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <form onSubmit={handleAddMedication} className="pt-2 border-t border-[#EDE5CD]">
              <p className="text-[10px] font-bold text-[#5B0015]/70 uppercase tracking-wider mb-1.5">+ Add Supplement / Med</p>
              <div className="flex gap-1.5 mb-1.5">
                <input
                  type="text"
                  placeholder="Medicine name..."
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="flex-1 p-2 text-xs border border-[#EDE5CD] rounded-xl bg-white outline-none focus:ring-1 focus:ring-[#80AEE8] text-[#5B0015]"
                />
                <select
                  value={newMedTime}
                  onChange={(e) => setNewMedTime(e.target.value)}
                  className="p-2 text-xs border border-[#EDE5CD] rounded-xl bg-white outline-none text-[#5B0015] font-bold"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Night">Night</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={!newMedName.trim()}
                className="w-full bg-[#5B0015] hover:bg-[#450010] text-[#F7F2E0] text-xs font-bold py-2 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                Add Medicine
              </button>
            </form>
          </div>

          {/* 4. AI Diet Tracker Card */}
          <div className="bg-[#FCFBF5] p-6 rounded-3xl shadow-sm border border-[#EDE5CD] lg:col-span-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🥗</span>
              <h3 className="font-bold text-[#5B0015] text-lg">AI Diet & Hormone Balance</h3>
            </div>
            <p className="text-[#5B0015]/75 text-sm mb-4">Log daily food & sleep habits for customized hormone recommendations.</p>

            {!aiTip ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2 space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#5B0015]/70 uppercase tracking-wider">What did you eat today?</label>
                    <textarea
                      className="w-full mt-1 p-2.5 text-sm border border-[#EDE5CD] rounded-xl bg-white focus:ring-1 focus:ring-[#80AEE8] outline-none resize-none text-[#5B0015]"
                      rows="2"
                      placeholder="Jaise: Sprouted salad, nuts, aur green tea..."
                      value={diet}
                      onChange={(e) => setDiet(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-[#5B0015]/70 uppercase tracking-wider">Sleep</label>
                      <select
                        className="w-full mt-1 p-2 text-sm border border-[#EDE5CD] rounded-xl bg-white outline-none text-[#5B0015] font-bold"
                        value={sleep}
                        onChange={(e) => setSleep(e.target.value)}
                      >
                        <option value="< 6 hrs">{'<'} 6 hrs</option>
                        <option value="6-8 hours">6-8 hrs</option>
                        <option value="> 8 hrs">{'>'} 8 hrs</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#5B0015]/70 uppercase tracking-wider">Stress Level</label>
                      <select
                        className="w-full mt-1 p-2 text-sm border border-[#EDE5CD] rounded-xl bg-white outline-none text-[#5B0015] font-bold"
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
                    className="w-full bg-[#5B0015] text-[#F7F2E0] py-3 rounded-xl font-bold hover:bg-[#450010] transition-colors disabled:opacity-60 text-sm cursor-pointer"
                  >
                    {loading ? "Generating..." : "Get AI Recommendation"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="bg-[#F7F2E0] border border-[#EDE5CD] p-3 rounded-xl text-xs text-[#5B0015] leading-relaxed mb-3">
                  <div className="font-bold text-[#80AEE8] mb-1 text-[10px] uppercase tracking-wider">✨ AI Insight</div>
                  {aiTip}
                </div>
                <button
                  onClick={() => setAiTip(null)}
                  className="w-full bg-white border border-[#EDE5CD] text-[#5B0015] py-2 rounded-xl font-bold hover:bg-[#F7F2E0] text-xs cursor-pointer"
                >
                  Log Another Meal
                </button>
              </div>
            )}
          </div>

          {/* ── 5. DAILY QUICK LOGS (SPOT 3: CONTEXTUAL DELAY ALERTS INTEGRATED) ── */}
          <div className="bg-[#FCFBF5] p-6 rounded-3xl shadow-sm border border-[#EDE5CD] lg:col-span-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-[#5B0015] flex items-center gap-2">
                    📝 Daily Quick Logs ({todayDateStr})
                  </h2>
                  {isDelayed && isCalibrationComplete && (
                    <span className="bg-[#80AEE8] text-[#5B0015] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Cycle Delay Protocol Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#5B0015]/70 font-medium">Keep daily habits consistent for healthy hormones.</p>
              </div>

              {isAllGoalsDone && (
                <button
                  onClick={() => setShowCelebrationModal(true)}
                  className="bg-[#5B0015] text-[#F7F2E0] border-2 border-[#80AEE8] px-4 py-2 rounded-2xl text-xs font-black shadow-lg flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-all animate-bounce"
                >
                  <span>🏆</span>
                  <span>All Daily Goals Smashed! Click for Trophy ✨</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* 💧 Water Intake (With Delay Biological Context) */}
              <div className="rounded-2xl p-4 flex flex-col justify-between border bg-[#F7F2E0] border-[#EDE5CD]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">💧</span>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      isWaterDone ? 'bg-[#80AEE8] text-[#5B0015]' : 'bg-[#80AEE8]/30 text-[#5B0015]'
                    }`}>
                      {isWaterDone ? '✓ Target Reached!' : '1 Glass every ~2 hrs'}
                    </span>
                  </div>
                  
                  <p className="font-bold text-[#5B0015] text-sm">Water Intake</p>
                  <p className="text-2xl font-black text-[#5B0015] mt-1">
                    {waterCount} <span className="text-xs font-normal text-[#5B0015]/70">/ 8 Glasses</span>
                  </p>

                  {/* Spot 3 Context Alert for Water */}
                  {isDelayed && isCalibrationComplete && (
                    <div className="mt-2 p-2 rounded-xl bg-white/70 border border-[#80AEE8]/40 text-[10px] font-bold text-[#5B0015] flex items-center gap-1.5">
                      <span>🌿</span>
                      <span>Hydration flushes excess cortisol & eases pre-flow bloating.</span>
                    </div>
                  )}

                  <div className="mt-3">
                    <div className="grid grid-cols-4 gap-1">
                      {waterSchedule.map((time, index) => {
                        const isDrank = waterCount > index;
                        return (
                          <div 
                            key={index} 
                            className={`text-center p-1 rounded-lg border text-[9px] font-bold transition-all ${
                              isDrank 
                                ? 'bg-[#5B0015] text-[#F7F2E0] border-[#5B0015]' 
                                : 'bg-white text-[#5B0015]/70 border-[#EDE5CD]'
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
                    className="flex-1 text-xs font-bold py-2 rounded-xl bg-[#5B0015] text-[#F7F2E0] hover:bg-[#450010] disabled:opacity-50 cursor-pointer"
                  >
                    {isWaterDone ? 'Goal Complete!' : '+1 Glass'}
                  </button>
                  <button
                    onClick={() => { setWaterCount(0); pushDailyLogToSupabase({ water_count: 0 }); }}
                    className="px-2 border border-[#EDE5CD] text-[#5B0015]/70 text-xs rounded-xl hover:bg-white cursor-pointer"
                  >
                    ↺
                  </button>
                </div>
              </div>

              {/* 🏃‍♀️ Gentle Movement (With Delay Biological Context) */}
              <div className="rounded-2xl p-4 flex flex-col justify-between border bg-[#F7F2E0] border-[#EDE5CD]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">🏃‍♀️</span>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      isExerciseDone ? 'bg-[#80AEE8] text-[#5B0015]' : 'bg-[#80AEE8]/30 text-[#5B0015]'
                    }`}>
                      {isExerciseDone ? '✓ Target Reached!' : 'Target: 30m'}
                    </span>
                  </div>
                  
                  <p className="font-bold text-[#5B0015] text-sm">Gentle Movement</p>
                  <p className="text-2xl font-black text-[#5B0015] mt-1">
                    {exerciseMins} <span className="text-xs font-normal text-[#5B0015]/70">Mins</span>
                  </p>

                  {/* Spot 3 Context Alert for Movement */}
                  {isDelayed && isCalibrationComplete && (
                    <div className="mt-2 p-2 rounded-xl bg-white/70 border border-[#80AEE8]/40 text-[10px] font-bold text-[#5B0015] flex items-center gap-1.5">
                      <span>🧘‍♀️</span>
                      <span>Pelvic flow: 30m gentle walk stimulates uterine blood circulation.</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-1.5 mt-4">
                  <button
                    onClick={() => {
                      const next = exerciseMins + 15;
                      setExerciseMins(next);
                      pushDailyLogToSupabase({ exercise_mins: next });
                    }}
                    className="flex-1 text-xs font-bold py-2 rounded-xl bg-[#5B0015] text-[#F7F2E0] hover:bg-[#450010] cursor-pointer"
                  >
                    +15 m
                  </button>
                  <button
                    onClick={() => { setExerciseMins(0); pushDailyLogToSupabase({ exercise_mins: 0 }); }}
                    className="px-2 border border-[#EDE5CD] text-[#5B0015]/70 text-xs rounded-xl hover:bg-white cursor-pointer"
                  >
                    ↺
                  </button>
                </div>
              </div>

              {/* 😴 Sleep (With Delay Biological Context) */}
              <div className="rounded-2xl p-4 flex flex-col justify-between border bg-[#F7F2E0] border-[#EDE5CD]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">😴</span>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      isSleepDone ? 'bg-[#80AEE8] text-[#5B0015]' : 'bg-[#80AEE8]/30 text-[#5B0015]'
                    }`}>
                      {isSleepDone ? '✓ Target Reached!' : 'Target: 8h'}
                    </span>
                  </div>
                  
                  <p className="font-bold text-[#5B0015] text-sm">Restful Sleep</p>
                  <p className="text-2xl font-black text-[#5B0015] mt-1">
                    {loggedSleep} <span className="text-xs font-normal text-[#5B0015]/70">Hours</span>
                  </p>

                  {/* Spot 3 Context Alert for Sleep */}
                  {isDelayed && isCalibrationComplete && (
                    <div className="mt-2 p-2 rounded-xl bg-white/70 border border-[#80AEE8]/40 text-[10px] font-bold text-[#5B0015] flex items-center gap-1.5">
                      <span>😴</span>
                      <span>Deep sleep regulates insulin spikes to unblock paused ovulation.</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-1.5 mt-4">
                  <button
                    onClick={() => {
                      const next = loggedSleep >= 12 ? 0 : loggedSleep + 1;
                      setLoggedSleep(next);
                      pushDailyLogToSupabase({ logged_sleep: next });
                    }}
                    className="flex-1 text-xs font-bold py-2 rounded-xl bg-[#5B0015] text-[#F7F2E0] hover:bg-[#450010] cursor-pointer"
                  >
                    +1 Hour
                  </button>
                  <button
                    onClick={() => { setLoggedSleep(0); pushDailyLogToSupabase({ logged_sleep: 0 }); }}
                    className="px-2 border border-[#EDE5CD] text-[#5B0015]/70 text-xs rounded-xl hover:bg-white cursor-pointer"
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
      {/* TAB 2: HEALTH ANALYTICS                                         */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'analytics' && (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#FCFBF5] p-5 rounded-3xl border border-[#EDE5CD] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#80AEE8]/30 text-[#5B0015] flex items-center justify-center text-2xl font-bold">
                🎯
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#5B0015]/70 uppercase tracking-wider">Health Consistency</p>
                <p className="text-xl font-black text-[#5B0015]">
                  {weeklyWaterData.filter(d => d.glasses >= 8).length >= 4 ? '88% High' : '72% Normal'}
                </p>
              </div>
            </div>

            <div className="bg-[#FCFBF5] p-5 rounded-3xl border border-[#EDE5CD] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#5B0015]/15 text-[#5B0015] flex items-center justify-center text-2xl font-bold">
                🩸
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#5B0015]/70 uppercase tracking-wider">Avg Cycle Length</p>
                <p className="text-xl font-black text-[#5B0015]">{cycleLength} Days</p>
              </div>
            </div>

            <div className="bg-[#FCFBF5] p-5 rounded-3xl border border-[#EDE5CD] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#80AEE8]/30 text-[#5B0015] flex items-center justify-center text-2xl font-bold">
                💊
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#5B0015]/70 uppercase tracking-wider">Med Adherence</p>
                <p className="text-xl font-black text-[#5B0015]">{avgMedAdherence}%</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Water Chart */}
            <div className="bg-[#FCFBF5] p-6 rounded-3xl shadow-sm border border-[#EDE5CD]">
              <h3 className="font-bold text-[#5B0015] text-base mb-4">💧 7-Day Water Intake Chart</h3>
              <div className="flex items-end justify-between h-44 pt-4 px-2 border-b border-[#EDE5CD]">
                {weeklyWaterData.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-[10px] font-bold text-[#5B0015]/70">{item.glasses}g</span>
                    <div className="w-full max-w-[28px] bg-white rounded-t-xl h-32 flex items-end overflow-hidden border border-[#EDE5CD]">
                      <div 
                        style={{ height: `${Math.min((item.glasses / 8) * 100, 100)}%` }}
                        className="w-full bg-[#80AEE8] rounded-t-xl"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-[#5B0015]">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Symptom Trends */}
            <div className="bg-[#FCFBF5] p-6 rounded-3xl shadow-sm border border-[#EDE5CD]">
              <h3 className="font-bold text-[#5B0015] text-base mb-4">📊 Top Symptom Trends</h3>
              <div className="space-y-4">
                {symptomAnalytics.map((sym, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-[#5B0015]">
                      <span>{sym.name}</span>
                      <span>{sym.count} Times</span>
                    </div>
                    <div className="w-full bg-white h-3 rounded-full overflow-hidden border border-[#EDE5CD]">
                      <div 
                        style={{ width: `${Math.min((sym.count / Math.max(...symptomAnalytics.map(s => s.count), 1)) * 100, 100)}%` }}
                        className={`h-full ${sym.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 🏆 Celebration Modal Popup ── */}
      {showCelebrationModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#5B0015] text-[#F7F2E0] w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-[#80AEE8] text-center relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowCelebrationModal(false)}
              className="absolute top-4 right-4 text-[#F7F2E0]/70 hover:text-white font-black bg-white/10 w-8 h-8 rounded-full flex items-center justify-center border border-white/20 cursor-pointer"
            >
              ✕
            </button>

            <div className="w-20 h-20 bg-[#80AEE8] text-[#5B0015] rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-xl mb-4 border-2 border-[#F7F2E0] animate-bounce">
              🏆
            </div>

            <span className="bg-[#80AEE8] text-[#5B0015] text-[11px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm inline-block mb-2">
              🎉 100% Goals Smashed!
            </span>

            <h3 className="text-2xl sm:text-3xl font-black text-[#F7F2E0] tracking-tight">
              Queen, You Did It! 🌸
            </h3>

            <p className="text-xs sm:text-sm text-[#F7F2E0]/85 mt-2 leading-relaxed font-medium">
              Aaj aapne apne PCOD healing routine ke teeno primary pillars poore kar liye hain:
            </p>

            <div className="my-5 space-y-2 bg-black/30 p-4 rounded-2xl border border-[#80AEE8]/40 text-left text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#F7F2E0]">💧 Hydro Target (8 Glasses)</span>
                <span className="font-black text-[#80AEE8]">Completed ✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#F7F2E0]">🏃‍♀️ Gentle Movement (30+ Mins)</span>
                <span className="font-black text-[#80AEE8]">Completed ✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#F7F2E0]">😴 Restful Sleep (8+ Hours)</span>
                <span className="font-black text-[#80AEE8]">Completed ✓</span>
              </div>
            </div>

            <p className="text-[11px] text-[#80AEE8] font-bold mb-4">
              Consistency is the real medicine for hormones. We are proud of you! ✨
            </p>

            <button
              onClick={() => setShowCelebrationModal(false)}
              className="w-full bg-[#80AEE8] hover:bg-[#A5C7F0] text-[#5B0015] font-black py-3 rounded-2xl text-xs transition-transform active:scale-95 shadow-xl cursor-pointer"
            >
              Keep Glowing, Thank You! 💖
            </button>
          </div>
        </div>
      )}

      {/* ── 📖 Mini-Blog Modal ── */}
      {showEngineBlogModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FCFBF5] text-[#5B0015] w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EDE5CD] max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowEngineBlogModal(false)}
              className="absolute top-4 right-4 text-[#5B0015] font-bold bg-[#F7F2E0] w-8 h-8 rounded-full flex items-center justify-center border border-[#EDE5CD] cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-3xl">🔬</span>
              <div>
                <span className="bg-[#80AEE8]/30 text-[#5B0015] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Science-Backed Transparency
                </span>
                <h3 className="text-xl font-extrabold text-[#5B0015] mt-1">
                  PCOD Cycles Delay Kyu Hote Hain?
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs text-[#5B0015]/90 leading-relaxed font-medium">
              <div className="bg-[#F7F2E0] p-4 rounded-2xl border border-[#EDE5CD] space-y-1.5">
                <h4 className="font-extrabold text-[#5B0015] text-sm">1. Generic Apps Kaha Fail Ho Jaati Hain?</h4>
                <p className="text-[11px] text-[#5B0015]/75">
                  Standard period apps math ke standard 28-day rule par chalti hain. PCOD mein ovulation 14th day par fix nahi hota. Jab cycle 35 din cross karta hai, woh bolti hain <i>"You are late"</i>, par yeh nahi batati ki body kis specific pause state par ruki hui hai.
                </p>
              </div>

              <div className="bg-[#80AEE8]/15 p-4 rounded-2xl border border-[#80AEE8]/30 space-y-1.5">
                <h4 className="font-extrabold text-[#5B0015] text-sm">2. Body "Pause State" Mein Kyu Jaati Hai?</h4>
                <p className="text-[11px] text-[#5B0015]/80">
                  Late sleeping, exam/work stress (cortisol spike), ya insulin fluctuations se ovary egg release karne mein delay karti hai. Is time pregnancy panic ki jagah gentle natural rhythm support chahiye hota hai.
                </p>
              </div>

              <div className="bg-[#F7F2E0] p-4 rounded-2xl border border-[#EDE5CD] space-y-1.5">
                <h4 className="font-extrabold text-[#5B0015] text-sm">3. Hamara Engine Kaise Decode Karta Hai?</h4>
                <p className="text-[11px] text-[#5B0015]/75">
                  Hum aapke continuous 3-day logs (sleep hours, water intake, symptoms like acne/cramps, aur previous cycle pattern) ko map karte hain. Engine bata deta hai ki body kis signature stage par hai taaki doorstep kit se cycle naturally encourage ho sake.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#5B0015] text-[#F7F2E0] border border-[#80AEE8]/40 space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs text-[#80AEE8]">🌸 Hamara Promise (Zero Fraud & Pure Trust):</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                  <p>✓ <b>Sirf ₹20 One-time:</b> No auto-debit, koi recurring charge nahi.</p>
                  <p>✓ <b>100% Data Confidential:</b> Aapka health log kisi third party ko share nahi hota.</p>
                  <p>✓ <b>Instant Clinical Value:</b> Rotterdam compliant doctor summary download.</p>
                  <p>✓ <b>No Pressure:</b> Free mode mein cycle projection hamesha active rahegi.</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2.5">
              <button
                onClick={() => {
                  setShowEngineBlogModal(false);
                  setShowKitModal(true);
                }}
                className="flex-1 bg-[#5B0015] hover:bg-[#450010] text-[#F7F2E0] font-bold py-3 rounded-2xl text-xs transition-colors shadow-md cursor-pointer"
              >
                Unlock My Hormone Protocol (₹20 Only) 🌸
              </button>
              <button
                onClick={() => setShowEngineBlogModal(false)}
                className="border border-[#EDE5CD] text-[#5B0015]/70 px-4 py-3 rounded-2xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 🌟 Seed Kit & UPI Payment Modal ── */}
      {showKitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FCFBF5] text-[#5B0015] w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#EDE5CD] max-h-[92vh] overflow-y-auto relative">
            <button
              onClick={() => {
                setShowKitModal(false);
                setCheckoutStep('address');
              }}
              className="absolute top-4 right-4 text-[#5B0015] font-bold bg-[#F7F2E0] w-8 h-8 rounded-full flex items-center justify-center border border-[#EDE5CD] cursor-pointer"
            >
              ✕
            </button>

            {checkoutStep === 'address' && (
              <>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-3xl">🌱</span>
                  <div>
                    <h3 className="text-lg font-black text-[#5B0015]">Delivery & Care Pass</h3>
                    <p className="text-xs text-[#5B0015]/70">Step 1 of 2 • Structured Delivery Address</p>
                  </div>
                </div>

                <div className="bg-[#F7F2E0] border border-[#EDE5CD] p-3 rounded-2xl text-xs text-[#5B0015] mb-4 space-y-1">
                  <p className="font-extrabold text-[#5B0015]">✨ Pass Perks (₹20 One-Time):</p>
                  <p className="text-[11px]">• Unlocks real-time Biological Phase & daily seeds portion.</p>
                  <p className="text-[11px]">• Priority doorstep dispatch for monthly seed packs at 25% off.</p>
                  <p className="text-[11px] text-[#5B0015] font-bold">• 100% Secure UPI Payment • No recurring debit.</p>
                </div>

                <form onSubmit={handleProceedToPayment} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#5B0015]/70 uppercase tracking-wider">
                      WhatsApp Mobile Number (Order & Courier Updates) *
                    </label>
                    <input
                      type="tel"
                      pattern="[0-9]{10}"
                      placeholder="10-digit mobile number"
                      required
                      value={subWhatsApp}
                      onChange={(e) => setSubWhatsApp(e.target.value)}
                      className="w-full mt-1 p-2.5 text-xs border border-[#EDE5CD] rounded-xl bg-white outline-none focus:ring-1 focus:ring-[#80AEE8] font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#5B0015]/70 uppercase tracking-wider">
                      Flat, House No., Building, Apartment *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 402, Sunshine Heights"
                      required
                      value={subHouseNo}
                      onChange={(e) => setSubHouseNo(e.target.value)}
                      className="w-full mt-1 p-2.5 text-xs border border-[#EDE5CD] rounded-xl bg-white outline-none focus:ring-1 focus:ring-[#80AEE8]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#5B0015]/70 uppercase tracking-wider">
                      Area, Street, Sector, Locality *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Civil Lines, Main Road"
                      required
                      value={subArea}
                      onChange={(e) => setSubArea(e.target.value)}
                      className="w-full mt-1 p-2.5 text-xs border border-[#EDE5CD] rounded-xl bg-white outline-none focus:ring-1 focus:ring-[#80AEE8]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#5B0015]/70 uppercase tracking-wider">
                        Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Near City Hospital"
                        value={subLandmark}
                        onChange={(e) => setSubLandmark(e.target.value)}
                        className="w-full mt-1 p-2.5 text-xs border border-[#EDE5CD] rounded-xl bg-white outline-none focus:ring-1 focus:ring-[#80AEE8]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#5B0015]/70 uppercase tracking-wider">
                        Pincode (6-Digits) *
                      </label>
                      <input
                        type="text"
                        maxLength="6"
                        pattern="[0-9]{6}"
                        placeholder="e.g. 208001"
                        required
                        value={subPincode}
                        onChange={(e) => setSubPincode(e.target.value)}
                        className="w-full mt-1 p-2.5 text-xs border border-[#EDE5CD] rounded-xl bg-white outline-none focus:ring-1 focus:ring-[#80AEE8]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-[#5B0015]/70 uppercase tracking-wider">
                        Town / City *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Kanpur"
                        required
                        value={subCity}
                        onChange={(e) => setSubCity(e.target.value)}
                        className="w-full mt-1 p-2.5 text-xs border border-[#EDE5CD] rounded-xl bg-white outline-none focus:ring-1 focus:ring-[#80AEE8]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-[#5B0015]/70 uppercase tracking-wider">
                        State *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Uttar Pradesh"
                        required
                        value={subState}
                        onChange={(e) => setSubState(e.target.value)}
                        className="w-full mt-1 p-2.5 text-xs border border-[#EDE5CD] rounded-xl bg-white outline-none focus:ring-1 focus:ring-[#80AEE8]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#5B0015] hover:bg-[#450010] text-[#F7F2E0] font-black py-3.5 rounded-2xl text-xs transition-colors shadow-md mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Continue to Payment (₹20) ➔</span>
                  </button>
                </form>
              </>
            )}

            {checkoutStep === 'payment' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">💳</span>
                  <div>
                    <h3 className="text-lg font-black text-[#5B0015]">Instant UPI Payment</h3>
                    <p className="text-xs text-[#5B0015]/70">Step 2 of 2 • Pay ₹20 via GPay, PhonePe ya Paytm</p>
                  </div>
                </div>

                <div className="bg-[#F7F2E0] p-4 rounded-2xl border border-[#EDE5CD] flex flex-col items-center text-center">
                  <div className="bg-white p-2.5 rounded-2xl border border-[#EDE5CD] shadow-sm mb-3">
                    <img
                      src={qrCodeUrl}
                      alt="UPI QR Code"
                      className="w-44 h-44 object-contain rounded-xl"
                    />
                  </div>

                  <p className="text-xs font-bold text-[#5B0015]">
                    Scan QR with any UPI App
                  </p>
                  <p className="text-[11px] text-[#5B0015]/75 mt-0.5">
                    Amount: <b className="text-[#5B0015] text-sm">₹20.00</b> • Payee: <b>{PAYEE_NAME}</b>
                  </p>
                  <p className="text-[10px] text-[#5B0015]/80 mt-0.5 font-mono bg-white px-2.5 py-0.5 rounded-md border border-[#EDE5CD]">
                    UPI ID: {UPI_ID}
                  </p>

                  <a
                    href={upiLink}
                    className="w-full mt-3 bg-[#5B0015] hover:bg-[#450010] text-[#F7F2E0] font-black py-2.5 rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>⚡ Pay via UPI App (GPay / PhonePe / Paytm)</span>
                  </a>
                </div>

                <form onSubmit={handleConfirmPayment} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#5B0015]/70 uppercase tracking-wider">
                      Enter 12-Digit UPI Ref / UTR No. *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 428719283741"
                      required
                      value={utrInput}
                      onChange={(e) => setUtrInput(e.target.value)}
                      className="w-full mt-1 p-2.5 text-xs border border-[#EDE5CD] rounded-xl bg-white font-mono text-[#5B0015] outline-none focus:ring-1 focus:ring-[#80AEE8]"
                    />
                    <span className="text-[10px] text-[#5B0015]/70 mt-0.5 block">
                      Payment karne ke baad transaction details se 12-digit UTR enter karein.
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('address')}
                      className="border border-[#EDE5CD] text-[#5B0015] px-4 py-3 rounded-2xl text-xs font-bold cursor-pointer hover:bg-[#F7F2E0]"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={paymentPending}
                      className="flex-1 bg-[#5B0015] hover:bg-[#450010] text-[#F7F2E0] font-black py-3 rounded-2xl text-xs transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      {paymentPending ? "Verifying..." : "Confirm Payment 🌸"}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── 📄 CLINICAL DOCTOR MEDICAL PDF REPORT MODAL (SPOT 2 INTEGRATED) ── */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FCFBF5] text-[#5B0015] w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EDE5CD] max-h-[92vh] overflow-y-auto relative">
            <button
              onClick={() => setShowPdfModal(false)}
              className="no-print absolute top-4 right-4 text-[#5B0015] hover:text-black font-bold text-lg bg-[#F7F2E0] w-8 h-8 rounded-full flex items-center justify-center border border-[#EDE5CD] cursor-pointer"
            >
              ✕
            </button>

            <div id="printable-doctor-report" className="p-4 bg-white text-[#5B0015] font-sans space-y-5 rounded-2xl border border-[#EDE5CD]">
              
              {/* Header */}
              <div className="border-b-2 border-[#5B0015] pb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🩺</span>
                    <h2 className="text-xl font-extrabold text-[#5B0015] uppercase tracking-wide">
                      HerBalance Clinical Health Summary
                    </h2>
                  </div>
                  <p className="text-[11px] text-[#5B0015]/75 mt-0.5 font-medium">
                    Continuous Hormonal Pattern & Lifestyle Tracking Record (Rotterdam PCOD Reference)
                  </p>
                </div>
                <div className="text-right">
                  <span className="bg-[#80AEE8]/30 text-[#5B0015] border border-[#80AEE8] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    Confidential Report
                  </span>
                  <p className="text-[11px] text-[#5B0015]/70 mt-1.5 font-medium">
                    Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Patient Basic Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F7F2E0] p-3.5 rounded-2xl border border-[#EDE5CD] text-xs">
                <div>
                  <p className="text-[10px] font-bold text-[#5B0015]/70 uppercase">Patient Identifier</p>
                  <p className="font-black text-[#5B0015] text-sm mt-0.5">{user?.name || userKey}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#5B0015]/70 uppercase">Menstrual Phase</p>
                  <p className="font-black text-[#80AEE8] text-sm mt-0.5">{kitSubscribed ? currentPhaseInternal : 'Encrypted (Care Pass)'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#5B0015]/70 uppercase">Current Rhythm</p>
                  <p className={`font-black text-sm mt-0.5 ${daysRemainingText.includes('Late') ? 'text-amber-800' : 'text-[#5B0015]'}`}>
                    {daysRemainingText}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#5B0015]/70 uppercase">Clinical Status</p>
                  <p className={`font-black text-sm mt-0.5 ${symptomStatus === 'Needs Attention' ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {symptomStatus}
                  </p>
                </div>
              </div>

              {/* ── 🌟 SPOT 2: INITIAL AI ENDOCRINE RISK BASELINE BLOCK ── */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-[#5B0015] uppercase tracking-wider flex items-center justify-between">
                  <span>1. Initial AI Endocrine Risk Baseline (12 Clinical Markers)</span>
                  <span className="text-[10px] font-bold text-[#80AEE8]">FastAPI ML Model Score</span>
                </h4>
                
                <div className="border border-[#EDE5CD] rounded-xl p-3.5 bg-[#FCFBF5] text-xs">
                  {storedAiAssessment ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-1.5 bg-[#F7F2E0] rounded-xl border border-[#EDE5CD]">🔬</span>
                        <div>
                          <p className="text-[10px] text-[#5B0015]/70 font-bold uppercase">Pattern Match Probability</p>
                          <p className="text-lg font-black text-[#5B0015]">{storedAiAssessment.probability_percentage}%</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] text-[#5B0015]/70 font-bold uppercase">Risk Category</p>
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black border ${
                          storedAiAssessment.probability_percentage >= 70 
                            ? 'bg-[#5B0015] text-[#F7F2E0] border-[#5B0015]' 
                            : storedAiAssessment.probability_percentage >= 40 
                            ? 'bg-amber-100 text-amber-900 border-amber-300' 
                            : 'bg-[#80AEE8]/30 text-[#5B0015] border-[#80AEE8]'
                        }`}>
                          {storedAiAssessment.probability_percentage >= 70 ? 'High Pattern Match' : storedAiAssessment.probability_percentage >= 40 ? 'Moderate Match' : 'Low Pattern Match'}
                        </span>
                      </div>

                      <div>
                        <p className="text-[10px] text-[#5B0015]/70 font-bold uppercase">Assessment Biomarkers</p>
                        <p className="text-[11px] font-bold text-[#5B0015]">
                          BMI: {storedAiAssessment.bmi ? Number(storedAiAssessment.bmi).toFixed(1) : 'Logged'} • Date: {storedAiAssessment.assessed_at ? storedAiAssessment.assessed_at.split('T')[0] : 'Recent'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-[#5B0015]/75 italic">
                        Initial 2-minute AI risk scan not yet recorded. Patient can take the test directly in-app.
                      </p>
                      {onNewAssessment && (
                        <button 
                          onClick={() => { setShowPdfModal(false); onNewAssessment(); }}
                          className="text-[10px] font-black text-[#5B0015] underline cursor-pointer"
                        >
                          Take Scan ➔
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Endocrine Profile Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-[#5B0015] uppercase tracking-wider flex items-center gap-1.5">
                  <span>2. Laboratory Endocrine Profile (Blood Biomarkers)</span>
                </h4>
                
                <table className="w-full text-left border-collapse border border-[#EDE5CD] rounded-xl overflow-hidden text-xs">
                  <thead className="bg-[#F7F2E0] text-[#5B0015] font-black border-b border-[#EDE5CD]">
                    <tr>
                      <th className="p-2.5">Biomarker</th>
                      <th className="p-2.5">Logged Value</th>
                      <th className="p-2.5">Clinical Reference Range</th>
                      <th className="p-2.5">Diagnostic Inference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDE5CD]">
                    <tr>
                      <td className="p-2.5 font-bold text-[#5B0015]">LH : FSH Ratio</td>
                      <td className="p-2.5 font-black">{lhFshRatio ? `${lhFshRatio} : 1` : 'Not Logged'}</td>
                      <td className="p-2.5 text-[#5B0015]/70">1:1 (Follicular phase)</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          isRatioHigh ? 'bg-[#5B0015]/15 text-[#5B0015]' : 'bg-[#80AEE8]/30 text-[#5B0015]'
                        }`}>
                          {isRatioHigh ? 'Elevated (PCOD Marker)' : (lhFshRatio ? 'Normal' : 'Pending')}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-[#5B0015]">Total Testosterone</td>
                      <td className="p-2.5 font-black">{testNum ? `${testNum} ng/dL` : 'Not Logged'}</td>
                      <td className="p-2.5 text-[#5B0015]/70">15 - 45 ng/dL</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          isTestosteroneHigh ? 'bg-[#5B0015] text-[#F7F2E0]' : 'bg-[#80AEE8]/30 text-[#5B0015]'
                        }`}>
                          {isTestosteroneHigh ? 'Hyperandrogenemia' : (testNum ? 'Normal Range' : 'Pending')}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-[#5B0015]">Thyroid (TSH)</td>
                      <td className="p-2.5 font-black">{tshNum ? `${tshNum} uIU/mL` : 'Not Logged'}</td>
                      <td className="p-2.5 text-[#5B0015]/70">0.4 - 4.5 uIU/mL</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          isTshAbnormal ? 'bg-amber-100 text-amber-950' : (tshNum ? 'bg-[#80AEE8]/30 text-[#5B0015]' : 'bg-slate-100 text-slate-700')
                        }`}>
                          {isTshAbnormal ? 'Borderline / Abnormal' : (tshNum ? 'Euthyroid' : 'Pending')}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Cycle Dynamics */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-[#5B0015] uppercase tracking-wider">
                  3. Menstrual Pattern & Cycle Dynamics
                </h4>
                <div className="grid grid-cols-3 gap-3 border border-[#EDE5CD] rounded-xl p-3 text-xs bg-[#F7F2E0]">
                  <div>
                    <span className="text-[#5B0015]/70 block text-[10px] uppercase font-bold">LMP (Last Period)</span>
                    <span className="font-black text-[#5B0015] text-xs">{lastDate || 'Not Configured'}</span>
                  </div>
                  <div>
                    <span className="text-[#5B0015]/70 block text-[10px] uppercase font-bold">Reported Cycle Length</span>
                    <span className="font-black text-[#5B0015] text-xs">{cycleLength} Days</span>
                  </div>
                  <div>
                    <span className="text-[#5B0015]/70 block text-[10px] uppercase font-bold">Latest Logged Flow</span>
                    <span className="font-black text-[#80AEE8] text-xs">{selectedFlow}</span>
                  </div>
                </div>
              </div>

              {/* Multi-Day Symptoms */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-[#5B0015] uppercase tracking-wider">
                  4. Symptom Incidence (Database Multi-Day History)
                </h4>
                <div className="border border-[#EDE5CD] rounded-xl p-3.5 text-xs space-y-2.5 bg-white">
                  <div className="flex flex-wrap gap-2">
                    {symptomAnalytics.length > 0 ? (
                      symptomAnalytics.map((sym, idx) => (
                        <span key={idx} className="bg-[#F7F2E0] border border-[#EDE5CD] text-[#5B0015] px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
                          <span>{sym.name}</span>
                          <span className="bg-[#80AEE8] text-[#5B0015] px-1.5 py-0.2 rounded text-[10px] font-black">{sym.count}x</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-[#5B0015]/70 italic font-medium">No repeated symptom history recorded in current logging cycle.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Meds Adherence */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-[#5B0015] uppercase tracking-wider flex justify-between items-center">
                  <span>5. Prescribed Medication & Supplement Compliance</span>
                  <span className="text-[#80AEE8] font-black text-[11px]">Overall Adherence: {avgMedAdherence}%</span>
                </h4>
                <div className="border border-[#EDE5CD] rounded-xl p-3 text-xs bg-white">
                  {medications.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {medications.map((m) => (
                        <div key={m.id} className="flex justify-between items-center bg-[#F7F2E0] p-2 rounded-lg border border-[#EDE5CD]">
                          <div>
                            <span className="font-bold text-[#5B0015]">{m.name}</span>
                            <span className="text-[10px] text-[#5B0015]/70 block font-medium">Schedule: {m.time}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            m.taken ? 'bg-[#80AEE8] text-[#5B0015]' : 'bg-slate-100 text-[#5B0015]/60'
                          }`}>
                            {m.taken ? 'Taken' : 'Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#5B0015]/70 italic font-medium">No active supplements or medications listed by patient.</p>
                  )}
                </div>
              </div>

              {/* Stamp and Signature */}
              <div className="border-t-2 border-[#EDE5CD] pt-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-[#5B0015]/70 uppercase">Designated Emergency Caregiver</p>
                  <p className="font-black text-[#5B0015] mt-0.5">{sosContactName || 'Not Set'} ({sosContactNumber || 'N/A'})</p>
                </div>
                <div className="text-right flex flex-col justify-end">
                  <div className="inline-block border-b border-dashed border-[#5B0015]/60 w-48 ml-auto mb-1"></div>
                  <p className="text-[10px] font-bold text-[#5B0015]/70 uppercase">Consulting Gynecologist Signature / Stamp</p>
                </div>
              </div>

            </div>

            <div className="no-print mt-6 flex gap-3">
              <button
                onClick={handlePrintPdf}
                className="flex-1 bg-[#5B0015] hover:bg-[#450010] text-[#F7F2E0] font-black py-3 rounded-2xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🖨️ Download / Print Clinical PDF</span>
              </button>
              <button
                onClick={() => setShowPdfModal(false)}
                className="border border-[#EDE5CD] text-[#5B0015] hover:bg-[#F7F2E0] px-5 py-3 rounded-2xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── 🧪 LAB REPORT VALUE ANALYZER MODAL ── */}
      {showLabModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FCFBF5] text-[#5B0015] w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-[#EDE5CD] max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowLabModal(false)}
              className="absolute top-4 right-4 text-[#5B0015] hover:text-black font-bold text-lg bg-[#F7F2E0] w-8 h-8 rounded-full flex items-center justify-center border border-[#EDE5CD] cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-3xl">🧪</span>
              <div>
                <h3 className="text-xl font-black text-[#5B0015]">PCOD Lab Report Checker</h3>
                <p className="text-xs text-[#5B0015]/75 font-medium">Apne latest blood test values compare karein</p>
              </div>
            </div>

            <form onSubmit={handleSaveLabValues} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#5B0015]/75 uppercase">LH (mIU/mL)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 11.2"
                    value={labValues.lh}
                    onChange={(e) => setLabValues({ ...labValues, lh: e.target.value })}
                    className="w-full mt-1 p-2.5 text-xs border border-[#EDE5CD] bg-white rounded-xl outline-none focus:ring-1 focus:ring-[#80AEE8] font-bold text-[#5B0015]"
                  />
                  <span className="text-[9px] text-[#5B0015]/70 font-semibold">Normal: 2 - 10</span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#5B0015]/75 uppercase">FSH (mIU/mL)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 5.1"
                    value={labValues.fsh}
                    onChange={(e) => setLabValues({ ...labValues, fsh: e.target.value })}
                    className="w-full mt-1 p-2.5 text-xs border border-[#EDE5CD] bg-white rounded-xl outline-none focus:ring-1 focus:ring-[#80AEE8] font-bold text-[#5B0015]"
                  />
                  <span className="text-[9px] text-[#5B0015]/70 font-semibold">Normal: 3 - 8</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#5B0015]/75 uppercase">Testosterone (ng/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 52.0"
                    value={labValues.testosterone}
                    onChange={(e) => setLabValues({ ...labValues, testosterone: e.target.value })}
                    className="w-full mt-1 p-2.5 text-xs border border-[#EDE5CD] bg-white rounded-xl outline-none focus:ring-1 focus:ring-[#80AEE8] font-bold text-[#5B0015]"
                  />
                  <span className="text-[9px] text-[#5B0015]/70 font-semibold">Normal: 15 - 45</span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#5B0015]/75 uppercase">TSH (Thyroid) (uIU/mL)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 2.8"
                    value={labValues.tsh}
                    onChange={(e) => setLabValues({ ...labValues, tsh: e.target.value })}
                    className="w-full mt-1 p-2.5 text-xs border border-[#EDE5CD] bg-white rounded-xl outline-none focus:ring-1 focus:ring-[#80AEE8] font-bold text-[#5B0015]"
                  />
                  <span className="text-[9px] text-[#5B0015]/70 font-semibold">Normal: 0.4 - 4.5</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#5B0015] hover:bg-[#450010] text-[#F7F2E0] py-2.5 rounded-xl text-xs font-black transition-colors mt-2 cursor-pointer shadow-md"
              >
                Save Lab Values 🌸
              </button>
            </form>

            <button
              onClick={() => setShowLabModal(false)}
              className="w-full mt-3 bg-[#F7F2E0] border border-[#EDE5CD] text-[#5B0015] font-bold py-2 rounded-xl text-xs hover:bg-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── 🆘 SOS RELIEF MODAL POPUP ── */}
      {showSosModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FCFBF5] text-[#5B0015] w-full max-w-lg rounded-3xl p-6 shadow-2xl border-2 border-[#5B0015]/20 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowSosModal(false)}
              className="absolute top-4 right-4 text-[#5B0015] font-bold text-lg bg-[#F7F2E0] w-8 h-8 rounded-full flex items-center justify-center border border-[#EDE5CD] cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🌸</span>
              <div>
                <h3 className="text-xl font-black text-[#5B0015]">SOS Cramp Relief Box</h3>
                <p className="text-xs text-[#5B0015]/75 font-medium">Natural relief methods & Caregiver help</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-[#F7F2E0] border border-[#EDE5CD] p-3.5 rounded-2xl flex items-start gap-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-xs font-black text-[#5B0015]">Heat Therapy (Most Effective)</p>
                  <p className="text-[11px] text-[#5B0015]/80 mt-0.5 leading-relaxed font-medium">
                    Lower abdomen par 15-20 min ke liye Hot Water Bag rakhein. Pelvic muscles relax hoti hain.
                  </p>
                </div>
              </div>

              <div className="bg-[#80AEE8]/15 border border-[#80AEE8]/40 p-3.5 rounded-2xl flex items-start gap-3">
                <span className="text-2xl">🧘‍♀️</span>
                <div>
                  <p className="text-xs font-black text-[#5B0015]">Gentle Stretch (Child's Pose)</p>
                  <p className="text-[11px] text-[#5B0015]/80 mt-0.5 leading-relaxed font-medium">
                    Child's Pose mein 5 minute rest karein. Lower back aur pelvic pressure instantly ease hota hai.
                  </p>
                </div>
              </div>

              <div className="bg-[#F7F2E0] border border-[#EDE5CD] p-3.5 rounded-2xl flex items-start gap-3">
                <span className="text-2xl">🍵</span>
                <div>
                  <p className="text-xs font-black text-[#5B0015]">Warm Ginger or Chamomile Tea</p>
                  <p className="text-[11px] text-[#5B0015]/80 mt-0.5 leading-relaxed font-medium">
                    Warm adrak tea pelvic muscle contractions ko naturally soothe karti hai.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 p-4 rounded-2xl bg-[#F7F2E0] border border-[#EDE5CD]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚨</span>
                  <span className="text-xs font-black text-[#5B0015] uppercase tracking-wider">Emergency Contact Center</span>
                </div>
                <button
                  onClick={() => setIsEditingSosContact(!isEditingSosContact)}
                  className="text-[11px] font-black text-[#80AEE8] hover:underline cursor-pointer"
                >
                  {isEditingSosContact ? 'Cancel' : (sosContactNumber ? 'Edit' : '+ Add Contact')}
                </button>
              </div>

              {isEditingSosContact ? (
                <form onSubmit={handleSaveSosContact} className="space-y-2 mt-2">
                  <input
                    type="text"
                    placeholder="Contact Name (e.g. Mom / Doctor / Partner)"
                    value={sosContactName}
                    onChange={(e) => setSosContactName(e.target.value)}
                    className="w-full p-2 text-xs border border-[#EDE5CD] rounded-xl bg-white outline-none focus:ring-1 focus:ring-[#80AEE8] text-[#5B0015]"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="10-digit Phone Number"
                    value={sosContactNumber}
                    onChange={(e) => setSosContactNumber(e.target.value)}
                    className="w-full p-2 text-xs border border-[#EDE5CD] rounded-xl bg-white outline-none focus:ring-1 focus:ring-[#80AEE8] text-[#5B0015]"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-[#5B0015] hover:bg-[#450010] text-[#F7F2E0] py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Save Contact Details
                  </button>
                </form>
              ) : (
                <div className="mt-2 space-y-3">
                  {sosContactNumber ? (
                    <div className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-[#EDE5CD]">
                      <div>
                        <p className="font-bold text-[#5B0015]">{sosContactName || 'Emergency Contact'}</p>
                        <p className="text-[11px] text-[#5B0015]/70">{sosContactNumber}</p>
                      </div>
                      <span className="text-xs font-black text-[#5B0015] bg-[#80AEE8]/30 px-2 py-0.5 rounded-full border border-[#80AEE8]">
                        Ready ✓
                      </span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#5B0015]/80 italic">
                      Emergency contact set nahi hai. Severe pain ke waqt turant alert bhejne ke liye add karein.
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={handleSendWhatsAppSos}
                      className="w-full bg-[#80AEE8] hover:bg-[#A5C7F0] text-[#5B0015] font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <span>💬 WhatsApp SOS</span>
                    </button>
                    
                    <button
                      onClick={handleMakeSosCall}
                      className="w-full bg-[#5B0015] hover:bg-[#450010] text-[#F7F2E0] font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <span>📞 Direct Call</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowSosModal(false)}
              className="w-full mt-5 bg-[#5B0015] text-[#F7F2E0] font-bold py-3 rounded-xl text-xs hover:bg-[#450010] transition-colors cursor-pointer"
            >
              I Feel Better Now / Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}