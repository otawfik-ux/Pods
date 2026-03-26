import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  FlatList, Alert, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { PodsStackParamList, Pod, Activity, Message } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getPod, joinPod, leavePod } from '../../services/pods';
import { getActivitiesForPod, requestJoinActivity } from '../../services/activities';
import { sendPodMessage, subscribeToPodMessages } from '../../services/chat';
import ActivityCard from '../../components/ActivityCard';
import AvatarInitials from '../../components/AvatarInitials';
import MessageBubble from '../../components/MessageBubble';

type Props = {
  navigation: NativeStackNavigationProp<PodsStackParamList, 'PodDetail'>;
  route: RouteProp<PodsStackParamList, 'PodDetail'>;
};

type Tab = 'Chat' | 'Activities' | 'Members' | 'Info';
const TABS: Tab[] = ['Chat', 'Activities', 'Members', 'Info'];

export default function PodDetailScreen({ navigation, route }: Props) {
  const { podId } = route.params;
  const { colors } = useTheme();
  const { userProfile, refreshProfile } = useAuth();

  const [pod, setPod] = useState<Pod | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tab, setTab] = useState<Tab>('Chat');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatText, setChatText] = useState('');
  const [sending, setSending] = useState(false);
  const chatListRef = useRef<FlatList>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [podData, activityData] = await Promise.all([
        getPod(podId),
        getActivitiesForPod(podId),
      ]);
      setPod(podData);
      setActivities(activityData);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load pod');
    } finally {
      setLoading(false);
    }
  }, [podId]);

  useEffect(() => { load(); }, [load]);

  // Subscribe to pod chat
  useEffect(() => {
    const unsub = subscribeToPodMessages(podId, (msgs) => {
      setMessages(msgs);
      setTimeout(() => chatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return unsub;
  }, [podId]);

  const s = makeStyles(colors);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  if (error || !pod) {
    return (
      <View style={s.center}>
        <Text style={s.errorText}>{error ?? 'Pod not found'}</Text>
        <TouchableOpacity onPress={load} style={s.retryBtn}>
          <Text style={s.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const uid = userProfile?.uid ?? '';
  const isMember = pod.members.includes(uid);
  const isAdmin = pod.admins.includes(uid);

  const handleJoin = async () => {
    try { await joinPod(podId, uid); await refreshProfile(); await load(); }
    catch (err: any) { Alert.alert('Error', err.message); }
  };

  const handleLeave = () => Alert.alert('Leave Pod', `Leave ${pod.name}?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Leave', style: 'destructive', onPress: async () => {
      try { await leavePod(podId, uid); await refreshProfile(); navigation.goBack(); }
      catch (err: any) { Alert.alert('Error', err.message); }
    }},
  ]);

  const handleRequestJoin = async (activityId: string) => {
    try { await requestJoinActivity(activityId, uid); await load(); }
    catch (err: any) { Alert.alert('Error', err.message); }
  };

  const handleSendMessage = async () => {
    if (!chatText.trim() || !userProfile) return;
    setSending(true);
    try { await sendPodMessage(podId, uid, userProfile.displayName, chatText.trim()); setChatText(''); }
    finally { setSending(false); }
  };

  const renderContent = () => {
    if (tab === 'Chat') {
      return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={180}>
          <FlatList
            ref={chatListRef}
            data={messages}
            keyExtractor={(m) => m.messageId}
            renderItem={({ item }) => <MessageBubble message={item} isOwn={item.senderId === uid} />}
            contentContainerStyle={s.chatList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => chatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={s.chatEmpty}>
                <Text style={s.chatEmptyIcon}>💬</Text>
                <Text style={s.chatEmptyText}>No messages yet. Say hi to your pod!</Text>
              </View>
            }
          />
          {isMember ? (
            <View style={s.inputBar}>
              <TextInput
                style={s.textInput}
                placeholder="Message the pod..."
                placeholderTextColor={colors.subtext}
                value={chatText}
                onChangeText={setChatText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[s.sendBtn, (!chatText.trim() || sending) && s.sendBtnDisabled]}
                onPress={handleSendMessage}
                disabled={!chatText.trim() || sending}
              >
                {sending ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Ionicons name="send" size={18} color="#FFFFFF" />}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.joinToChat}>
              <Text style={s.joinToChatText}>Join this pod to participate in the chat</Text>
            </View>
          )}
        </KeyboardAvoidingView>
      );
    }

    if (tab === 'Activities') {
      return (
        <FlatList
          data={activities}
          keyExtractor={(a) => a.activityId}
          renderItem={({ item }) => (
            <ActivityCard activity={item} currentUserId={uid}
              onPress={() => navigation.navigate('ActivityDetail', { activityId: item.activityId })}
              onRequestJoin={() => handleRequestJoin(item.activityId)} />
          )}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>📅</Text>
              <Text style={s.emptyTitle}>No activities yet</Text>
              <Text style={s.emptyText}>Be the first to create one!</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      );
    }

    if (tab === 'Members') {
      return (
        <FlatList
          data={pod.members}
          keyExtractor={(m) => m}
          renderItem={({ item: memberId }) => (
            <View style={s.memberRow}>
              <AvatarInitials name={memberId === uid ? userProfile?.displayName ?? 'You' : 'Member'} size={40} />
              <View style={s.memberInfo}>
                <Text style={s.memberName}>{memberId === uid ? (userProfile?.displayName ?? 'You') + ' (You)' : 'Member'}</Text>
                {pod.admins.includes(memberId) && <Text style={s.adminBadge}>Admin</Text>}
              </View>
            </View>
          )}
          contentContainerStyle={s.memberList}
          showsVerticalScrollIndicator={false}
        />
      );
    }

    // Info tab
    return (
      <View style={s.infoTab}>
        {[
          { label: 'Category', value: pod.category },
          { label: 'Members', value: `${pod.memberCount}` },
          { label: 'Visibility', value: pod.visibility === 'public' ? 'Public' : 'Private' },
          { label: 'Created', value: new Date(pod.createdAt).toLocaleDateString() },
        ].map((item) => (
          <View key={item.label} style={s.infoRow}>
            <Text style={s.infoLabel}>{item.label}</Text>
            <Text style={s.infoValue}>{item.value}</Text>
          </View>
        ))}
        <Text style={s.infoDescription}>{pod.description}</Text>
        {isMember && !isAdmin && (
          <TouchableOpacity style={s.leaveBtn} onPress={handleLeave}>
            <Text style={s.leaveBtnText}>Leave Pod</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={[s.banner, { backgroundColor: pod.bannerColor }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={s.bannerContent}>
          <Text style={s.bannerLetter}>{pod.name[0]}</Text>
        </View>
      </View>

      <View style={s.podHeader}>
        <View style={s.podInfo}>
          <Text style={s.podName}>{pod.name}</Text>
          <Text style={s.podMeta}>{pod.memberCount} members · {pod.category}</Text>
        </View>
        {!isMember && (
          <TouchableOpacity style={s.joinBtn} onPress={handleJoin}>
            <Text style={s.joinBtnText}>Join</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={s.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flex: 1 }}>
        {renderContent()}
      </View>

      {isMember && tab === 'Activities' && (
        <TouchableOpacity style={s.fab} onPress={() => navigation.navigate('CreateActivity', { podId })}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: c.background },
  errorText: { fontSize: 15, color: c.subtext, textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: c.primary, borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12 },
  retryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  banner: { height: 140, justifyContent: 'space-between' },
  backBtn: { padding: 16 },
  bannerContent: { paddingHorizontal: 20, paddingBottom: 16 },
  bannerLetter: { fontSize: 40, fontWeight: '900', color: 'rgba(255,255,255,0.5)' },
  podHeader: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  podInfo: { flex: 1 },
  podName: { fontSize: 22, fontWeight: '800', color: c.text },
  podMeta: { fontSize: 14, color: c.subtext, marginTop: 3 },
  joinBtn: { backgroundColor: c.primary, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 },
  joinBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: c.border },
  tab: { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2.5, borderBottomColor: c.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: c.subtext },
  tabTextActive: { color: c.primary },
  // Chat
  chatList: { paddingVertical: 12, paddingBottom: 8 },
  chatEmpty: { alignItems: 'center', paddingTop: 60 },
  chatEmptyIcon: { fontSize: 40, marginBottom: 12 },
  chatEmptyText: { fontSize: 14, color: c.subtext, textAlign: 'center' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.card, gap: 10 },
  textInput: { flex: 1, backgroundColor: c.inputBackground, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: c.text, maxHeight: 100, borderWidth: 1.5, borderColor: c.border },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  joinToChat: { padding: 16, alignItems: 'center', borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.card },
  joinToChatText: { color: c.subtext, fontSize: 14 },
  // Activities
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 6 },
  emptyText: { fontSize: 14, color: c.subtext },
  // Members
  memberRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: c.border },
  memberInfo: { marginLeft: 14, flex: 1 },
  memberName: { fontSize: 15, fontWeight: '600', color: c.text },
  adminBadge: { fontSize: 12, color: c.primary, fontWeight: '500', marginTop: 2 },
  memberList: { paddingHorizontal: 4 },
  // Info
  infoTab: { padding: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.border },
  infoLabel: { fontSize: 14, color: c.subtext },
  infoValue: { fontSize: 14, fontWeight: '600', color: c.text },
  infoDescription: { marginTop: 20, fontSize: 15, color: c.text, lineHeight: 22 },
  leaveBtn: { marginTop: 32, borderWidth: 1.5, borderColor: c.danger, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  leaveBtnText: { color: c.danger, fontWeight: '600', fontSize: 15 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', shadowColor: c.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
});
