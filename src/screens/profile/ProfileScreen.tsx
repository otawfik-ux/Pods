import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { logoutUser, updateUserProfile } from '../../services/auth';
import AvatarInitials from '../../components/AvatarInitials';

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { userProfile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(userProfile?.bio ?? '');
  const [displayName, setDisplayName] = useState(userProfile?.displayName ?? '');
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (!userProfile) return null;

  const handleSave = async () => {
    setSaving(true);
    try { await updateUserProfile(userProfile.uid, { bio, displayName }); await refreshProfile(); setEditing(false); }
    catch (err: any) { Alert.alert('Error', err.message); }
    finally { setSaving(false); }
  };

  const confirmLogout = () => {
    if (Platform.OS === 'web') {
      const shouldLogout = typeof window === 'undefined' || typeof window.confirm !== 'function'
        ? true
        : window.confirm('Are you sure you want to log out?');

      if (shouldLogout) {
        void handleLogout();
      }
      return;
    }

    Alert.alert('Log Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: handleLogout,
      },
    ]);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
    } catch (err: any) {
      Alert.alert('Error', err.message);
      setLoggingOut(false);
    }
  };
  const joinDate = new Date(userProfile.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Profile</Text>
        <View style={s.headerActions}>
          <TouchableOpacity onPress={toggleTheme} style={s.iconBtn}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmLogout} style={s.logoutBtn} disabled={loggingOut}>
            {loggingOut ? (
              <ActivityIndicator size="small" color={colors.danger} />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={20} color={colors.danger} />
                <Text style={s.logoutText}>Log Out</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.profileCard}>
          <AvatarInitials name={userProfile.displayName} size={80} />
          <View style={s.profileInfo}>
            {editing ? (
              <TextInput style={s.nameInput} value={displayName} onChangeText={setDisplayName} placeholder="Display name" placeholderTextColor={colors.subtext} />
            ) : (
              <Text style={s.name}>{userProfile.displayName}</Text>
            )}
            <View style={s.universityBadge}>
              <Text style={s.universityBadgeText}>🎓 {userProfile.university}</Text>
            </View>
            <Text style={s.joinDate}>Member since {joinDate}</Text>
          </View>
        </View>

        <View style={s.statsRow}>
          {[
            { label: 'Pods', value: userProfile.podsJoined.length },
            { label: 'Commendations', value: userProfile.commendations },
            { label: 'Posts', value: userProfile.postsCount },
          ].map((stat) => (
            <View key={stat.label} style={s.stat}>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Bio</Text>
          {editing ? (
            <TextInput style={s.bioInput} value={bio} onChangeText={setBio}
              placeholder="Tell your campus who you are..." placeholderTextColor={colors.subtext}
              multiline numberOfLines={3} maxLength={200} />
          ) : (
            <Text style={s.bioText}>{userProfile.bio || 'No bio yet. Tap edit to add one!'}</Text>
          )}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Account</Text>
          {[
            { label: 'Email', value: userProfile.email },
            { label: 'University', value: userProfile.university },
          ].map((item) => (
            <View key={item.label} style={s.infoRow}>
              <Text style={s.infoLabel}>{item.label}</Text>
              <Text style={s.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {editing ? (
          <View style={s.editActions}>
            <TouchableOpacity style={s.cancelBtn} onPress={() => setEditing(false)}>
              <Text style={s.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.saveBtnText}>Save</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={s.editBtn} onPress={() => setEditing(true)}>
            <Ionicons name="pencil" size={16} color={colors.primary} />
            <Text style={s.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: c.text },
  headerActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 6 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 6 },
  logoutText: { fontSize: 14, fontWeight: '700', color: c.danger },
  scroll: { padding: 20, paddingBottom: 40 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: c.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  profileInfo: { marginLeft: 16, flex: 1 },
  name: { fontSize: 22, fontWeight: '800', color: c.text, marginBottom: 6 },
  nameInput: { fontSize: 20, fontWeight: '700', color: c.text, borderBottomWidth: 2, borderBottomColor: c.primary, paddingBottom: 4, marginBottom: 6 },
  universityBadge: { backgroundColor: c.primaryGlow, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 6 },
  universityBadgeText: { fontSize: 12, color: c.primary, fontWeight: '600' },
  joinDate: { fontSize: 12, color: c.subtext },
  statsRow: { flexDirection: 'row', backgroundColor: c.card, borderRadius: 16, padding: 16, marginBottom: 20, shadowColor: c.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8, elevation: 2 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', color: c.primary },
  statLabel: { fontSize: 12, color: c.subtext, marginTop: 4 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 12 },
  bioText: { fontSize: 15, color: c.text, lineHeight: 22 },
  bioInput: { backgroundColor: c.inputBackground, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: c.text, borderWidth: 1.5, borderColor: c.primary, height: 90, textAlignVertical: 'top' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.border },
  infoLabel: { fontSize: 14, color: c.subtext },
  infoValue: { fontSize: 14, fontWeight: '500', color: c.text, flex: 1, textAlign: 'right' },
  editActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderColor: c.border, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: c.subtext },
  saveBtn: { flex: 1, backgroundColor: c.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  editBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: c.primary, borderRadius: 12, paddingVertical: 14, gap: 8, marginTop: 8 },
  editBtnText: { fontSize: 15, fontWeight: '600', color: c.primary },
});
