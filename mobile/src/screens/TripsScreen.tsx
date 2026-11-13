import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowUpRight, CalendarDays, MapPin, Plane } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDate, formatRupees } from '../data/demo';
import { colors } from '../theme';
import { TripPlan } from '../types';

type Props = {
  trips: TripPlan[];
  onOpen: (trip: TripPlan) => void;
};

export default function TripsScreen({ trips, onOpen }: Props) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.eyebrow}>THE GOOD PLANS</Text>
          <Text style={styles.title}>My trips</Text>
          <Text style={styles.subtitle}>Your next stories start here.</Text>
        </View>
        <View style={styles.titleIcon}>
          <Plane size={21} color={colors.primary} />
        </View>
      </View>
      {trips.length === 0 ? (
        <View style={styles.emptyCard}>
          <LinearGradient colors={['#EEF0FF', '#E8F7F3']} style={styles.emptyArtwork}>
            <Text style={styles.emptyEmoji}>🧳</Text>
          </LinearGradient>
          <Text style={styles.emptyTitle}>Your next trip is waiting.</Text>
          <Text style={styles.emptyCopy}>Build a plan on Explore and it will be saved here on this device.</Text>
        </View>
      ) : (
        trips.map((trip) => (
          <Pressable
            key={trip.id}
            onPress={() => onOpen(trip)}
            style={({ pressed }) => [styles.tripCard, pressed && styles.tripCardPressed]}
            accessibilityRole="button"
          >
            <LinearGradient colors={tripCardColors(trip.destination)} style={styles.tripArtwork}>
              <View style={styles.tripArtworkTop}>
                <View style={styles.tripLabel}>
                  <Text style={styles.tripLabelText}>YOUR PLAN</Text>
                </View>
                <View style={styles.artIcon}>
                  <Text style={styles.artEmoji}>{destinationEmoji(trip.destination)}</Text>
                </View>
              </View>
              <Text style={styles.tripDestination}>{trip.destination}</Text>
              <View style={styles.tripRoute}>
                <MapPin size={12} color="#FFFFFF" />
                <Text style={styles.tripRouteText}>{trip.origin}  →  {trip.destination}</Text>
              </View>
            </LinearGradient>
            <View style={styles.tripInfo}>
              <View style={styles.tripMeta}>
                <View style={styles.metaItem}>
                  <CalendarDays size={13} color={colors.primary} />
                  <Text style={styles.metaText}>{formatDate(trip.departureDate)}</Text>
                </View>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.metaText}>{trip.duration} days</Text>
              </View>
              <View style={styles.tripFooter}>
                <Text style={styles.tripPrice}>{formatRupees(trip.totalPrice)}</Text>
                <View style={styles.openLabel}>
                  <Text style={styles.openLabelText}>VIEW PLAN</Text>
                  <ArrowUpRight size={13} color={colors.primary} />
                </View>
              </View>
            </View>
          </Pressable>
        ))
      )}
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

export function SavedScreen({ trips, onOpen, onRemove }: Props & { onRemove: (trip: TripPlan) => void }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.eyebrow}>KEEP THE GOOD ONES CLOSE</Text>
          <Text style={styles.title}>Saved trips</Text>
          <Text style={styles.subtitle}>Your little list of “one day soon”.</Text>
        </View>
        <View style={[styles.titleIcon, styles.savedTitleIcon]}>
          <Text style={styles.savedIcon}>♥</Text>
        </View>
      </View>
      {trips.length === 0 ? (
        <View style={styles.emptyCard}>
          <LinearGradient colors={['#FFF0EA', '#FFF6DE']} style={styles.emptyArtwork}>
            <Text style={styles.emptyEmoji}>💛</Text>
          </LinearGradient>
          <Text style={styles.emptyTitle}>Keep a trip for later.</Text>
          <Text style={styles.emptyCopy}>Tap the bookmark on any plan and it will be waiting right here.</Text>
        </View>
      ) : (
        trips.map((trip) => (
          <View key={trip.id} style={styles.savedRow}>
            <Pressable onPress={() => onOpen(trip)} style={styles.savedMain} accessibilityRole="button">
              <View style={[styles.savedPlaceIcon, { backgroundColor: colors.lavender }]}>
                <Text style={styles.savedPlaceEmoji}>{destinationEmoji(trip.destination)}</Text>
              </View>
              <View style={styles.savedCopy}>
                <Text style={styles.savedDestination}>{trip.destination}</Text>
                <Text style={styles.savedRoute}>{trip.origin} · {trip.duration} days</Text>
                <Text style={styles.savedPrice}>{formatRupees(trip.totalPrice)} estimated</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => onRemove(trip)} style={styles.removeButton} accessibilityRole="button" accessibilityLabel="Remove saved trip">
              <Text style={styles.removeText}>×</Text>
            </Pressable>
          </View>
        ))
      )}
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

