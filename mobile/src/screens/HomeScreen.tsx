import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { ArrowRight, CalendarDays, ChevronDown, MapPin, Plane, Sparkles, Users } from 'lucide-react-native';
import { dateAfter, formatDate } from '../data/demo';
import { colors } from '../theme';
import { BudgetTier, SearchInput } from '../types';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  name: string;
  isSearching: boolean;
  onSearch: (input: SearchInput) => void;
};

const destinations = [
  { name: 'Goa', note: 'Beaches & brunch', icon: '🏝️', colors: ['#427ECA', '#83C9DE'] as const },
  { name: 'Manali', note: 'Mountains & mist', icon: '🏔️', colors: ['#526DA8', '#A6C9D5'] as const },
  { name: 'Kerala', note: 'Slow backwaters', icon: '🌴', colors: ['#389C8A', '#A7D88F'] as const },
];

export default function HomeScreen({ name, isSearching, onSearch }: Props) {
  const [origin, setOrigin] = useState('Bengaluru');
  const [destination, setDestination] = useState('Goa');
  const [departureDate, setDepartureDate] = useState(dateAfter(14));
  const [duration, setDuration] = useState(4);
  const [travellers, setTravellers] = useState(2);
  const [budget, setBudget] = useState<BudgetTier>('Moderate');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const dateValue = new Date(departureDate + 'T12:00:00');

  const selectDate = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: dateValue,
        mode: 'date',
        minimumDate: new Date(),
        onChange: (_event, selectedDate) => {
          if (selectedDate) setDepartureDate(toIsoDate(selectedDate));
        },
      });
    } else if (Platform.OS === 'ios') {
      setDatePickerOpen((visible) => !visible);
    } else {
      setDepartureDate(dateAfter(14));
    }
  };

  const startSearch = () => {
    onSearch({
      origin: origin.trim() || 'Bengaluru',
      destination: destination.trim() || 'Goa',
      departureDate,
      duration,
      travellers,
      budget,
    });
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topbar}>
        <View style={styles.brandMark}>
          <Plane size={20} color="#FFFFFF" strokeWidth={2.5} />
        </View>
        <View style={styles.brandText}>
          <Text style={styles.brand}>TripMacha</Text>
          <Text style={styles.brandCaption}>YOUR INDIA TRAVEL CO-PILOT</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial(name)}</Text>
        </View>
      </View>

      <View style={styles.greeting}>
        <Text style={styles.eyebrow}>NAMASKARA, {firstName(name).toUpperCase()}</Text>
        <Text style={styles.heading}>Go somewhere{'\n'}good for the soul.</Text>
        <Text style={styles.subheading}>Your next great India trip starts here.</Text>
      </View>

      <LinearGradient
        colors={['#586EF7', '#7963E9', '#A46EE4']}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroOrbOne} />
        <View style={styles.heroOrbTwo} />
        <View style={styles.heroTextWrap}>
          <View style={styles.heroBadge}>
            <Sparkles size={13} color="#FFF1B8" fill="#FFF1B8" />
            <Text style={styles.heroBadgeText}>YOUR PERSONAL TRIP PLANNER</Text>
          </View>
          <Text style={styles.heroTitle}>Less planning.{'\n'}More living.</Text>
          <Text style={styles.heroCopy}>Flights, stays and local picks—thoughtfully bundled.</Text>
        </View>
        <View style={styles.heroArt}>
          <Text style={styles.heroEmoji}>✈️</Text>
          <View style={styles.heroCloud}>
            <Text style={styles.heroDestination}>INDIA</Text>
          </View>
        </View>
        <View style={styles.heroFoot}>
          <View style={styles.heroDotActive} />
          <View style={styles.heroDot} />
          <View style={styles.heroDot} />
          <Text style={styles.heroFootText}>Built around your budget</Text>
        </View>
      </LinearGradient>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionTitle}>Plan a trip</Text>
          <Text style={styles.sectionNote}>A few details, then we do the legwork.</Text>
        </View>
        <View style={styles.aiPill}>
          <Sparkles size={12} color={colors.primary} />
          <Text style={styles.aiPillText}>AI PLANNER</Text>
        </View>
      </View>

      <View style={styles.searchCard}>
        <View style={styles.routeRow}>
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>FROM</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={17} color={colors.muted} />
              <TextInput
                value={origin}
                onChangeText={setOrigin}
                placeholder="Your city"
                placeholderTextColor="#AAB2C1"
                style={styles.textInput}
                accessibilityLabel="Departure city"
                returnKeyType="next"
              />
            </View>
          </View>
          <View style={styles.routeArrow}>
            <ArrowRight size={17} color={colors.primary} />
          </View>
          <View style={styles.inputBlock}>
            <Text style={styles.inputLabel}>TO</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={17} color={colors.coral} />
              <TextInput
                value={destination}
                onChangeText={setDestination}
                placeholder="Where to?"
                placeholderTextColor="#AAB2C1"
                style={styles.textInput}
                accessibilityLabel="Destination"
                returnKeyType="done"
              />
            </View>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.tripMeta}>
          <Pressable onPress={selectDate} style={styles.metaItem} accessibilityRole="button">
            <CalendarDays size={17} color={colors.primary} />
            <View style={styles.metaTextWrap}>
              <Text style={styles.inputLabel}>DEPARTURE</Text>
              <Text style={styles.metaValue}>{formatDate(departureDate)}</Text>
            </View>
            <ChevronDown size={15} color={colors.muted} />
          </Pressable>
          <View style={styles.metaDivider} />
          <Pressable
            onPress={() => setDuration((days) => (days >= 7 ? 2 : days + 1))}
            style={styles.metaItem}
            accessibilityRole="button"
            accessibilityLabel="Change trip length"
          >
            <CalendarDays size={17} color={colors.green} />
            <View style={styles.metaTextWrap}>
              <Text style={styles.inputLabel}>LENGTH</Text>
              <Text style={styles.metaValue}>{duration} days</Text>
            </View>
            <ChevronDown size={15} color={colors.muted} />
          </Pressable>
        </View>

        {Platform.OS === 'ios' && datePickerOpen ? (
          <DateTimePicker
            value={dateValue}
            mode="date"
            display="compact"
            minimumDate={new Date()}
            onChange={(_event, selectedDate) => {
              if (selectedDate) setDepartureDate(toIsoDate(selectedDate));
            }}
            style={styles.iosDatePicker}
          />
        ) : null}

        <View style={styles.separator} />
        <View style={styles.budgetHeading}>
          <Text style={styles.inputLabel}>YOUR COMFORT ZONE</Text>
          <View style={styles.travellers}>
            <Users size={15} color={colors.muted} />
            <Pressable onPress={() => setTravellers(Math.max(1, travellers - 1))} hitSlop={8}>
              <Text style={styles.travellerButton}>−</Text>
            </Pressable>
            <Text style={styles.travellerCount}>{travellers}</Text>
            <Pressable onPress={() => setTravellers(Math.min(9, travellers + 1))} hitSlop={8}>
              <Text style={styles.travellerButton}>+</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.budgetRow}>
          {(['Shoestring', 'Moderate', 'Premium'] as BudgetTier[]).map((tier) => {
            const selected = budget === tier;
            return (
              <Pressable
                key={tier}
                onPress={() => setBudget(tier)}
                style={[styles.budgetChip, selected && styles.budgetChipSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.budgetText, selected && styles.budgetTextSelected]}>{tier}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={startSearch}
          disabled={isSearching}
          style={({ pressed }) => [
            styles.searchButton,
            pressed && !isSearching && styles.searchButtonPressed,
            isSearching && styles.searchButtonBusy,
          ]}
          accessibilityRole="button"
        >
          <Sparkles size={18} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.searchButtonText}>{isSearching ? 'Putting your trip together…' : 'Build my trip'}</Text>
          {!isSearching ? <ArrowRight size={18} color="#FFFFFF" /> : null}
        </Pressable>
        <Text style={styles.searchFootnote}>Free to explore · No booking commitment</Text>
      </View>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionTitle}>A little inspiration</Text>
          <Text style={styles.sectionNote}>Tap a place to make it your next trip.</Text>
        </View>
        <Text style={styles.viewAll}>SEE ALL</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.destinationRail}>
        {destinations.map((place) => (
          <Pressable
            key={place.name}
            onPress={() => setDestination(place.name)}
            style={({ pressed }) => [styles.destinationCard, pressed && styles.destinationPressed]}
            accessibilityRole="button"
            accessibilityLabel={'Choose ' + place.name}
          >
            <LinearGradient colors={[...place.colors]} style={styles.destinationArtwork}>
              <View style={styles.destinationSun} />
              <Text style={styles.destinationEmoji}>{place.icon}</Text>
              <View style={styles.destinationTag}>
                <Text style={styles.destinationTagText}>✦  CURATED</Text>
              </View>
            </LinearGradient>
            <View style={styles.destinationCopy}>
              <Text style={styles.destinationName}>{place.name}</Text>
              <Text style={styles.destinationNote}>{place.note}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

function firstName(value: string) {
  return value.trim().split(/\s+/)[0] || 'Explorer';
}

function initial(value: string) {
  return firstName(value).charAt(0).toUpperCase();
}

function toIsoDate(value: Date) {
  return (
    value.getFullYear() +
    '-' +
    String(value.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(value.getDate()).padStart(2, '0')
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 18 },
  topbar: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { marginLeft: 10, flex: 1 },
  brand: { color: colors.ink, fontSize: 17, fontWeight: '800', letterSpacing: -0.35 },
  brandCaption: { color: colors.muted, fontSize: 8, fontWeight: '700', letterSpacing: 1.2, marginTop: 2 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF0E6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: { color: '#BB653C', fontWeight: '800', fontSize: 15 },
  greeting: { marginBottom: 19 },
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.35, marginBottom: 8 },
  heading: { color: colors.ink, fontSize: 30, lineHeight: 35, fontWeight: '800', letterSpacing: -0.85 },
  subheading: { color: colors.muted, fontSize: 13, marginTop: 8, lineHeight: 18 },
  hero: {
    minHeight: 174,
    borderRadius: 24,
    paddingHorizontal: 19,
    paddingTop: 17,
    paddingBottom: 14,
    overflow: 'hidden',
    marginBottom: 26,
    justifyContent: 'space-between',
  },
  heroOrbOne: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.09)', top: -77, right: -31 },
  heroOrbTwo: { position: 'absolute', width: 138, height: 138, borderRadius: 69, backgroundColor: 'rgba(255,255,255,0.07)', bottom: -100, left: 110 },
  heroTextWrap: { width: '67%', zIndex: 1 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', marginBottom: 11 },
  heroBadgeText: { color: '#F5F4FF', fontSize: 8, fontWeight: '800', letterSpacing: 0.95, marginLeft: 5 },
  heroTitle: { color: '#FFFFFF', fontSize: 23, lineHeight: 26, fontWeight: '800', letterSpacing: -0.5 },
  heroCopy: { color: '#ECEBFF', fontSize: 10, lineHeight: 15, marginTop: 6, maxWidth: 205 },
  heroArt: { position: 'absolute', right: 11, top: 27, width: 112, height: 104, alignItems: 'center', justifyContent: 'center' },
  heroEmoji: { fontSize: 55, transform: [{ rotate: '-14deg' }] },
  heroCloud: { borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.19)', paddingHorizontal: 9, paddingVertical: 4, transform: [{ rotate: '-8deg' }], marginTop: -3 },
  heroDestination: { color: '#FFFFFF', fontSize: 8, fontWeight: '900', letterSpacing: 1.5 },
  heroFoot: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  heroDotActive: { width: 15, height: 5, borderRadius: 3, backgroundColor: '#FFFFFF', marginRight: 4 },
  heroDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.45)', marginRight: 4 },
  heroFootText: { color: '#F0EEFF', fontSize: 9, marginLeft: 7, fontWeight: '600' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  sectionNote: { color: colors.muted, fontSize: 11, marginTop: 4 },
  aiPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lavender, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 10 },
  aiPillText: { color: colors.primary, fontSize: 8, fontWeight: '800', letterSpacing: 0.55, marginLeft: 4 },
  searchCard: {
    padding: 15,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 26,
    shadowColor: '#1D2D4F',
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center' },
  inputBlock: { flex: 1, backgroundColor: '#F8F9FC', borderRadius: 14, paddingHorizontal: 10, paddingTop: 9, paddingBottom: 8, minWidth: 0 },
  inputLabel: { color: '#98A1B2', fontSize: 8, fontWeight: '800', letterSpacing: 0.95, marginBottom: 6 },
  inputWithIcon: { flexDirection: 'row', alignItems: 'center' },
  textInput: { flex: 1, color: colors.ink, fontSize: 12, fontWeight: '700', padding: 0, marginLeft: 6, minWidth: 0 },
  routeArrow: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center', marginHorizontal: 7 },
  separator: { height: 1, backgroundColor: '#EEF0F5', marginVertical: 13 },
  tripMeta: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flex: 1, flexDirection: 'row', alignItems: 'center', minWidth: 0 },
  metaTextWrap: { flex: 1, marginLeft: 8 },
  metaValue: { color: colors.ink, fontSize: 11, fontWeight: '700' },
  metaDivider: { width: 1, height: 31, backgroundColor: colors.border, marginHorizontal: 11 },
  iosDatePicker: { alignSelf: 'center', marginTop: 3 },
  budgetHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  travellers: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 7, backgroundColor: '#F8F9FC', borderRadius: 9, height: 28 },
  travellerButton: { color: colors.primary, fontSize: 18, fontWeight: '600', paddingHorizontal: 7, lineHeight: 22 },
  travellerCount: { color: colors.ink, fontSize: 11, fontWeight: '700', minWidth: 12, textAlign: 'center' },
  budgetRow: { flexDirection: 'row', marginTop: 9, marginBottom: 14 },
  budgetChip: { flex: 1, height: 34, borderRadius: 11, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 7 },
  budgetChipSelected: { backgroundColor: colors.lavender, borderColor: '#C7CDFF' },
  budgetText: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  budgetTextSelected: { color: colors.primaryDark },
  searchButton: { backgroundColor: colors.primary, borderRadius: 14, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  searchButtonPressed: { backgroundColor: colors.primaryDark },
  searchButtonBusy: { opacity: 0.72 },
  searchButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', flex: 1, textAlign: 'center', marginLeft: 8 },
  searchFootnote: { textAlign: 'center', fontSize: 9, fontWeight: '600', color: colors.muted, marginTop: 9 },
  viewAll: { color: colors.primary, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  destinationRail: { paddingRight: 20 },
  destinationCard: { width: 152, borderRadius: 17, backgroundColor: colors.surface, overflow: 'hidden', marginRight: 11, borderWidth: 1, borderColor: colors.border },
  destinationPressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  destinationArtwork: { height: 91, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  destinationSun: { position: 'absolute', width: 63, height: 63, borderRadius: 32, right: 16, top: 11, backgroundColor: 'rgba(255,245,204,0.5)' },
  destinationEmoji: { fontSize: 44, textShadowColor: 'rgba(29,45,79,0.15)', textShadowRadius: 8, textShadowOffset: { width: 0, height: 3 } },
  destinationTag: { position: 'absolute', left: 9, top: 8, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.85)', paddingHorizontal: 6, paddingVertical: 4 },
  destinationTagText: { color: colors.ink, fontSize: 7, fontWeight: '800', letterSpacing: 0.45 },
  destinationCopy: { paddingHorizontal: 11, paddingVertical: 9 },
  destinationName: { color: colors.ink, fontWeight: '800', fontSize: 12 },
  destinationNote: { color: colors.muted, fontSize: 9, marginTop: 3 },
  bottomSpace: { height: 7 },
});
