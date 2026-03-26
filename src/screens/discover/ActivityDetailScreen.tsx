import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Activity } from '../../types';
import { CategoryColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getActivity, requestJoinActivity, leaveActivity } from '../../services/activities';
import CategoryChip from '../../components/CategoryChip';
import AvatarInitials from '../../components/AvatarInitials';

type AnyStackWithActivityDetail = {
  ActivityDetail: { activityId: string };
  JoinRequests: { activityId: string; activityTitle: string };
  [key: string]: object | undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<AnyStackWithActivityDetail, 'ActivityDetail'>;
  route: RouteProp<AnyStackWithActivityDetail, 'ActivityDetail'>;
};

export default function ActivityDetailScreen({ navigation, route }: Props) {
  const { activityId } = route.params;
  const { colors } = useTheme();
  const { userProfile } = useAuth();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const load = async () => { const d = await getActivity(activityId); setActivity(d); setLoading(false); };
  useEffect(() => { load(); }, [activityId]);

  const s = makeStyles(colors);
  if (loading || !activity) return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  const uid = userProfile?.uid ?? '';
  const isHost = activity.hostId === uid;
  const isParticipant = activity.participants.includes(uid);
  const isPending = activity.pendingRequests.includes(uid);
  const isFull = activity.currentParticipants >= activity.maxParticipants;
  const isExpired = activity.status === 'expired' || new Date(activity.expiresAt) < new Date();
  const accentColor = CategoryColors[activity.category] ?? colors.primary;

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (isParticipant && !isHost) await leaveActivity(activityId, uid);
      else if (!isParticipant && !isPending) await requestJoinActivity(activityId, uid);
      await load();
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setActionLoading(false); }
  };

  const renderActionButton = () => {
    if (isHost) return (
      <TouchableOpacity style={[s.actionBtn, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('JoinRequests', { activityId, activityTitle: activity.title })}>
        <Text style={s.actionBtnText}>Manage Requests ({activity.pendingRequests.length})</Text>
      </TouchableOpacity>
    );
    if (isExpired) return <Text style={[s.statusText, { color: colors.subtext }]}>This activity has expired</Text>;
    if (isParticipant) return (
      <TouchableOpacity style={[s.actionBtn, { backgroundColor: colors.danger }]} onPress={handleAction}>
        {actionLoading ? <ActivityIndicator color="#FFF" /> : <Text style={s.actionBtnText}>Leave Activity</Text>}
      </TouchableOpacity>
    );
    if (isPending) return <Text style={[s.statusText, { color: colors.warning }]}>Request Pending…</Text>;
    if (isFull) return <Text style={[s.statusText, { color: colors.subtext }]}>Activity is Full</Text>;
    return (
      <TouchableOpacity style={[s.actionBtn, { backgroundColor: colors.primary }]} onPress={handleAction}>
        {actionLoading ? <ActivityIndicator color="#FFF" /> : <Text style={s.actionBtnText}>Request to Join</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={[s.hero, { backgroundColor: accentColor }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={s.heroContent}>
          <CategoryChip label={activity.category} selected small />
          <Text style={s.heroTitle}>{activity.title}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.hostRow}>
          <AvatarInitials name={activity.hostName} size={44} backgroundColor={accentColor} />
          <View style={s.hostInfo}>
            <Text style={s.hostName}>{activity.hostName}</Text>
            <Text style={s.hostLabel}>Activity Host</Text>
          </View>
        </View>

        <View style={s.infoGrid}>
          {[
            { label: 'Start Time', value: new Date(activity.startTime).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
            { label: 'Expires', value: new Date(activity.expiresAt).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
            { label: 'Spots', value: `${activity.currentParticipants} / ${activity.maxParticipants}` },
            { label: 'Visibility', value: activity.visibility === 'pod' ? 'Pod Members Only' : 'University-Wide' },
          ].map((item) => (
            <View key={item.label} style={s.infoItem}>
              <Text style={s.infoLabel}>{item.label}</Text>
              <Text style={s.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {activity.tags.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Tags</Text>
            <View style={s.tagsRow}>
              {activity.tags.map((tag) => (
                <View key={tag} style={s.tag}><Text style={s.tagText}>{tag}</Text></View>
              ))}
            </View>
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionTitle}>Participants ({activity.currentParticipants})</Text>
          {activity.participants.map((pid) => (
            <View key={pid} style={s.participantRow}>
              <AvatarInitials name={pid === uid ? userProfile?.displayName ?? 'You' : 'Member'} size={32} />
              <Text style={s.participantName}>{pid === uid ? `${userProfile?.displayName} (You)` : 'Member'}</Text>
              {pid === activity.hostId && <View style={s.hostBadge}><Text style={s.hostBadgeText}>Host</Text></View>}
            </View>
          ))}
        </View>

        <View style={s.actionContainer}>{renderActionButton()}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background },
  hero: { paddingBottom: 24, paddingTop: 8 },
  backBtn: { padding: 16 },
  heroContent: { paddingHorizontal: 20, gap: 10 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginTop: 8, lineHeight: 32 },
  scroll: { padding: 20, paddingBottom: 40 },
  hostRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  hostInfo: { marginLeft: 12 },
  hostName: { fontSize: 16, fontWeight: '700', color: c.text },
  hostLabel: { fontSize: 13, color: c.subtext },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
  infoItem: { width: '50%', paddingVertical: 12, paddingRight: 16 },
  infoLabel: { fontSize: 11, color: c.subtext, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 14, fontWeight: '600', color: c.text },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 12 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: { backgroundColor: c.primaryGlow, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8 },
  tagText: { color: c.primary, fontSize: 13, fontWeight: '500' },
  participantRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  participantName: { fontSize: 14, color: c.text, marginLeft: 12, flex: 1 },
  hostBadge: { backgroundColor: c.primary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  hostBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  actionContainer: { paddingTop: 8, alignItems: 'center' },
  actionBtn: { borderRadius: 14, paddingVertical: 15, paddingHorizontal: 40, alignItems: 'center', width: '100%' },
  actionBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  statusText: { fontSize: 15, fontWeight: '600' },
});
