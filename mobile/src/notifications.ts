import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function scheduleDemoReminder(): Promise<void> {
  if (Platform.OS === 'web') {
    throw new Error('Trip reminders are available in the Android and iOS app.');
  }

  const settings = await Notifications.getPermissionsAsync();
  const permission = settings.granted
    ? settings
    : await Notifications.requestPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Allow notifications in your device settings to try a reminder.');
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('trip-reminders', {
      name: 'Trip reminders',
      importance: AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 200, 250],
      lightColor: '#5369F8',
    });
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Your next escape is getting closer ✈',
      body: 'Your TripMacha reminder is working. Time to get excited!',
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      channelId: 'trip-reminders',
    },
  });
}
