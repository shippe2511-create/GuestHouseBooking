jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'ExponentPushToken[xxx]' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  AndroidImportance: { MAX: 5 },
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'timeInterval' },
}));

jest.mock('expo-device', () => ({
  isDevice: true,
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

import {
  registerForPushNotifications,
  scheduleLocalNotification,
  sendBookingNotification,
  sendPaymentNotification,
} from '../src/lib/notifications';
import * as Notifications from 'expo-notifications';

describe('Push notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerForPushNotifications', () => {
    it('should return push token on physical device', async () => {
      const token = await registerForPushNotifications();
      expect(token).toBe('ExponentPushToken[xxx]');
    });

    it('should request permissions if not granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
      });

      const token = await registerForPushNotifications();
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      expect(token).toBe('ExponentPushToken[xxx]');
    });
  });

  describe('scheduleLocalNotification', () => {
    it('should schedule notification with correct content', async () => {
      await scheduleLocalNotification('Test Title', 'Test Body', { key: 'value' });

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Test Title',
          body: 'Test Body',
          data: { key: 'value' },
          sound: true,
        },
        trigger: null,
      });
    });

    it('should schedule with delay when triggerSeconds provided', async () => {
      await scheduleLocalNotification('Title', 'Body', undefined, 60);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: expect.any(Object),
        trigger: { type: 'timeInterval', seconds: 60 },
      });
    });
  });

  describe('sendBookingNotification', () => {
    it('should send arrival notification', async () => {
      await sendBookingNotification('John Doe', '101', 'arrival');

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Guest Arriving',
          body: 'John Doe is checking into Room 101 today',
          data: { type: 'arrival', guestName: 'John Doe', roomNumber: '101' },
          sound: true,
        },
        trigger: null,
      });
    });

    it('should send departure notification', async () => {
      await sendBookingNotification('Jane Smith', '202', 'departure');

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Guest Departing',
          body: 'Jane Smith is checking out of Room 202 today',
          data: { type: 'departure', guestName: 'Jane Smith', roomNumber: '202' },
          sound: true,
        },
        trigger: null,
      });
    });
  });

  describe('sendPaymentNotification', () => {
    it('should send payment notification with formatted amount', async () => {
      await sendPaymentNotification('Guest Name', 2500, 'MVR');

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Payment Received',
          body: 'MVR 2,500 received from Guest Name',
          data: { type: 'payment', guestName: 'Guest Name', amount: 2500 },
          sound: true,
        },
        trigger: null,
      });
    });
  });
});
