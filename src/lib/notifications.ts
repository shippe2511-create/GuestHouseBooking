import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563eb',
    });
  }

  const token = await Notifications.getExpoPushTokenAsync({
    projectId: 'your-project-id', // Replace with actual Expo project ID
  });

  return token.data;
}

export async function savePushToken(userId: string, token: string) {
  try {
    await supabase
      .from('users')
      .update({ push_token: token })
      .eq('id', userId);
  } catch (error) {
    console.error('Error saving push token:', error);
  }
}

export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
  triggerSeconds?: number
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: triggerSeconds ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: triggerSeconds } : null,
  });
}

export async function sendBookingNotification(
  guestName: string,
  roomNumber: string,
  type: 'arrival' | 'departure'
) {
  const title = type === 'arrival' ? 'Guest Arriving' : 'Guest Departing';
  const body =
    type === 'arrival'
      ? `${guestName} is checking into Room ${roomNumber} today`
      : `${guestName} is checking out of Room ${roomNumber} today`;

  await scheduleLocalNotification(title, body, { type, guestName, roomNumber });
}

export async function sendPaymentNotification(
  guestName: string,
  amount: number,
  currency: string
) {
  await scheduleLocalNotification(
    'Payment Received',
    `${currency} ${amount.toLocaleString()} received from ${guestName}`,
    { type: 'payment', guestName, amount }
  );
}

export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
