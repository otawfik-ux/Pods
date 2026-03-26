import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CategoryColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';
import { Activity } from '../types';
import AvatarInitials from './AvatarInitials';
import CategoryChip from './CategoryChip';

interface Props {
  activity: Activity;
  currentUserId: string;
  onPress: () => void;
  onRequestJoin: () => void;
}

function getCountdown(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function ActivityCard({ activity, currentUserId, onPress, onRequestJoin }: Props) {
  const { colors } = useTheme();
  const [countdown, setCountdown] = useState(getCountdown(activity.expiresAt));

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getCountdown(activity.expiresAt)), 30000);
    return () => clearInterval(timer);
  }, [activity.expiresAt]);

  const isParticipant = activity.participants.includes(currentUserId);
  const isPending = activity.pendingRequests.includes(currentUserId);
  const isFull = activity.currentParticipants >= activity.maxParticipants;
  const isHost = activity.hostId === currentUserId;
  const isExpired = activity.status === 'expired' || countdown === 'Expired';
  const accentColor = CategoryColors[activity.category] ?? colors.primary;

  const renderButton = () => {
    if (isHost) return null;
    if (isExpired) return <Text style={[styles.statusLabel, { color: colors.subtext }]}>Expired</Text>;
    if (isParticipant) return <Text style={[styles.statusLabel, { color: colors.success }]}>Joined ✓</Text>;
    if (isPending) return <Text style={[styles.statusLabel, { color: colors.warning }]}>Pending…</Text>;
    if (isFull) return <Text style={[styles.statusLabel, { color: colors.subtext }]}>Full</Text>;
    return (
      <TouchableOpacity style={[styles.joinBtn, { backgroundColor: colors.primary }]} onPress={onRequestJoin}>
        <Text style={styles.joinBtnText}>Request to Join</Text>
      </TouchableOpacity>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <AvatarInitials name={activity.hostName} size={36} backgroundColor={accentColor} />
          <View style={styles.hostInfo}>
            <Text style={[styles.hostName, { color: colors.text }]}>{activity.hostName}</Text>
            <Text style={[styles.hostLabel, { color: colors.subtext }]}>Host</Text>
          </View>
          <CategoryChip label={activity.category} selected small />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{activity.title}</Text>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: colors.subtext }]}>Starts</Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: colors.subtext }]}>Expires in</Text>
            <Text style={[styles.metaValue, { color: isExpired ? colors.danger : colors.text }]}>{countdown}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: colors.subtext }]}>Spots</Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>
              {activity.currentParticipants}/{activity.maxParticipants}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>{renderButton()}</View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    flexDirection: 'row',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  accentBar: { width: 5 },
  content: { flex: 1, padding: 14 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  hostInfo: { flex: 1, marginLeft: 10 },
  hostName: { fontWeight: '600', fontSize: 14 },
  hostLabel: { fontSize: 11 },
  title: { fontSize: 17, fontWeight: '700', marginBottom: 10 },
  meta: { flexDirection: 'row', marginBottom: 12 },
  metaItem: { marginRight: 20 },
  metaLabel: { fontSize: 11, marginBottom: 2 },
  metaValue: { fontSize: 13, fontWeight: '600' },
  footer: { alignItems: 'flex-start' },
  joinBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  joinBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  statusLabel: { fontWeight: '600', fontSize: 13 },
});
