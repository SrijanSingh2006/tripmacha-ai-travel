import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BellRing, Check, ChevronRight, LockKeyhole, Mail, ShieldCheck, Smartphone, UserRound } from 'lucide-react-native';
import { colors } from '../theme';
import { Profile } from '../types';

type Props = {
  profile: Profile;
  tripCount: number;
  savedCount: number;
  onSave: (profile: Profile) => Promise<void>;
  onReminder: () => Promise<void>;
};

export default function ProfileScreen({ profile, tripCount, savedCount, onSave, onReminder }: Props) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [saved, setSaved] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);

  const saveProfile = async () => {
    const next = { name: name.trim(), email: email.trim() };
    await onSave(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const testReminder = async () => {
    setReminderLoading(true);
    try {
      await onReminder();
      Alert.alert('Reminder is set', 'You will see a TripMacha notification in about five seconds.');
    } catch (error) {
      Alert.alert('Notifications', error instanceof Error ? error.message : 'Please try again on your Android or iOS device.');
    } finally {
      setReminderLoading(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>YOUR TRIPMACHA SPACE</Text>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Your travel details stay on this device.</Text>

      <View style={styles.identityCard}>
        <View style={styles.avatar}>
          <UserRound size={26} color="#FFFFFF" />
        </View>
        <View style={styles.identityCopy}>
          <Text style={styles.identityName}>{name.trim() || 'Curious traveller'}</Text>
          <Text style={styles.identityEmail}>{email.trim() || 'Add your details below'}</Text>
        </View>
        <View style={styles.deviceBadge}>
          <LockKeyhole size={13} color={colors.green} />
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{tripCount}</Text>
          <Text style={styles.statLabel}>TRIPS PLANNED</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{savedCount}</Text>
          <Text style={styles.statLabel}>TRIPS SAVED</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Your details</Text>
      <View style={styles.formCard}>
        <View style={styles.fieldRow}>
          <UserRound size={16} color={colors.muted} />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#AAB2C1"
            style={styles.input}
            accessibilityLabel="Your name"
            autoCapitalize="words"
          />
        </View>
        <View style={styles.fieldDivider} />
        <View style={styles.fieldRow}>
          <Mail size={16} color={colors.muted} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            placeholderTextColor="#AAB2C1"
            style={styles.input}
            accessibilityLabel="Email address"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <Pressable onPress={saveProfile} style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]} accessibilityRole="button">
          {saved ? <Check size={16} color="#FFFFFF" /> : null}
          <Text style={styles.saveButtonText}>{saved ? 'Saved securely' : 'Save my details'}</Text>
        </Pressable>
        <View style={styles.privacyNote}>
          <ShieldCheck size={13} color={colors.green} />
          <Text style={styles.privacyCopy}>Stored locally with your device’s secure storage.</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>On your next trip</Text>
      <Pressable
        onPress={testReminder}
        disabled={reminderLoading}
        style={({ pressed }) => [styles.settingRow, pressed && styles.settingPressed]}
        accessibilityRole="button"
      >
        <View style={[styles.settingIcon, { backgroundColor: colors.lavender }]}>
          <BellRing size={17} color={colors.primary} />
        </View>
        <View style={styles.settingCopy}>
          <Text style={styles.settingTitle}>Try a trip reminder</Text>
          <Text style={styles.settingCaption}>A local notification, five seconds from now</Text>
        </View>
        <ChevronRight size={17} color={colors.muted} />
      </Pressable>

      <View style={styles.platformNote}>
        <Smartphone size={16} color={colors.muted} />
        <View style={styles.platformCopy}>
          <Text style={styles.platformTitle}>Made for Android & iOS</Text>
          <Text style={styles.platformCaption}>This is your cross-platform TripMacha mobile companion.</Text>
        </View>
      </View>
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 25, paddingBottom: 20 },
  eyebrow: { color: colors.primary, fontSize: 9, fontWeight: '800', letterSpacing: 1.15, marginBottom: 7 },
  title: { color: colors.ink, fontSize: 29, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { color: colors.muted, fontSize: 12, marginTop: 6, marginBottom: 18 },
  identityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.navy, borderRadius: 18, padding: 14, marginBottom: 11 },
  avatar: { width: 45, height: 45, borderRadius: 16, backgroundColor: '#7587DD', alignItems: 'center', justifyContent: 'center' },
  identityCopy: { flex: 1, marginLeft: 11 },
  identityName: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  identityEmail: { color: '#C2CAE0', fontSize: 9, marginTop: 4 },
  deviceBadge: { width: 27, height: 27, borderRadius: 10, backgroundColor: '#E0F7EE', alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', marginBottom: 21 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 13, marginRight: 8 },
  statValue: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  statLabel: { color: colors.muted, fontSize: 8, fontWeight: '800', letterSpacing: 0.55, marginTop: 4 },
  sectionTitle: { color: colors.ink, fontWeight: '800', fontSize: 15, marginBottom: 10 },
  formCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border, borderRadius: 17, padding: 13, marginBottom: 22 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', minHeight: 40 },
  input: { flex: 1, color: colors.ink, fontSize: 12, paddingHorizontal: 9, paddingVertical: 8 },
  fieldDivider: { height: 1, backgroundColor: colors.border, marginVertical: 5 },
  saveButton: { height: 42, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 9 },
  saveButtonPressed: { backgroundColor: colors.primaryDark },
  saveButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 11, marginLeft: 5 },
  privacyNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  privacyCopy: { color: colors.muted, fontSize: 8, marginLeft: 5 },
  settingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border, borderRadius: 15, padding: 11 },
  settingPressed: { opacity: 0.8 },
  settingIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingCopy: { flex: 1, marginLeft: 9 },
  settingTitle: { color: colors.ink, fontWeight: '800', fontSize: 11 },
  settingCaption: { color: colors.muted, fontSize: 9, marginTop: 3 },
  platformNote: { flexDirection: 'row', alignItems: 'center', marginTop: 20, paddingHorizontal: 3 },
  platformCopy: { marginLeft: 9 },
  platformTitle: { color: colors.ink, fontSize: 10, fontWeight: '700' },
  platformCaption: { color: colors.muted, fontSize: 8, marginTop: 3 },
  bottomSpace: { height: 9 },
});