function destinationEmoji(destination: string) {
  const value = destination.toLowerCase();
  if (value.includes('goa') || value.includes('beach')) return '🏝️';
  if (value.includes('kerala')) return '🛶';
  if (value.includes('manali') || value.includes('mountain')) return '🏔️';
  if (value.includes('jaipur') || value.includes('udaipur')) return '🏰';
  return '🌤️';
}

function tripCardColors(destination: string) {
  const value = destination.toLowerCase();
  if (value.includes('kerala')) return ['#288E82', '#7CCB9C'] as const;
  if (value.includes('manali')) return ['#4D6594', '#93BCD2'] as const;
  if (value.includes('jaipur')) return ['#C3694D', '#E4B36A'] as const;
  return ['#4D69B3', '#59A7BE'] as const;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 23, paddingBottom: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 21 },
  eyebrow: { color: colors.primary, fontSize: 9, fontWeight: '800', letterSpacing: 1.15, marginBottom: 7 },
  title: { color: colors.ink, fontSize: 29, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { color: colors.muted, fontSize: 12, marginTop: 6 },
  titleIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center' },
  savedTitleIcon: { backgroundColor: '#FFF0EA' },
  savedIcon: { color: colors.coral, fontWeight: '800', fontSize: 21 },
  emptyCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border, borderRadius: 21, padding: 16, alignItems: 'center' },
  emptyArtwork: { width: '100%', height: 150, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 58 },
  emptyTitle: { color: colors.ink, fontWeight: '800', fontSize: 16, marginTop: 18 },
  emptyCopy: { color: colors.muted, fontSize: 11, textAlign: 'center', lineHeight: 17, marginTop: 7, maxWidth: 230 },
  tripCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border, borderRadius: 20, overflow: 'hidden', marginBottom: 13 },
  tripCardPressed: { opacity: 0.87 },
  tripArtwork: { height: 148, padding: 15, justifyContent: 'space-between', overflow: 'hidden' },
  tripArtworkTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  tripLabel: { borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 5 },
  tripLabelText: { color: '#FFFFFF', fontSize: 8, fontWeight: '800', letterSpacing: 0.7 },
  artIcon: { width: 62, height: 62, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  artEmoji: { fontSize: 39 },
  tripDestination: { color: '#FFFFFF', fontSize: 25, fontWeight: '800', letterSpacing: -0.5 },
  tripRoute: { flexDirection: 'row', alignItems: 'center', marginTop: -2 },
  tripRouteText: { color: '#F1F4FF', fontSize: 10, fontWeight: '600', marginLeft: 5 },
  tripInfo: { padding: 13 },
  tripMeta: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { color: colors.muted, fontSize: 10, fontWeight: '600', marginLeft: 5 },
  metaDot: { color: '#B2B9C7', marginHorizontal: 8 },
  tripFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 11 },
  tripPrice: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  openLabel: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lavender, borderRadius: 9, paddingHorizontal: 8, paddingVertical: 6 },
  openLabelText: { color: colors.primary, fontSize: 8, fontWeight: '800', letterSpacing: 0.55, marginRight: 4 },
  savedRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border, borderRadius: 17, padding: 11, marginBottom: 9 },
  savedMain: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  savedPlaceIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  savedPlaceEmoji: { fontSize: 29 },
  savedCopy: { marginLeft: 10, flex: 1 },
  savedDestination: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  savedRoute: { color: colors.muted, fontSize: 9, marginTop: 4 },
  savedPrice: { color: colors.green, fontSize: 9, fontWeight: '700', marginTop: 4 },
  removeButton: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#FFF1EE', alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
  removeText: { color: colors.coral, fontSize: 22, lineHeight: 25 },
  bottomSpace: { height: 8 },
});
