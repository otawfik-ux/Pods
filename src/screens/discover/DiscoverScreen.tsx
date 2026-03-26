import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator,
  RefreshControl, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { DiscoverStackParamList, Activity, Pod } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getActivitiesForPods } from '../../services/activities';
import { getPublicPods, joinPod } from '../../services/pods';
import { getUserProfile } from '../../services/auth';
import ActivityCard from '../../components/ActivityCard';
import { requestJoinActivity } from '../../services/activities';

type Props = { navigation: NativeStackNavigationProp<DiscoverStackParamList, 'DiscoverFeed'> };

export default function DiscoverScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { userProfile, refreshProfile } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [discoverPods, setDiscoverPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joiningPodId, setJoiningPodId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userProfile) return;
    try {
      // Always fetch fresh podsJoined from Firestore so we don't rely on stale cache
      const freshProfile = await getUserProfile(userProfile.uid);
      const joinedPodIds = freshProfile?.podsJoined ?? userProfile.podsJoined;

      // Fetch activities and public pods independently — failure in one won't block the other
      const activityData = await getActivitiesForPods(joinedPodIds).catch(() => [] as Activity[]);
      setActivities(activityData);

      const podData = await getPublicPods().catch(() => [] as Pod[]);
      const notJoined = podData
        .filter((p) => !joinedPodIds.includes(p.podId))
        .slice(0, 10);
      setDiscoverPods(notJoined);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userProfile]);

  useEffect(() => { load(); }, [load]);

  const handleRequestJoin = async (activityId: string) => {
    if (!userProfile) return;
    try { await requestJoinActivity(activityId, userProfile.uid); await load(); } catch { }
  };

  const handleJoinPod = async (podId: string) => {
    if (!userProfile) return;
    setJoiningPodId(podId);
    try {
      await joinPod(podId, userProfile.uid);
      await refreshProfile();
      await load();
    } catch { }
    finally { setJoiningPodId(null); }
  };

  const s = makeStyles(colors);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  const ListHeader = () => (
    <>
      {discoverPods.length > 0 && (
        <View style={s.shelfSection}>
          <View style={s.shelfHeader}>
            <Text style={s.shelfTitle}>Discover Pods</Text>
            <TouchableOpacity onPress={() => navigation.navigate('PodDiscovery')} style={s.seeAllBtn}>
              <Text style={s.seeAllText}>See All</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.shelfScroll}
          >
            {discoverPods.map((pod) => (
              <View key={pod.podId} style={s.podCard}>
                <View style={[s.podCardBanner, { backgroundColor: pod.bannerColor }]}>
                  <Text style={s.podCardLetter}>{pod.name[0]}</Text>
                </View>
                <View style={s.podCardBody}>
                  <Text style={s.podCardName} numberOfLines={1}>{pod.name}</Text>
                  <View style={s.podCardMeta}>
                    <Text style={s.podCardCategory}>{pod.category}</Text>
                    <Text style={s.podCardDot}>·</Text>
                    <Text style={s.podCardMembers}>{pod.memberCount} members</Text>
                  </View>
                  <TouchableOpacity
                    style={[s.podJoinBtn, joiningPodId === pod.podId && s.podJoinBtnDisabled]}
                    onPress={() => handleJoinPod(pod.podId)}
                    disabled={joiningPodId === pod.podId}
                  >
                    {joiningPodId === pod.podId
                      ? <ActivityIndicator size="small" color="#FFFFFF" />
                      : <Text style={s.podJoinBtnText}>Join</Text>
                    }
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={s.feedHeader}>
        <Text style={s.feedTitle}>Activity Feed</Text>
        <Text style={s.feedSubtitle}>From your pods</Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Discover</Text>
      </View>

      <FlatList
        data={activities}
        keyExtractor={(item) => item.activityId}
        renderItem={({ item }) => (
          <ActivityCard activity={item} currentUserId={userProfile?.uid ?? ''}
            onPress={() => navigation.navigate('ActivityDetail', { activityId: item.activityId })}
            onRequestJoin={() => handleRequestJoin(item.activityId)} />
        )}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🏘️</Text>
            <Text style={s.emptyTitle}>No activities yet</Text>
            <Text style={s.emptyText}>Join some pods to see activities here, or create one from a pod!</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const makeStyles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', color: c.text },
  // Pods shelf
  shelfSection: { paddingTop: 16, paddingBottom: 8 },
  shelfHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 },
  shelfTitle: { fontSize: 18, fontWeight: '700', color: c.text },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { fontSize: 14, color: c.primary, fontWeight: '600' },
  shelfScroll: { paddingHorizontal: 16, gap: 12 },
  podCard: { width: 150, backgroundColor: c.card, borderRadius: 16, overflow: 'hidden', shadowColor: c.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
  podCardBanner: { height: 60, alignItems: 'center', justifyContent: 'center' },
  podCardLetter: { fontSize: 28, fontWeight: '900', color: 'rgba(255,255,255,0.6)' },
  podCardBody: { padding: 10 },
  podCardName: { fontSize: 14, fontWeight: '700', color: c.text, marginBottom: 4 },
  podCardMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 },
  podCardCategory: { fontSize: 11, color: c.primary, fontWeight: '600' },
  podCardDot: { fontSize: 11, color: c.subtext, marginHorizontal: 4 },
  podCardMembers: { fontSize: 11, color: c.subtext },
  podJoinBtn: { backgroundColor: c.primary, borderRadius: 10, paddingVertical: 7, alignItems: 'center' },
  podJoinBtnDisabled: { opacity: 0.5 },
  podJoinBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  // Activity feed header
  feedHeader: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  feedTitle: { fontSize: 18, fontWeight: '700', color: c.text },
  feedSubtitle: { fontSize: 13, color: c.subtext, marginTop: 2 },
  // Empty
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: c.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: c.subtext, textAlign: 'center', lineHeight: 20 },
});
