import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { Profile, TripPlan } from './types';

const TRIPS_KEY = '@tripmacha/trips-v1';
const SAVED_KEY = '@tripmacha/saved-v1';
const PROFILE_KEY = '@tripmacha/profile-v1';

async function readList(key: string): Promise<TripPlan[]> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

export const loadTrips = () => readList(TRIPS_KEY);
export const loadSavedTrips = () => readList(SAVED_KEY);

export async function persistTrips(trips: TripPlan[]): Promise<void> {
  await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

export async function persistSavedTrips(trips: TripPlan[]): Promise<void> {
  await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(trips));
}

export async function loadProfile(): Promise<Profile> {
  try {
    const value =
      Platform.OS === 'web'
        ? await AsyncStorage.getItem(PROFILE_KEY)
        : await SecureStore.getItemAsync(PROFILE_KEY);
    if (value) return JSON.parse(value);
  } catch {
    // Keep the app usable if secure storage is temporarily unavailable.
  }
  return { name: '', email: '' };
}

export async function persistProfile(profile: Profile): Promise<void> {
  const value = JSON.stringify(profile);
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(PROFILE_KEY, value);
  } else {
    await SecureStore.setItemAsync(PROFILE_KEY, value);
  }
}
