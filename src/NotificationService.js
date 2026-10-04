import { LocalNotifications } from '@capacitor/local-notifications';

// ── Check if native Capacitor plugin is available ──
const isNative = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform();

// ── Permission Request Handler ──
export async function requestNotificationPermission() {
  try {
    if (isNative) {
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    } else if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  } catch (error) {
    console.error('Permission Request Error:', error);
    return false;
  }
}

// ── Instant Notification Trigger ──
export async function sendInstantNotification(title, body) {
  try {
    if (isNative) {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: title,
            body: body,
            id: Date.now() % 100000,
            schedule: { at: new Date(Date.now() + 500) },
            sound: 'beep.wav',
            smallIcon: 'ic_stat_name',
          },
        ],
      });
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/favicon.ico',
      });
    }
  } catch (error) {
    console.error('Instant Notification Error:', error);
  }
}

// ── All Notification Schedules (Water, Meds, Sleep, Movement) ──
const NOTIFICATION_SCHEDULES = [
  // 💧 Hydro Interval Alerts (Har 2 Ghante)
  { id: 201, title: '💧 Morning Hydration (8 AM)', body: 'Subah ki shuruaat 1 glass taaza paani se karein. Ovary aur metabolic balance boost hoga!', hour: 8, minute: 0, type: 'water', slotIndex: 0 },
  { id: 202, title: '💧 Hydro Check (10 AM)', body: '10 AM ho gaye! Dusra glass paani lena na bhoolein. Cellular hydration zaruri hai.', hour: 10, minute: 0, type: 'water', slotIndex: 1 },
  { id: 203, title: '💧 Mid-Day Hydro Alert (12 PM)', body: '12 PM target pending! Insulin spike control karne ke liye abhi 1 glass paani piyein.', hour: 12, minute: 0, type: 'water', slotIndex: 2 },
  { id: 204, title: '💧 Post-Lunch Water (2 PM)', body: 'Dopahar ka paani! Digestion aur bloating reduce karne ke liye apna 4th glass complete karein.', hour: 14, minute: 0, type: 'water', slotIndex: 3 },
  { id: 205, title: '💧 Afternoon Hydration (4 PM)', body: 'Evening fatigue se bachne ke liye 1 glass paani zaroor piyein.', hour: 16, minute: 0, type: 'water', slotIndex: 4 },
  { id: 206, title: '💧 Sunset Hydration (6 PM)', body: '6 PM alert! Aaj ke 6 glasses ho gaye kya? Check karein aur tick karein.', hour: 18, minute: 0, type: 'water', slotIndex: 5 },
  { id: 207, title: '💧 Dinner Hydration (8 PM)', body: 'Dinner se pehle 1 glass paani. Cravings aur late-night bloating kam hogi.', hour: 20, minute: 0, type: 'water', slotIndex: 6 },
  { id: 208, title: '💧 Final Hydro Target (10 PM)', body: 'Aakhiri 8th glass! Aaj ka hydro goal complete karke sleep mode me jayein 🌸', hour: 22, minute: 0, type: 'water', slotIndex: 7 },

  // 💊 Medication Alerts
  { id: 301, title: '💊 Morning Supplements (9 AM)', body: 'Breakfast ke saath Myo-Inositol aur morning doses lena na bhoolein!', hour: 9, minute: 0, type: 'med_morning' },
  { id: 302, title: '💊 Afternoon Dose (2 PM)', body: 'Lunch ke baad Vitamin D3 / Afternoon supplements log karein.', hour: 14, minute: 30, type: 'med_afternoon' },
  { id: 303, title: '💊 Night Supplements (9:30 PM)', body: 'Dinner ke baad night supplements aur bedtime ritual complete karein.', hour: 21, minute: 30, type: 'med_night' },

  // 🏃‍♀️ Movement & Sleep
  { id: 401, title: '🧘‍♀️ Gentle Movement Check (5:30 PM)', body: 'Shaam ka gentle 30 min walk ya pelvic stretch time. Hormones recharge honge!', hour: 17, minute: 30, type: 'movement' },
  { id: 402, title: '😴 Deep Sleep Wind-down (10:30 PM)', body: 'Phone screen off karein. Melatonin aur progesterone balance ke liye 8 ghante soyein 🌸', hour: 22, minute: 30, type: 'sleep' },
];

// ── Smart Engine: Schedule All Multi-Interval Alarms ──
export async function setupSmartIntervalReminders() {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return false;

    if (isNative) {
      // Native Capacitor: Rozana repeat hone wale alarms register karein
      const nativeList = NOTIFICATION_SCHEDULES.map((item) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        schedule: {
          on: {
            hour: item.hour,
            minute: item.minute,
          },
          allowWhileIdle: true,
        },
        sound: 'beep.wav',
        smallIcon: 'ic_stat_name',
      }));

      // Cancel existing to prevent duplicates
      await LocalNotifications.cancel({ notifications: NOTIFICATION_SCHEDULES.map((s) => ({ id: s.id })) });
      await LocalNotifications.schedule({ notifications: nativeList });
    }

    // Web Local Interval Engine: Set flag for web runner
    localStorage.setItem('herbalance_smart_reminders_enabled', 'true');
    return true;
  } catch (error) {
    console.error('Smart Scheduler Setup Error:', error);
    return false;
  }
}

// ── Web Real-Time Interval Checker (Browser Chalu Rehne Par) ──
let webIntervalTimer = null;

export function startWebIntervalEngine(getCurrentWaterCount, getMedsList) {
  if (typeof window === 'undefined') return;

  if (webIntervalTimer) clearInterval(webIntervalTimer);

  // Har 60 second mein check karega ki koi slot miss toh nahi hua
  webIntervalTimer = setInterval(() => {
    const isEnabled = localStorage.getItem('herbalance_smart_reminders_enabled') === 'true';
    if (!isEnabled) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Check water reminders
    NOTIFICATION_SCHEDULES.forEach((slot) => {
      if (slot.hour === currentHour && slot.minute === currentMinute) {
        const lastSentKey = `last_alert_${slot.id}_${now.toDateString()}`;
        if (localStorage.getItem(lastSentKey)) return; // Aaj bhej chuke hain

        if (slot.type === 'water') {
          const currentWater = getCurrentWaterCount ? getCurrentWaterCount() : 0;
          // Agar user ne required glass tak nahi piya hai toh alert bhejo
          if (currentWater <= slot.slotIndex) {
            sendInstantNotification(slot.title, slot.body);
            localStorage.setItem(lastSentKey, 'sent');
          }
        } else if (slot.type.startsWith('med')) {
          const meds = getMedsList ? getMedsList() : [];
          const hasPending = meds.some((m) => !m.taken);
          if (hasPending) {
            sendInstantNotification(slot.title, slot.body);
            localStorage.setItem(lastSentKey, 'sent');
          }
        } else {
          // General health alerts (Movement / Sleep)
          sendInstantNotification(slot.title, slot.body);
          localStorage.setItem(lastSentKey, 'sent');
        }
      }
    });
  }, 60000);
}