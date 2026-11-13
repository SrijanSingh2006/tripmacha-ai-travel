import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Bookmark, Compass, Luggage, UserRound } from 'lucide-react-native';
import { apiMode, buildTrip } from './src/api';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import TripsScreen, { SavedScreen } from './src/screens/TripsScreen';
import { scheduleDemoReminder } from './src/notifications';
import {
  loadProfile,
  loadSavedTrips,
  loadTrips,
  persistProfile,
  persistSavedTrips,
  persistTrips,
} from './src/storage';
import { colors } from './src/theme';
import { Profile, TabKey, TripPlan } from './src/types';

const emptyProfile = { name: '', email: '' };

export default function App() {
  const [tab, setTab] = useState<TabKey>('explore');
  const [activeTrip, setActiveTrip] = useState<TripPlan | null>(null);
  const [trips, setTrips] = useState<TripPlan[]>([]);
  const [savedTrips, setSavedTrips] = useState<TripPlan[]>([]);
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [isSearching, setIsSearching] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([loadTrips(), loadSavedTrips(), loadProfile()])
      .then(([loadedTrips, loadedSaved, loadedProfile]) => {
        if (!active) return;
        setTrips(loadedTrips);
        setSavedTrips(loadedSaved);
        setProfile(loadedProfile);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSearch = async (input: Parameters<typeof buildTrip>[0]) => {
    setIsSearching(true);
    try {
      const plan = await buildTrip(input);
      setActiveTrip(plan);
      setTab('explore');
      setTrips((current) => {
        const next = [plan, ...current.filter((trip) => trip.id !== plan.id)].slice(0, 30);
        void persistTrips(next);
        return next;
      });
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSaved = (plan: TripPlan) => {
    setSavedTrips((current) => {
      const exists = current.some((trip) => trip.id === plan.id);
      const next = exists ? current.filter((trip) => trip.id !== plan.id) : [plan, ...current];
      void persistSavedTrips(next);
      return next;
    });
  };

  const removeSaved = (plan: TripPlan) => {
    setSavedTrips((current) => {
      const next = current.filter((trip) => trip.id !== plan.id);
      void persistSavedTrips(next);
      return next;
    });
  };

  const openTrip = (plan: TripPlan) => {
    setActiveTrip(plan);
    setTab('explore');
  };

  const selectTab = (nextTab: TabKey) => {
    setActiveTrip(null);
    setTab(nextTab);
  };

  const saveProfile = async (next: Profile) => {
    await persistProfile(next);
    setProfile(next);
  };

  const showScreen = () => {
    if (tab === 'explore') {
      return activeTrip ? (
        <ResultsScreen
          plan={activeTrip}
          isSaved={savedTrips.some((trip) => trip.id === activeTrip.id)}
          onBack={() => setActiveTrip(null)}
          onToggleSaved={toggleSaved}
        />
      ) : (
        <HomeScreen
          name={profile.name}
          isSearching={isSearching}
          onSearch={(input) => void handleSearch(input)}
        />
      );
    }
    if (tab === 'trips') return <TripsScreen trips={trips} onOpen={openTrip} />;
    if (tab === 'saved') return <SavedScreen trips={savedTrips} onOpen={openTrip} onRemove={removeSaved} />;
    return (
      <ProfileScreen
        profile={profile}
        tripCount={trips.length}
        savedCount={savedTrips.length}
        onSave={saveProfile}
        onReminder={scheduleDemoReminder}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        {!ready ? (
          <View style={styles.loading}>
            <View style={styles.loadingMark}>
              <Compass size={23} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <ActivityIndicator color={colors.primary} style={styles.loadingSpinner} />
            <Text style={styles.loadingText}>Getting the good bits ready…</Text>
          </View>
        ) : (
          <>
            <View style={styles.screen}>{showScreen()}</View>
            <View style={styles.bottomBar}>
              <TabButton
                label="Explore"
                icon="explore"
                selected={tab === 'explore'}
                onPress={() => selectTab('explore')}
              />
              <TabButton
                label="My trips"
                icon="trips"
                count={trips.length}
                selected={tab === 'trips'}
                onPress={() => selectTab('trips')}
              />
              <TabButton
                label="Saved"
                icon="saved"
                count={savedTrips.length}
                selected={tab === 'saved'}
                onPress={() => selectTab('saved')}
              />
              <TabButton
                label="Profile"
                icon="profile"
                selected={tab === 'profile'}
                onPress={() => selectTab('profile')}
              />
            </View>
            <View style={styles.modeHint}>
              <View style={[styles.modeDot, apiMode === 'Offline demo' ? styles.demoDot : styles.liveDot]} />
              <Text style={styles.modeText}>{apiMode === 'Offline demo' ? 'DEMO MODE' : 'CONNECTED TO TRIP API'}</Text>
            </View>
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

type TabButtonProps = {
  label: string;
  icon: TabKey;
  selected: boolean;
  count?: number;
  onPress: () => void;
};

function TabButton({ label, icon, selected, count, onPress }: TabButtonProps) {
  const tint = selected ? colors.primary : '#9AA4B6';
  const iconProps = { size: 19, color: tint, strokeWidth: selected ? 2.5 : 2 };
  const Icon =
    icon === 'explore'
      ? Compass
      : icon === 'trips'
        ? Luggage
        : icon === 'saved'
          ? Bookmark
          : UserRound;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tabButton, pressed && styles.tabPressed]}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <View style={styles.tabIconWrap}>
        <Icon {...iconProps} />
        {count ? <View style={styles.tabCount}><Text style={styles.tabCountText}>{count > 9 ? '9+' : count}</Text></View> : null}
      </View>
      <Text style={[styles.tabLabel, selected && styles.tabLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? 0 : 0 },
  screen: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingMark: { width: 53, height: 53, borderRadius: 19, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  loadingSpinner: { marginTop: 18 },
  loadingText: { color: colors.muted, fontSize: 11, marginTop: 9 },
  bottomBar: {
    minHeight: 61,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'android' ? 4 : 1,
    borderTopWidth: 1,
    borderTopColor: '#E8EBF2',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabButton: { flex: 1, height: 50, alignItems: 'center', justifyContent: 'center' },
  tabPressed: { opacity: 0.65 },
  tabIconWrap: { minWidth: 25, height: 22, alignItems: 'center', justifyContent: 'center' },
  tabCount: { position: 'absolute', right: -9, top: -4, minWidth: 14, height: 14, borderRadius: 7, backgroundColor: colors.coral, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  tabCountText: { color: '#FFFFFF', fontSize: 7, fontWeight: '800' },
  tabLabel: { color: '#9AA4B6', fontSize: 8, fontWeight: '600', marginTop: 3 },
  tabLabelSelected: { color: colors.primary, fontWeight: '800' },
  modeHint: { backgroundColor: '#FFFFFF', height: 19, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: 3 },
  modeDot: { width: 5, height: 5, borderRadius: 3, marginRight: 5 },
  demoDot: { backgroundColor: colors.gold },
  liveDot: { backgroundColor: colors.green },
  modeText: { color: colors.muted, fontSize: 7, fontWeight: '800', letterSpacing: 0.8 },
});
