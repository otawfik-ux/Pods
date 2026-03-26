import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getActivity, approveJoinRequest, rejectJoinRequest } from '../../services/activities';
import { getUserProfile } from '../../services/auth';
import { User, Activity } from '../../types';
import AvatarInitials from '../../components/AvatarInitials';

type AnyStackWithJoinRequests = { JoinRequests: { activityId: string; activityTitle: string }; [key: string]: object | undefined };
type Props = {
  navigation: NativeStackNavigationProp<AnyStackWithJoinRequests, 'JoinRequests'>;
  route: RouteProp<AnyStackWithJoinRequests, 'JoinRequests'>;
};

export default function JoinRequestsScreen({ navigation, route }: Props) {
  const { activityId, activityTitle } = route.params;
  const { colors } = useTheme();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [requesters, setRequesters] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const load = async () => {
    const act = await getActivity(activityId);
    setActivity(act);
    if (act) {
      const users = await Promise.all(act.pendingRequests.map((uid) => getUserProfile(uid)));
      setRequesters(users.filter(Boolean) as User[]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [activityId]);

  const handleApprove = async (userId: string) => {
    setProcessingId(userId);
    try { await approveJoinRequest(activityId, userId); await load(); }
    catch (err: any) { Alert.alert('Error', err.message); }
    finally { setProcessingId(null); }
  };

  const handleReject = async (userId: string) => {
    setProcessingId(userId);
    try { await rejectJoinRequest(activityId, userId); await load(); }
    finally { setProcessingId(null); }
  };

  const s = makeStyles(colors);
  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={s.headerInfo}>
          <Text style={s.title}>Join Requests</Text>
          <Text style={s.subtitle} numberOfLines={1}>{activityTitle}</Text>
        </View>
      </View>

      {activity && (
        <View style={s.capacityBanner}>
          <Text style={s.capacityText}>{activity.currentParticipants}/{activity.maxParticipants} spots filled</Text>
        </View>
      )}

      <FlatList data={requesters} keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <View style={s.requestRow}>
            <AvatarInitials name={item.displayName} size={46} />
            <View style={s.requesterInfo}>
              <Text style={s.requesterName}>{item.displayName}</Text>
              <Text style={s.requesterUniversity}>{item.university}</Text>
            </View>
            {processingId === item.uid ? <ActivityIndicator color={colors.primary} /> : (
              <View style={s.actions}>
                <TouchableOpacity style={s.rejectBtn} onPress={() => handleReject(item.uid)}>
                  <Ionicons name="close" size={20} color={colors.danger} />
                </TouchableOpacity>
                <TouchableOpacity style={[s.approveBtn, { backgroundColor: colors.success }]} onPress={() => handleApprove(item.uid)}>
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>✅</Text>
            <Text style={s.emptyTitle}>No pending requests</Text>
            <Text style={s.emptyText}>All caught up!</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={s.separator} />}
      />
    </SafeAreaView>
  );
}

const makeStyles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 14 },
  headerInfo: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', color: c.text },
  subtitle: { fontSize: 13, color: c.subtext, marginTop: 2 },
  capacityBanner: { backgroundColor: c.primaryGlow, paddingHorizontal: 20, paddingVertical: 10, marginBottom: 4 },
  capacityText: { fontSize: 13, color: c.primary, fontWeight: '600' },
  requestRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, paddingHorizontal: 20, paddingVertical: 16 },
  requesterInfo: { flex: 1, marginLeft: 14 },
  requesterName: { fontSize: 16, fontWeight: '700', color: c.text },
  requesterUniversity: { fontSize: 13, color: c.subtext, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10 },
  rejectBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.primaryGlow, alignItems: 'center', justifyContent: 'center' },
  approveBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  separator: { height: 1, backgroundColor: c.border },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 6 },
  emptyText: { fontSize: 14, color: c.subtext },
});
