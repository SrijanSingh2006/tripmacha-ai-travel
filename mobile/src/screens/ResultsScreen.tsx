import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Bookmark, BookmarkCheck, Check, Clock3, MapPin, Sparkles, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { formatDate, formatRupees } from '../data/demo';
import { colors } from '../theme';
import { TripPlan } from '../types';

type Props = {
  plan: TripPlan;
  isSaved: boolean;
  onBack: () => void;
  onToggleSaved: (plan: TripPlan) => void;
};

export default function ResultsScreen({ plan, isSaved, onBack, onToggleSaved }: Props) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Back to search">
          <ArrowLeft size={20} color={colors.ink} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Your trip plan</Text>
          <Text style={styles.headerCaption}>A little more adventure, a lot less admin.</Text>
        </View>
        <Pressable
          onPress={() => onToggleSaved(plan)}
          style={[styles.saveButton, isSaved && styles.saveButtonActive]}
          accessibilityRole="button"
          accessibilityLabel={isSaved ? 'Remove from saved trips' : 'Save trip'}
        >
          {isSaved ? <BookmarkCheck size={19} color={colors.primary} /> : <Bookmark size={19} color={colors.ink} />}
        </Pressable>
      </View>

      <LinearGradient colors={['#25365C', '#485E94', '#7287B9']} style={styles.destinationHero}>
        <View style={styles.heroGlow} />
        <View style={styles.liveBadge}>
          <View style={[styles.statusDot, plan.source === 'live' ? styles.statusLive : styles.statusDemo]} />
          <Text style={styles.liveBadgeText}>{plan.source === 'live' ? 'LIVE MATCHES' : 'READY-TO-EXPLORE PLAN'}</Text>
        </View>
        <Text style={styles.destinationName}>{plan.destination}</Text>
        <View style={styles.routeLine}>
          <MapPin size={14} color="#E4E9FB" />
          <Text style={styles.routeText}>{plan.origin}  →  {plan.destination}</Text>
        </View>
        <View style={styles.heroDetails}>
          <View style={styles.detailChip}>
            <Clock3 size={13} color="#F5F6FF" />
            <Text style={styles.detailChipText}>{plan.duration} days</Text>
          </View>
          <View style={styles.detailChip}>
            <Users size={13} color="#F5F6FF" />
            <Text style={styles.detailChipText}>{plan.travellers} travellers</Text>
          </View>
          <View style={styles.detailChip}>
            <Text style={styles.detailChipText}>{formatDate(plan.departureDate)}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.aiCard}>
        <View style={styles.aiIcon}>
          <Sparkles size={17} color={colors.primary} fill="#DDE1FF" />
        </View>
        <View style={styles.aiCopyWrap}>
          <Text style={styles.aiLabel}>YOUR TRIP, THOUGHTFULLY PLANNED</Text>
          <Text style={styles.aiCopy}>{plan.aiSummary}</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>The good stuff</Text>
          <Text style={styles.sectionCaption}>A simple bundle, all in one place.</Text>
        </View>
        <View style={styles.dealCount}>
          <Text style={styles.dealCountText}>{plan.deals.length} PICKS</Text>
        </View>
      </View>

      {plan.deals.map((deal) => (
        <View key={deal.id} style={styles.dealCard}>
          <View style={[styles.dealIcon, { backgroundColor: deal.accent }]}>
            <Text style={styles.dealIconText}>{deal.icon}</Text>
          </View>
          <View style={styles.dealCopy}>
            <Text style={styles.dealCategory}>{deal.category.toUpperCase()}</Text>
            <Text style={styles.dealTitle}>{deal.provider}</Text>
            <Text style={styles.dealDetail}>{deal.title}</Text>
            <Text style={styles.dealSubdetail}>{deal.detail}</Text>
          </View>
          <View style={styles.dealPriceWrap}>
            <Text style={styles.dealPrice}>{formatRupees(deal.price)}</Text>
            <Text style={styles.dealPriceCaption}>{deal.category === 'Stay' ? 'total' : 'per person'}</Text>
          </View>
        </View>
      ))}

      <View style={styles.totalCard}>
        <View style={styles.totalRow}>
          <View>
            <Text style={styles.totalCaption}>ESTIMATED TRIP TOTAL</Text>
            <Text style={styles.totalPrice}>{formatRupees(plan.totalPrice)}</Text>
          </View>
          <View style={styles.totalCheck}>
            <Check size={17} color="#FFFFFF" strokeWidth={3} />
          </View>
        </View>
        <Text style={styles.totalFootnote}>For {plan.travellers} travellers · Prices are estimates and can change.</Text>
        <View style={styles.totalDivider} />
        <Text style={styles.noBooking}>No booking is made in this demo. Review each provider before you travel.</Text>
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>A day at a time</Text>
          <Text style={styles.sectionCaption}>Keep it loose. Leave room for surprises.</Text>
        </View>
      </View>
      {plan.itinerary.map((item, index) => (
        <View key={item} style={styles.dayRow}>
          <View style={styles.dayNumber}>
            <Text style={styles.dayNumberText}>{String(index + 1).padStart(2, '0')}</Text>
          </View>
          <Text style={styles.dayCopy}>{item}</Text>
        </View>
      ))}
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  backButton: { width: 39, height: 39, borderRadius: 13, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  headerTitleWrap: { flex: 1, marginLeft: 11 },
  headerTitle: { color: colors.ink, fontWeight: '800', fontSize: 16 },
  headerCaption: { color: colors.muted, fontSize: 9, marginTop: 3 },
  saveButton: { height: 39, width: 39, borderRadius: 13, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  saveButtonActive: { backgroundColor: colors.lavender, borderColor: '#CDD2FF' },
  destinationHero: { minHeight: 184, borderRadius: 23, padding: 18, overflow: 'hidden', marginBottom: 13 },
  heroGlow: { position: 'absolute', width: 170, height: 170, borderRadius: 85, top: -70, right: -19, backgroundColor: 'rgba(255,255,255,0.12)' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 9 },
  statusDot: { width: 6, height: 6, borderRadius: 4, marginRight: 6 },
  statusLive: { backgroundColor: '#65E0B4' },
  statusDemo: { backgroundColor: '#FFE29B' },
  liveBadgeText: { color: '#F2F5FF', fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  destinationName: { color: '#FFFFFF', fontSize: 29, fontWeight: '800', letterSpacing: -0.75, marginTop: 15 },
  routeLine: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  routeText: { color: '#E4E9FB', fontSize: 11, fontWeight: '600', marginLeft: 5 },
  heroDetails: { flexDirection: 'row', marginTop: 16, flexWrap: 'wrap' },
  detailChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 9, paddingHorizontal: 8, paddingVertical: 6, marginRight: 6, marginBottom: 4 },
  detailChipText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700', marginLeft: 5 },
  aiCard: { flexDirection: 'row', padding: 14, borderRadius: 17, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border, marginBottom: 23 },
  aiIcon: { width: 32, height: 32, backgroundColor: colors.lavender, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  aiCopyWrap: { flex: 1 },
  aiLabel: { color: colors.primary, fontSize: 8, fontWeight: '800', letterSpacing: 0.75, marginTop: 1 },
  aiCopy: { color: colors.ink, fontSize: 11, lineHeight: 17, marginTop: 5 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '800', letterSpacing: -0.4 },
  sectionCaption: { color: colors.muted, fontSize: 10, marginTop: 4 },
  dealCount: { borderRadius: 8, backgroundColor: colors.lavender, paddingHorizontal: 8, paddingVertical: 5 },
  dealCountText: { color: colors.primary, fontWeight: '800', fontSize: 8, letterSpacing: 0.5 },
  dealCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 11, marginBottom: 9 },
  dealIcon: { width: 39, height: 39, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  dealIconText: { color: colors.ink, fontSize: 20, fontWeight: '700' },
  dealCopy: { flex: 1, marginLeft: 10, minWidth: 0 },
  dealCategory: { color: colors.muted, fontSize: 7, fontWeight: '800', letterSpacing: 0.8, marginBottom: 3 },
  dealTitle: { color: colors.ink, fontWeight: '800', fontSize: 11 },
  dealDetail: { color: '#59677E', fontSize: 9, marginTop: 3 },
  dealSubdetail: { color: colors.muted, fontSize: 8, marginTop: 2 },
  dealPriceWrap: { alignItems: 'flex-end', marginLeft: 7 },
  dealPrice: { color: colors.ink, fontWeight: '800', fontSize: 12 },
  dealPriceCaption: { color: colors.muted, fontSize: 8, marginTop: 3 },
  totalCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 15, marginTop: 6, marginBottom: 24 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalCaption: { color: colors.muted, fontSize: 8, fontWeight: '800', letterSpacing: 0.75 },
  totalPrice: { color: colors.ink, fontWeight: '800', fontSize: 23, letterSpacing: -0.5, marginTop: 4 },
  totalCheck: { width: 31, height: 31, borderRadius: 11, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  totalFootnote: { color: colors.muted, fontSize: 9, marginTop: 5 },
  totalDivider: { height: 1, backgroundColor: colors.border, marginVertical: 11 },
  noBooking: { color: colors.muted, fontSize: 9, lineHeight: 14 },
  dayRow: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border, borderRadius: 14, marginBottom: 8 },
  dayNumber: { width: 31, height: 31, borderRadius: 11, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  dayNumberText: { color: colors.green, fontSize: 9, fontWeight: '800' },
  dayCopy: { color: colors.ink, fontSize: 10, lineHeight: 15, flex: 1, marginLeft: 10 },
  bottomSpace: { height: 8 },
});
