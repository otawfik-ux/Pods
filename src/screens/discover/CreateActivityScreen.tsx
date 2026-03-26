import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Switch, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ActivityCategory } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { ACTIVITY_CATEGORIES, PREDEFINED_TAGS } from '../../constants/categories';
import { useAuth } from '../../context/AuthContext';
import { createActivity } from '../../services/activities';
import CategoryChip from '../../components/CategoryChip';

type AnyStackWithCreateActivity = { CreateActivity: { podId?: string }; [key: string]: object | undefined };
type Props = {
  navigation: NativeStackNavigationProp<AnyStackWithCreateActivity, 'CreateActivity'>;
  route: RouteProp<AnyStackWithCreateActivity, 'CreateActivity'>;
};

function addHours(h: number) { return new Date(Date.now() + h * 3600000).toISOString(); }

export default function CreateActivityScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { userProfile } = useAuth();
  const podId = route.params?.podId ?? '';
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('Social');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [startHours, setStartHours] = useState(1);
  const [durationHours, setDurationHours] = useState(2);
  const [maxParticipants, setMaxParticipants] = useState(6);
  const [visibility, setVisibility] = useState<'pod' | 'university'>('pod');
  const [autoApprove, setAutoApprove] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag: string) => setTags((p) => p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag]);
  const addCustomTag = () => { const t = customTag.trim(); if (t && !tags.includes(t)) { setTags((p) => [...p, t]); setCustomTag(''); } };

  const handleCreate = async () => {
    if (!title.trim()) return Alert.alert('Error', 'Please enter an activity title');
    if (!podId) return Alert.alert('Error', 'No pod selected. Create activity from a Pod page.');
    if (!userProfile) return;
    setLoading(true);
    try {
      await createActivity({ podId, hostName: userProfile.displayName, title: title.trim(), category, tags, startTime: addHours(startHours), expiresAt: addHours(startHours + durationHours), maxParticipants, visibility, autoApprove, hostId: userProfile.uid }, userProfile.uid);
      navigation.goBack();
    } catch (err: any) { Alert.alert('Error', err.message); }
    finally { setLoading(false); }
  };

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={s.navHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="close" size={26} color={colors.text} /></TouchableOpacity>
          <Text style={s.navTitle}>Create Activity</Text>
          <TouchableOpacity onPress={handleCreate} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.primary} /> : <Text style={s.postBtn}>Post</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.field}>
            <Text style={s.label}>Activity Title *</Text>
            <TextInput style={s.input} placeholder="e.g. Study group for Organic Chem" placeholderTextColor={colors.subtext}
              value={title} onChangeText={setTitle} maxLength={80} />
          </View>

          <View style={s.field}>
            <Text style={s.label}>Category *</Text>
            <View style={s.chipsRow}>
              {ACTIVITY_CATEGORIES.map((cat) => (
                <CategoryChip key={cat} label={cat} selected={category === cat} onPress={() => setCategory(cat)} />
              ))}
            </View>
          </View>

          <View style={s.field}>
            <Text style={s.label}>Tags</Text>
            <View style={s.chipsRow}>
              {PREDEFINED_TAGS.slice(0, 8).map((tag) => (
                <TouchableOpacity key={tag} style={[s.tagChip, tags.includes(tag) && s.tagChipSelected]} onPress={() => toggleTag(tag)}>
                  <Text style={[s.tagChipText, tags.includes(tag) && s.tagChipTextSelected]}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={s.customTagRow}>
              <TextInput style={s.customTagInput} placeholder="Add custom tag..." placeholderTextColor={colors.subtext}
                value={customTag} onChangeText={setCustomTag} onSubmitEditing={addCustomTag} />
              <TouchableOpacity style={s.addTagBtn} onPress={addCustomTag}>
                <Ionicons name="add" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {[
            { label: 'Starts in (hours from now)', val: startHours, set: setStartHours, min: 0, hint: new Date(Date.now() + startHours * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
            { label: 'Duration (hours)', val: durationHours, set: setDurationHours, min: 1 },
            { label: `Max Participants: ${maxParticipants}`, val: maxParticipants, set: setMaxParticipants, min: 2, max: 20 },
          ].map(({ label, val, set, min, max, hint }) => (
            <View key={label} style={s.field}>
              <Text style={s.label}>{label}</Text>
              <View style={s.stepperRow}>
                <TouchableOpacity style={s.stepBtn} onPress={() => set(Math.max(min, val - 1))}>
                  <Ionicons name="remove" size={20} color={colors.primary} />
                </TouchableOpacity>
                <Text style={s.stepValue}>{val}{label.includes('hours') || label.includes('Starts') ? 'h' : ''}</Text>
                <TouchableOpacity style={s.stepBtn} onPress={() => set(max ? Math.min(max, val + 1) : val + 1)}>
                  <Ionicons name="add" size={20} color={colors.primary} />
                </TouchableOpacity>
                {hint && <Text style={s.stepHint}>{hint}</Text>}
              </View>
            </View>
          ))}

          <View style={s.field}>
            <Text style={s.label}>Visibility</Text>
            <View style={s.visibilityRow}>
              {(['pod', 'university'] as const).map((v) => (
                <TouchableOpacity key={v} style={[s.visBtn, visibility === v && s.visBtnSelected]} onPress={() => setVisibility(v)}>
                  <Text style={[s.visBtnText, visibility === v && s.visBtnTextSelected]}>
                    {v === 'pod' ? '🔒 Pod Only' : '🏫 University-Wide'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={s.switchRow}>
            <View style={s.switchInfo}>
              <Text style={s.switchLabel}>Auto-Approve</Text>
              <Text style={s.switchSub}>Skip join requests for pod members</Text>
            </View>
            <Switch value={autoApprove} onValueChange={setAutoApprove} trackColor={{ true: colors.primary }} thumbColor="#FFFFFF" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (c: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: c.border },
  navTitle: { fontSize: 17, fontWeight: '700', color: c.text },
  postBtn: { fontSize: 17, fontWeight: '700', color: c.primary },
  scroll: { padding: 20, paddingBottom: 60 },
  field: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: c.text, marginBottom: 10 },
  input: { backgroundColor: c.inputBackground, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 16, color: c.text, borderWidth: 1.5, borderColor: c.border },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tagChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1.5, borderColor: c.border, marginRight: 8, marginBottom: 8 },
  tagChipSelected: { backgroundColor: c.primary, borderColor: c.primary },
  tagChipText: { fontSize: 12, color: c.subtext, fontWeight: '500' },
  tagChipTextSelected: { color: '#FFFFFF' },
  customTagRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  customTagInput: { flex: 1, backgroundColor: c.inputBackground, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: c.text, borderWidth: 1.5, borderColor: c.border, marginRight: 8 },
  addTagBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: c.primaryGlow, alignItems: 'center', justifyContent: 'center' },
  stepperRow: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: c.primaryGlow, alignItems: 'center', justifyContent: 'center' },
  stepValue: { fontSize: 18, fontWeight: '700', color: c.text, marginHorizontal: 20, minWidth: 40, textAlign: 'center' },
  stepHint: { fontSize: 13, color: c.subtext, marginLeft: 12 },
  visibilityRow: { flexDirection: 'row', gap: 12 },
  visBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: c.card, borderWidth: 1.5, borderColor: c.border },
  visBtnSelected: { backgroundColor: c.primary, borderColor: c.primary },
  visBtnText: { fontSize: 14, fontWeight: '600', color: c.subtext },
  visBtnTextSelected: { color: '#FFFFFF' },
  switchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 12, padding: 16 },
  switchInfo: { flex: 1 },
  switchLabel: { fontSize: 15, fontWeight: '600', color: c.text },
  switchSub: { fontSize: 12, color: c.subtext, marginTop: 2 },
});
