import { LocalNotifications } from '@capacitor/local-notifications';

// 1. Check aur Request Permission
export const requestNotificationPermission = async () => {
  const status = await LocalNotifications.checkPermissions();
  if (status.display !== 'granted') {
    const request = await LocalNotifications.requestPermissions();
    return request.display === 'granted';
  }
  return true;
};

// 2. Immediate / Test Notification (Turant dekhne ke liye)
export const sendInstantNotification = async (title, body) => {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  await LocalNotifications.schedule({
    notifications: [
      {
        id: 1,
        title: title || "HerBalance Reminder 🌸",
        body: body || "Don't forget your scheduled PCOD care routine today!",
        schedule: { at: new Date(Date.now() + 1000 * 5) }, // 5 second baad pop up hoga
        sound: undefined,
        actionTypeId: "",
        extra: null
      }
    ]
  });
};

// 3. Daily Scheduled Reminder (Roz fix time par trigger hoga - app band hone par bhi)
export const scheduleDailyReminder = async (id, title, body, hour, minute) => {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return;

  await LocalNotifications.schedule({
    notifications: [
      {
        id: id,
        title: title,
        body: body,
        schedule: {
          on: {
            hour: hour,       // 24-hour format: jaise 9 baje subah -> 9, shaam 8 baje -> 20
            minute: minute
          },
          allowWhileIdle: true // Battery saver / phone sleep mode mein bhi alarm bajega
        }
      }
    ]
  });
};