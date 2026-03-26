import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MessagesStackParamList, Activity } from '../../types';
import { CategoryColors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getActivitiesForPods } from '../../services/activities';

type Props = { navigation: NativeStackNavigationProp<MessagesStackParamList, 'MessagesList'> };

function getCountdown(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `${Math.floor(h / 24)}d`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function MessagesScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { userProfile } = useAuth();
  const [chats, setChats] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!userProfile) return;
    try { const all = await getActivitiesForPods(userProfile.podsJoined); setChats(all.filter((a) => a.participants.includes(userProfile.uid))); }
    finally { setLoading(false); setRefreshing(false); }
  }, [userProfile]);

  useEffect(() => { load(); }, [load]);

  const s = makeStyles(colors);
  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  const activeChats = chats.filter((c) => c.status === 'active' && new Date(c.expiresAt) > new Date());
  const expiredChats = chats.filter((c) => c.status === 'expired' || new Date(c.expiresAt) <= new Date());
  const allChats = [...activeChats.map((c) => ({ item: c, isExpired: false })), ...expiredChats.map((c) => ({ item: c, isExpired: true }))];

  const renderChat = ({ item: c, isExpired }: { item: Activity; isExpired: boolean }) => {
    const accentColor = CategoryColors[c.category] ?? colors.primary;
    const countdown = getCountdown(c.expiresAt);
    return (
      <TouchableOpacity style={s.chatRow}
        onPress={() => navigation.navigate('Chat', { activityId: c.activityId, activityTitle: c.title, expiresAt: c.expiresAt })}
        activeOpacity={0.8}
      >
        <View style={[s.chatIcon, { backgroundColor: isExpired ? colors.border : accentColor }]}>
          <Ionicons name="chatbubbles" size={22} color="#FFFFFF" />
        </View>
        <View style={s.chatInfo}>
          <Text style={[s.chatTitle, { color: isExpired ? colors.subtext : colors.text }]} numberOfLines={1}>{c.title}</Text>
          <Text style={[s.chatMeta, { color: colors.subtext }]}>{c.currentParticipants} members · {c.category}</Text>
        </View>
        <View style={s.chatRight}>
          {isExpired ? (
            <View style={s.lockedBadge}>
              <Ionicons name="lock-closed" size={12} color={colors.subtext} />
              <Text style={[s.lockedText, { color: colors.subtext }]}>Locked</Text>
            </View>
          ) : (
            <Text style={[s.countdown, { color: countdown === 'Expired' ? colors.danger : colors.warning }]}>{countdown}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Messages</Text>
        <Text style={s.subtitle}>Your activity group chats</Text>
      </View>
      <FlatList
        data={allChats}
        keyExtractor={(i) => i.item.activityId}
        renderItem={({ item }) => renderChat(item)}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>💬</Text>
            <Text style={s.emptyTitle}>No chats yet</Text>
            <Text style={s.emptyText}>Join an activity to get access to its group chat</Text>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
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
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: c.text },
  subtitle: { fontSize: 14, color: c.subtext, marginTop: 2 },
  chatRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, paddingHorizontal: 16, paddingVertical: 14 },
  chatIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  chatInfo: { flex: 1 },
  chatTitle: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  chatMeta: { fontSize: 13 },
  chatRight: { alignItems: 'flex-end' },
  countdown: { fontSize: 13, fontWeight: '600' },
  lockedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  lockedText: { fontSize: 12 },
  separator: { height: 1, backgroundColor: c.border, marginLeft: 78 },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: c.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: c.subtext, textAlign: 'center', lineHeight: 20 },
});
