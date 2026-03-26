import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { PodsStackParamList, Pod } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getUserPods } from '../../services/pods';
import PodCard from '../../components/PodCard';

type Props = { navigation: NativeStackNavigationProp<PodsStackParamList, 'MyPods'> };

export default function MyPodsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { userProfile } = useAuth();
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!userProfile) return;
    try { const data = await getUserPods(userProfile.podsJoined); setPods(data); }
    finally { setLoading(false); setRefreshing(false); }
  }, [userProfile]);

  useEffect(() => { load(); }, [load]);

  const s = makeStyles(colors);
  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>My Pods</Text>
        <View style={s.headerActions}>
          <TouchableOpacity style={s.headerBtn} onPress={() => navigation.navigate('PodDiscovery')}>
            <Ionicons name="search" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={s.headerBtn} onPress={() => navigation.navigate('CreatePod')}>
            <Ionicons name="add" size={26} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList data={pods} keyExtractor={(item) => item.podId}
        renderItem={({ item }) => (
          <PodCard pod={item} isMember onPress={() => navigation.navigate('PodDetail', { podId: item.podId })} />
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🏘️</Text>
            <Text style={s.emptyTitle}>No pods yet</Text>
            <Text style={s.emptyText}>Discover and join pods to connect with your campus community</Text>
            <TouchableOpacity style={s.discoverBtn} onPress={() => navigation.navigate('PodDiscovery')}>
              <Text style={s.discoverBtnText}>Discover Pods</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const makeStyles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: c.text },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: { padding: 6 },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: c.text, marginBottom: 8 },
  emptyText: { fontSize: 14, color: c.subtext, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  discoverBtn: { backgroundColor: c.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32 },
  discoverBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
