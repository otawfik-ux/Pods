import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Pod, PodCategory } from '../../types';
import { POD_CATEGORIES } from '../../constants/categories';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getPublicPods, joinPod } from '../../services/pods';
import PodCard from '../../components/PodCard';
import CategoryChip from '../../components/CategoryChip';

type AnyStackWithPodDiscovery = { PodDiscovery: undefined; PodDetail: { podId: string }; [key: string]: object | undefined };
type Props = { navigation: NativeStackNavigationProp<AnyStackWithPodDiscovery, 'PodDiscovery'> };

export default function PodDiscoveryScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { userProfile, refreshProfile } = useAuth();
  const [pods, setPods] = useState<Pod[]>([]);
  const [filtered, setFiltered] = useState<Pod[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<PodCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => { getPublicPods().then((d) => { setPods(d); setLoading(false); }); }, []);
  useEffect(() => {
    let r = pods;
    if (selectedCat) r = r.filter((p) => p.category === selectedCat);
    if (search.trim()) { const t = search.toLowerCase(); r = r.filter((p) => p.name.toLowerCase().includes(t) || p.description.toLowerCase().includes(t)); }
    setFiltered(r);
  }, [pods, search, selectedCat]);

  const handleJoin = async (pod: Pod) => {
    if (!userProfile) return;
    setJoiningId(pod.podId);
    try { await joinPod(pod.podId, userProfile.uid); await refreshProfile(); navigation.navigate('PodDetail', { podId: pod.podId }); }
    catch (err: any) { Alert.alert('Error', err.message); }
    finally { setJoiningId(null); }
  };

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={s.title}>Discover Pods</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={s.searchContainer}>
        <Ionicons name="search" size={18} color={colors.subtext} style={s.searchIcon} />
        <TextInput style={s.searchInput} placeholder="Search pods..." placeholderTextColor={colors.subtext}
          value={search} onChangeText={setSearch} autoCapitalize="none" />
      </View>

      <View style={s.filterRow}>
        <TouchableOpacity style={[s.allChip, !selectedCat && s.allChipSelected]} onPress={() => setSelectedCat(null)}>
          <Text style={[s.allChipText, !selectedCat && s.allChipTextSelected]}>All</Text>
        </TouchableOpacity>
        {POD_CATEGORIES.map((cat) => (
          <CategoryChip key={cat} label={cat} selected={selectedCat === cat}
            onPress={() => setSelectedCat(selectedCat === cat ? null : cat)} small />
        ))}
      </View>

      {loading ? <View style={s.center}><ActivityIndicator size="large" color={colors.primary} /></View> : (
        <FlatList data={filtered} keyExtractor={(item) => item.podId}
          renderItem={({ item }) => {
            const isMember = userProfile?.podsJoined.includes(item.podId) ?? false;
            return (
              <PodCard pod={item} isMember={isMember}
                onPress={() => navigation.navigate('PodDetail', { podId: item.podId })}
                onJoin={!isMember ? () => handleJoin(item) : undefined} />
            );
          }}
          ListEmptyComponent={<View style={s.empty}><Text style={s.emptyText}>No pods found</Text></View>}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 },
  title: { fontSize: 20, fontWeight: '700', color: c.text },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.inputBackground, borderRadius: 12, marginHorizontal: 16, marginBottom: 12, paddingHorizontal: 14, borderWidth: 1.5, borderColor: c.border },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, color: c.text },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, flexWrap: 'nowrap' },
  allChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: c.primaryGlow, marginRight: 8 },
  allChipSelected: { backgroundColor: c.primary },
  allChipText: { fontWeight: '600', fontSize: 13, color: c.primary },
  allChipTextSelected: { color: '#FFFFFF' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: c.subtext, fontSize: 15 },
});
